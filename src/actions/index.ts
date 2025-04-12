import { getDashboardStats, getRecentActivity } from "./dashboard/stats.action"
import { getFeaturedPets, getLatestAdoptions, getPet, getPets, getPetsForAdoption, getPetsWithFilters, createAdoptionRequest, createSponsorRequest, getAdoptionRequests, getSponsorRequests, getAllAdoptions, updateSponsorRequestStatus, updateAdoptionRequestStatus } from "./pets"

export const server = {
    // Pet actions
    getPets,
    getPetsForAdoption,
    getPet,
    getFeaturedPets,
    getPetsWithFilters,

    // Adoption actions
    getLatestAdoptions,
    getAllAdoptions,

    // Adoption request actions
    getAdoptionRequests,
    createAdoptionRequest,
    updateAdoptionRequestStatus,

    // Sponsor actions
    getSponsorRequests,
    createSponsorRequest,
    updateSponsorRequestStatus,

    // Dashboard actions
    getDashboardStats,
    getRecentActivity,
}