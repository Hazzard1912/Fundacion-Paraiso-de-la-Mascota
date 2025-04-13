import { defineTable, column } from 'astro:db';

// Define User table
export const User = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    username: column.text({ unique: true }),
    password: column.text(),
    isSuperAdmin: column.boolean({ default: false }),
    createdAt: column.date({ default: new Date() })
  }
});

// Define Pet table with new adoptedDate field
export const Pet = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    name: column.text(),
    species: column.text(), // "Perro", "Gato"
    size: column.text(), // "Pequeño", "Mediano", "Grande"
    ageGroup: column.text(), // "Cachorro", "Joven", "Adulto", "Senior"
    gender: column.text(), // "Macho", "Hembra"
    breed: column.text(),
    description: column.text({ optional: true }),
    imageUrl: column.text(),
    isAdopted: column.boolean({ default: false }),
    adoptedDate: column.date({ optional: true }), // New field to track adoption date
    isAvailableForSponsorship: column.boolean({ default: true }),
    createdAt: column.date({ default: new Date() })
  }
});

// Define Adopter table
export const Adopter = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    name: column.text(),
    email: column.text({ unique: true }),
    phone: column.text(),
    address: column.text(),
    createdAt: column.date({ default: new Date() })
  }
});

// Define AdoptionRequest table
export const AdoptionRequest = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    petId: column.number({ references: () => Pet.columns.id }),
    adopterId: column.number({ references: () => Adopter.columns.id }),
    status: column.text({ default: 'pending' }), // pending, approved, rejected
    requestDate: column.date({ default: new Date() }),
    resolvedDate: column.date({ optional: true })
  }
});

export const PetAdoption = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    petId: column.number({ references: () => Pet.columns.id }),
    adopterId: column.number({ references: () => Adopter.columns.id }),
    adoptionDate: column.date({ default: new Date() })
  }
});

// Define Sponsor table (padrinos)
export const Sponsor = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    name: column.text(),
    email: column.text({ unique: true }),
    phone: column.text(),
    address: column.text(),
    createdAt: column.date({ default: new Date() })
  }
});

// Define Slide table for homepage carousel
export const Slide = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    imageUrl: column.text({ optional: true }),
    active: column.boolean({ default: true }),
    createdAt: column.date({ default: new Date() })
  }
});

// Define SponsorRequest table
export const SponsorRequest = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    petId: column.number({ references: () => Pet.columns.id }),
    sponsorId: column.number({ references: () => Sponsor.columns.id }),
    monthlyAmount: column.number(),
    status: column.text({ default: 'pending' }), // pending, approved, rejected
    requestDate: column.date({ default: new Date() }),
    resolvedDate: column.date({ optional: true })
  }
});

// Define active sponsorships (padrinos actuales)
export const ActiveSponsorship = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    petId: column.number({ references: () => Pet.columns.id }),
    sponsorId: column.number({ references: () => Sponsor.columns.id }),
    monthlyAmount: column.number(),
    startDate: column.date({ default: new Date() }),
    endDate: column.date({ optional: true })
  }
});

