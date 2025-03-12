import { defineAction } from "astro:actions";
import { db, eq, and, desc, sql } from "astro:db";
import { Pet, SponsorRequest, Sponsor, ActiveSponsorship } from "astro:db";
import { z } from "astro:schema";

// Action to create a sponsorship request
export const createSponsorRequest = defineAction({
    accept: "form",
    input: z.object({
        petId: z.coerce.number().int().positive(),
        name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
        email: z.string().email("Email inválido"),
        phone: z.string().min(8, "El teléfono debe tener al menos 8 caracteres"),
        address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
        monthlyAmount: z.coerce.number().positive("El monto debe ser positivo"),
    }),
    async handler({ petId, name, email, phone, address, monthlyAmount }) {
        try {
            // Gestión del sponsor (crear o actualizar)
            let sponsor = await db.select().from(Sponsor).where(eq(Sponsor.email, email)).limit(1).then(rows => rows[0]);

            if (sponsor) {
                // Actualiza datos del sponsor si ya existe
                await db.update(Sponsor)
                    .set({ name, phone, address })
                    .where(eq(Sponsor.id, sponsor.id));
            } else {
                // Crea nuevo sponsor
                const result = await db.insert(Sponsor).values({
                    name, email, phone, address
                }).returning();
                sponsor = result[0];
            }

            // Verifica si ya existe una solicitud pendiente
            const existingRequest = await db.select().from(SponsorRequest)
                .where(and(
                    eq(SponsorRequest.petId, petId),
                    eq(SponsorRequest.sponsorId, sponsor.id),
                    eq(SponsorRequest.status, 'pending')
                )).limit(1).then(rows => rows[0]);

            if (existingRequest) {
                return {
                    success: false,
                    message: "Ya has enviado una solicitud de padrinazgo para esta mascota. Te contactaremos pronto."
                };
            }

            // Crea la solicitud de padrinazgo
            await db.insert(SponsorRequest).values({
                petId,
                sponsorId: sponsor.id,
                monthlyAmount
            });

            return {
                success: true,
                message: "¡Solicitud de padrinazgo enviada con éxito! Te contactaremos pronto para continuar el proceso."
            };
        } catch (error) {
            console.error("Error al procesar solicitud de padrinazgo:", error);
            return {
                success: false,
                message: "Ocurrió un error al procesar tu solicitud. Por favor intenta nuevamente."
            };
        }
    }
});

// Action to update sponsorship request status (approve/reject)
export const updateSponsorRequestStatus = defineAction({
    input: z.object({
        requestId: z.coerce.number().int().positive(),
        status: z.enum(['approved', 'rejected'])
    }),
    async handler({ requestId, status }) {
        const now = new Date();

        // Update request status
        await db.update(SponsorRequest)
            .set({
                status,
                resolvedDate: now
            })
            .where(eq(SponsorRequest.id, requestId));

        // If approved, create active sponsorship and update pet status
        if (status === 'approved') {
            const request = await db.select().from(SponsorRequest)
                .where(eq(SponsorRequest.id, requestId))
                .limit(1).then(rows => rows[0]);

            await db.insert(ActiveSponsorship).values({
                petId: request.petId,
                sponsorId: request.sponsorId,
                monthlyAmount: request.monthlyAmount,
                startDate: now
            });

            // Update pet to show it has sponsorship
            await db.update(Pet)
                .set({
                    isSponsored: true
                })
                .where(eq(Pet.id, request.petId));
        }

        return {
            success: true,
            message: status === 'approved'
                ? "Solicitud aprobada y padrinazgo activado"
                : "Solicitud rechazada"
        };
    }
});

// Action to get sponsorship requests
export const getSponsorRequests = defineAction({
    input: z.object({
        status: z.enum(['pending', 'approved', 'rejected']).optional(),
        limit: z.coerce.number().int().positive().default(10)
    }).optional(),
    async handler(input = { status: 'pending', limit: 10 }) {
        const { status, limit } = input;
        const query = db.select({
            requestId: SponsorRequest.id,
            requestStatus: SponsorRequest.status,
            requestDate: SponsorRequest.requestDate,
            resolvedDate: SponsorRequest.resolvedDate,
            monthlyAmount: SponsorRequest.monthlyAmount,
            petId: Pet.id,
            petName: Pet.name,
            petSpecies: Pet.species,
            petImageUrl: Pet.imageUrl,
            sponsorName: Sponsor.name,
            sponsorEmail: Sponsor.email,
            sponsorPhone: Sponsor.phone
        })
            .from(SponsorRequest)
            .innerJoin(Pet, eq(SponsorRequest.petId, Pet.id))
            .innerJoin(Sponsor, eq(SponsorRequest.sponsorId, Sponsor.id))
            .orderBy(desc(SponsorRequest.requestDate))
            .limit(limit);

        if (status) {
            return await query.where(eq(SponsorRequest.status, status));
        }

        return await query;
    }
});

