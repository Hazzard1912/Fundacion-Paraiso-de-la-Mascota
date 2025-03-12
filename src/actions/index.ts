import { getFeaturedPets, getLatestAdoptions, getPet, getPets, getPetsForAdoption, getPetsWithFilters, createAdoptionRequest, createSponsorRequest } from "./pets"

export const server = {
    getPets,
    getPetsForAdoption,
    getPet,
    getFeaturedPets,
    getPetsWithFilters,
    getLatestAdoptions,
    createAdoptionRequest,
    createSponsorRequest,
}