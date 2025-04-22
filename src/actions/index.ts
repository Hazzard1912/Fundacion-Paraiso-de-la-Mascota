import { getDashboardStats, getRecentActivity } from "./dashboard/stats.action"
import { getFeaturedPets, getLatestAdoptions, getPet, getPets, getPetsForAdoption, getPetsWithFilters, createPet, createAdoptionRequest, createSponsorRequest, getAdoptionRequests, getSponsorRequests, getAllAdoptions, updateSponsorRequestStatus, updateAdoptionRequestStatus, getAllActiveSponsorships, endSponsorship, getAdopterDetailsByAdoptionId, updateAdopterDetails, getSlides, activateSlide, deactivateSlide, createSlide, updateSlide } from "./pets"

export const server = {
    // Pet actions
    getPets,
    getPetsForAdoption,
    getPet,
    getFeaturedPets,
    getPetsWithFilters,
    createPet,

    // Adoption actions
    getLatestAdoptions,
    getAllAdoptions,
    getAdopterDetailsByAdoptionId,
    updateAdopterDetails,

    // Adoption request actions
    getAdoptionRequests,
    createAdoptionRequest,
    updateAdoptionRequestStatus,

    // Sponsor actions
    getSponsorRequests,
    createSponsorRequest,
    updateSponsorRequestStatus,
    getAllActiveSponsorships,
    endSponsorship,

    // Dashboard actions
    getDashboardStats,
    getRecentActivity,

    // Slide actions
    getSlides,
    createSlide,
    updateSlide,
    activateSlide,
    deactivateSlide,
}