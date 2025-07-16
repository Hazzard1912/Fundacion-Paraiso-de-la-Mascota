import { createAdoptionRequest } from "./pets/adopt.actions"
import { createSponsorRequest } from "./pets/sponsor.actions"
import { getHeroData, getSlidesData, getFeaturedPets, getLatestAdoptions, getPetsForAdoption, getPet, getMisionData, getHistoriaData, getTestimoniosData, getFAQData, getNoticiasData, getNoticiaBySlugData } from "./cms.actions"

export const server = {
    // Adoption request actions
    createAdoptionRequest,

    // Sponsor actions
    createSponsorRequest,

    // CMS actions
    getHeroData,
    getSlidesData,
    getFeaturedPets,
    getLatestAdoptions,
    getPetsForAdoption,
    getPet,
    getMisionData,
    getHistoriaData,
    getTestimoniosData,
    getFAQData,
    getNoticiasData,
    getNoticiaBySlugData,
}