import { defineDb } from 'astro:db';
import { ActiveSponsorship, Adopter, AdoptionRequest, Pet, PetAdoption, Sponsor, SponsorRequest, User } from './schema';

// https://astro.build/db/config
export default defineDb({
  tables: {
    User,
    Pet,
    Adopter,
    Sponsor,
    AdoptionRequest,
    SponsorRequest,
    ActiveSponsorship,
    PetAdoption,
  }
});
