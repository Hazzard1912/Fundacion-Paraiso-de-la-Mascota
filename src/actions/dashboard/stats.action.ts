import { defineAction } from "astro:actions";
import { db, Pet, AdoptionRequest, SponsorRequest, PetAdoption, ActiveSponsorship, Sponsor } from "astro:db";
import { eq, desc, sql } from "astro:db";

// Comprehensive dashboard statistics action
export const getDashboardStats = defineAction({
    async handler() {
        try {
            // Pet statistics
            const totalPets = await db.select({ count: sql`count(*)` }).from(Pet);
            const adoptedPets = await db.select({ count: sql`count(*)` }).from(Pet).where(eq(Pet.isAdopted, true));
            const availablePets = await db.select({ count: sql`count(*)` }).from(Pet).where(eq(Pet.isAdopted, false));

            // Request statistics
            const pendingAdoptions = await db.select({ count: sql`count(*)` })
                .from(AdoptionRequest)
                .where(eq(AdoptionRequest.status, 'pending'));

            const pendingSponsorships = await db.select({ count: sql`count(*)` })
                .from(SponsorRequest)
                .where(eq(SponsorRequest.status, 'pending'));

            // Recent adoptions with pet and adopter details
            const recentAdoptions = await db.select({
                id: PetAdoption.id,
                petId: PetAdoption.petId,
                petName: Pet.name,
                adopterId: PetAdoption.adopterId,
                adoptionDate: PetAdoption.adoptionDate,
            })
                .from(PetAdoption)
                .innerJoin(Pet, eq(PetAdoption.petId, Pet.id))
                .orderBy(desc(PetAdoption.adoptionDate))
                .limit(5);

            // Sponsorship statistics
            const activeSponsors = await db.select({
                count: sql`COUNT(DISTINCT ${Sponsor.id})`
            })
                .from(ActiveSponsorship)
                .innerJoin(Sponsor, eq(ActiveSponsorship.sponsorId, Sponsor.id))
                .where(sql`${ActiveSponsorship.endDate} IS NULL`);

            // Adoption statistics by month (last 6 months)
            const adoptionsByMonth = await db.select({
                month: sql`strftime('%Y-%m', ${PetAdoption.adoptionDate})`,
                count: sql`count(*)`,
            })
                .from(PetAdoption)
                .groupBy(sql`strftime('%Y-%m', ${PetAdoption.adoptionDate})`)
                .orderBy(sql`strftime('%Y-%m', ${PetAdoption.adoptionDate})`)
                .limit(6);

            return {
                success: true,
                stats: {
                    totalPets: totalPets[0]?.count || 0,
                    adoptedPets: adoptedPets[0]?.count || 0,
                    availablePets: availablePets[0]?.count || 0,
                    pendingAdoptions: pendingAdoptions[0]?.count || 0,
                    pendingSponsorships: pendingSponsorships[0]?.count || 0,
                    totalSponsors: activeSponsors[0]?.count || 0,
                    recentAdoptions,
                    adoptionsByMonth
                }
            };
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            return {
                success: false,
                error: "Error fetching dashboard statistics"
            };
        }
    }
});

// Get recent activity for the dashboard
export const getRecentActivity = defineAction({
    async handler() {
        try {
            // Recent adoptions
            const recentAdoptions = await db.select({
                id: PetAdoption.id,
                type: sql`'adoption'`,
                petId: PetAdoption.petId,
                petName: Pet.name,
                date: PetAdoption.adoptionDate,
            })
                .from(PetAdoption)
                .innerJoin(Pet, eq(PetAdoption.petId, Pet.id))
                .orderBy(desc(PetAdoption.adoptionDate))
                .limit(3);

            // Recent adoption requests
            const recentAdoptionRequests = await db.select({
                id: AdoptionRequest.id,
                type: sql`'adoption_request'`,
                petId: AdoptionRequest.petId,
                petName: Pet.name,
                date: AdoptionRequest.requestDate,
                status: AdoptionRequest.status
            })
                .from(AdoptionRequest)
                .innerJoin(Pet, eq(AdoptionRequest.petId, Pet.id))
                .orderBy(desc(AdoptionRequest.requestDate))
                .limit(3);

            // Recent sponsorship requests
            const recentSponsorRequests = await db.select({
                id: SponsorRequest.id,
                type: sql`'sponsor_request'`,
                petId: SponsorRequest.petId,
                petName: Pet.name,
                date: SponsorRequest.requestDate,
                status: SponsorRequest.status
            })
                .from(SponsorRequest)
                .innerJoin(Pet, eq(SponsorRequest.petId, Pet.id))
                .orderBy(desc(SponsorRequest.requestDate))
                .limit(3);

            // Combine and sort by date (most recent first)
            const allActivity = [
                ...recentAdoptions,
                ...recentAdoptionRequests,
                ...recentSponsorRequests
            ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5);

            return {
                success: true,
                recentActivity: allActivity
            };
        } catch (error) {
            console.error("Error fetching recent activity:", error);
            return {
                success: false,
                error: "Error fetching recent activity"
            };
        }
    }
});