// Action to end a sponsorship
export const endSponsorship = defineAction({
    input: z.object({
        sponsorshipId: z.coerce.number().int().positive()
    }),
    async handler({ sponsorshipId }) {
        const now = new Date();

        const sponsorship = await db.select().from(ActiveSponsorship)
            .where(eq(ActiveSponsorship.id, sponsorshipId))
            .limit(1).then(rows => rows[0]);

        if (!sponsorship) {
            return {
                success: false,
                message: "Padrinazgo no encontrado"
            };
        }

        // End the sponsorship
        await db.update(ActiveSponsorship)
            .set({
                endDate: now
            })
            .where(eq(ActiveSponsorship.id, sponsorshipId));

        // Check if there are other active sponsorships for this pet
        const activeCount = await db.select({ count: sql`count(*)` })
            .from(ActiveSponsorship)
            .where(and(
                eq(ActiveSponsorship.petId, sponsorship.petId),
                sql`${ActiveSponsorship.endDate} IS NULL`
            ))
            .then(rows => rows[0].count);

        // If no more active sponsorships, update pet status
        if (activeCount === 0) {
            await db.update(Pet)
                .set({
                    isSponsored: false
                })
                .where(eq(Pet.id, sponsorship.petId));
        }

        return {
            success: true,
            message: "Padrinazgo finalizado correctamente"
        };
    }
});

// Action to get sponsorship statistics
export const getSponsorshipStats = defineAction({
    async handler() {
        // Count active sponsorships
        const activeCount = await db.select({
            count: sql`count(*)`,
        })
            .from(ActiveSponsorship)
            .where(sql`${ActiveSponsorship.endDate} IS NULL`);

        // Sum monthly amounts for active sponsorships
        const totalMonthly = await db.select({
            sum: sql`SUM(${ActiveSponsorship.monthlyAmount})`,
        })
            .from(ActiveSponsorship)
            .where(sql`${ActiveSponsorship.endDate} IS NULL`);

        // Sponsorships by species
        const sponsorshipsBySpecies = await db.select({
            species: Pet.species,
            count: sql`count(*)`,
        })
            .from(ActiveSponsorship)
            .innerJoin(Pet, eq(ActiveSponsorship.petId, Pet.id))
            .where(sql`${ActiveSponsorship.endDate} IS NULL`)
            .groupBy(Pet.species);

        // Sponsorship start dates by month
        const sponsorshipsByMonth = await db.select({
            month: sql`strftime('%Y-%m', ${ActiveSponsorship.startDate})`,
            count: sql`count(*)`,
        })
            .from(ActiveSponsorship)
            .groupBy(sql`strftime('%Y-%m', ${ActiveSponsorship.startDate})`)
            .orderBy(sql`strftime('%Y-%m', ${ActiveSponsorship.startDate})`);

        return {
            activeCount: activeCount[0].count,
            totalMonthlyAmount: totalMonthly[0].sum || 0,
            sponsorshipsBySpecies,
            sponsorshipsByMonth
        };
    }
});

// Action to get active sponsorships for a pet
export const getPetSponsorships = defineAction({
    input: z.object({
        petId: z.coerce.number().int().positive(),
    }),
    async handler({ petId }) {
        return await db.select({
            id: ActiveSponsorship.id,
            startDate: ActiveSponsorship.startDate,
            monthlyAmount: ActiveSponsorship.monthlyAmount,
            sponsorName: Sponsor.name,
        })
            .from(ActiveSponsorship)
            .innerJoin(Sponsor, eq(ActiveSponsorship.sponsorId, Sponsor.id))
            .where(and(
                eq(ActiveSponsorship.petId, petId),
                sql`${ActiveSponsorship.endDate} IS NULL`
            ));
    }
});
