import { defineAction } from "astro:actions";
import { db, eq, and, desc, sql } from "astro:db";
import { Pet, AdoptionRequest, Adopter, PetAdoption } from "astro:db";
import { z } from "astro:schema";

// Action to create an adoption request
export const createAdoptionRequest = defineAction({
    accept: "form",
    input: z.object({
        petId: z.coerce.number().int().positive(),
        name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
        email: z.string().email("Email inválido"),
        phone: z.string().min(8, "El teléfono debe tener al menos 8 caracteres"),
        address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
        hasPets: z.string().default("no"),
        adoptionReason: z.string().min(10, "Por favor cuéntanos más sobre por qué quieres adoptar").max(1000).optional()
    }),
    async handler({ petId, name, email, phone, address, hasPets, adoptionReason }) {
        try {
            // Gestión del adoptante (crear o actualizar)
            let adopter = await db.select().from(Adopter).where(eq(Adopter.email, email)).limit(1).then(rows => rows[0]);

            if (adopter) {
                // Actualiza datos del adoptante si ya existe
                await db.update(Adopter)
                    .set({ name, phone, address })
                    .where(eq(Adopter.id, adopter.id));
            } else {
                // Crea nuevo adoptante
                const result = await db.insert(Adopter).values({
                    name, email, phone, address
                }).returning();
                adopter = result[0];
            }

            // Verifica si ya existe una solicitud pendiente
            const existingRequest = await db.select().from(AdoptionRequest)
                .where(and(
                    eq(AdoptionRequest.petId, petId),
                    eq(AdoptionRequest.adopterId, adopter.id),
                    eq(AdoptionRequest.status, 'pending')
                )).limit(1).then(rows => rows[0]);

            if (existingRequest) {
                return {
                    success: false,
                    message: "Ya has enviado una solicitud para esta mascota. Te contactaremos pronto."
                };
            }

            // Crea la solicitud de adopción
            const notes = JSON.stringify({
                hasPets,
                adoptionReason
            });

            await db.insert(AdoptionRequest).values({
                petId,
                adopterId: adopter.id,
                notes
            });

            return {
                success: true,
                message: "¡Solicitud enviada con éxito! Te contactaremos pronto para continuar el proceso."
            };
        } catch (error) {
            console.error("Error al procesar solicitud de adopción:", error);
            return {
                success: false,
                message: "Ocurrió un error al procesar tu solicitud. Por favor intenta nuevamente."
            };
        }
    }
});

// Action to update adoption request status (approve/reject)
export const updateAdoptionRequestStatus = defineAction({
    async handler({ requestId, status }) {
        const now = new Date();

        // Update request status
        await db.update(AdoptionRequest)
            .set({
                status,
                resolvedDate: now
            })
            .where(eq(AdoptionRequest.id, requestId));

        // If approved, create adoption record and update pet status
        if (status === 'approved') {

            const request = await db.select().from(AdoptionRequest)
                .where(eq(AdoptionRequest.id, requestId))
                .limit(1).then(rows => rows[0]);

            await db.insert(PetAdoption).values({
                petId: request.petId,
                adopterId: request.adopterId,
                adoptionDate: now
            });

            // Update pet status to adopted
            await db.update(Pet)
                .set({
                    isAdopted: true,
                    adoptedDate: now,
                    isAvailableForSponsorship: false
                })
                .where(eq(Pet.id, request.petId));
        }

        return {
            success: true,
            message: status === 'approved'
                ? "Solicitud aprobada y adopción registrada"
                : "Solicitud rechazada"
        };
    }
});

export const getAdoptionRequests = defineAction({
    async handler({ status, limit = 10 } = {}) {
        const query = db.select({
            requestId: AdoptionRequest.id,
            requestStatus: AdoptionRequest.status,
            requestDate: AdoptionRequest.requestDate,
            resolvedDate: AdoptionRequest.resolvedDate,
            petId: Pet.id,
            petName: Pet.name,
            petSpecies: Pet.species,
            petImageUrl: Pet.imageUrl,
            adopterName: Adopter.name,
            adopterEmail: Adopter.email,
            adopterPhone: Adopter.phone
        })
            .from(AdoptionRequest)
            .innerJoin(Pet, eq(AdoptionRequest.petId, Pet.id))
            .innerJoin(Adopter, eq(AdoptionRequest.adopterId, Adopter.id))
            .orderBy(desc(AdoptionRequest.requestDate))
            .limit(limit);

        if (status) {
            return await query.where(eq(AdoptionRequest.status, status));
        }

        return await query;
    }
});

// Action to get adoption statistics
export const getAdoptionStats = defineAction({
    async handler() {
        const adoptionsByMonth = await db.select({
            month: sql`strftime('%Y-%m', ${PetAdoption.adoptionDate})`,
            count: sql`count(*)`,
        })
            .from(PetAdoption)
            .groupBy(sql`strftime('%Y-%m', ${PetAdoption.adoptionDate})`)
            .orderBy(sql`strftime('%Y-%m', ${PetAdoption.adoptionDate})`);

        const pendingRequests = await db.select({
            count: sql`count(*)`,
        })
            .from(AdoptionRequest)
            .where(eq(AdoptionRequest.status, 'pending'));

        const adoptionsBySpecies = await db.select({
            species: Pet.species,
            count: sql`count(*)`,
        })
            .from(PetAdoption)
            .innerJoin(Pet, eq(PetAdoption.petId, Pet.id))
            .groupBy(Pet.species);

        return {
            adoptionsByMonth,
            pendingRequests: pendingRequests[0].count,
            adoptionsBySpecies
        };
    }
});