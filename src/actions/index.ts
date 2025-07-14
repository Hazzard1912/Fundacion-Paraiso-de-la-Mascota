import { createAdoptionRequest } from "./pets/adopt.actions"
import { createSponsorRequest } from "./pets/sponsor.actions"
import { getHeroData, getSlidesData, getFeaturedPets } from "./cms.actions"

export const server = {
    // Adoption request actions
    createAdoptionRequest,

    // Sponsor actions
    createSponsorRequest,

    // CMS actions
    getHeroData,
    getSlidesData,
    getFeaturedPets,
}