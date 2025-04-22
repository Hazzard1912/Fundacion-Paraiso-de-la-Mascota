import { defineAction } from "astro:actions";
import { db, Pet, eq, and, desc, sql, PetAdoption, Adopter } from "astro:db";
import {} from "astro-cloudinary/helpers";
import { z } from "astro:schema";

export const getPets = defineAction({
  accept: "json",
  async handler(_) {
    const pets = await db.select().from(Pet);
    return { pets };
  },
});

export const getPetsForAdoption = defineAction({
  accept: "json",
  async handler(_) {
    const pets = await db.select().from(Pet).where(eq(Pet.isAdopted, false));
    return { pets };
  },
});

export const getPet = defineAction({
  accept: "json",
  async handler({ id }) {
    const pet = await db.select().from(Pet).where(eq(Pet.id, id));
    return { pet };
  },
});

export const getFeaturedPets = defineAction({
  accept: "json",
  async handler(_) {
    const pets = await db
      .select()
      .from(Pet)
      .orderBy(sql`RANDOM()`)
      .limit(4);
    console.log(pets);
    return { pets };
  },
});

export const getPetsWithFilters = defineAction({
  accept: "json",
  async handler({ request }) {
    const url = new URL(request.url);
    const especie = url.searchParams.get("especie");
    const tamaño = url.searchParams.get("tamaño");
    const edad = url.searchParams.get("edad");
    const sexo = url.searchParams.get("sexo");

    let conditions = [];

    if (especie) {
      conditions.push(eq(Pet.species, especie));
    }

    if (tamaño) {
      conditions.push(eq(Pet.size, tamaño));
    }

    if (edad) {
      conditions.push(eq(Pet.ageGroup, edad));
    }

    if (sexo) {
      conditions.push(eq(Pet.gender, sexo));
    }

    let query;

    if (conditions.length > 0) {
      query = db
        .select()
        .from(Pet)
        .where(and(...conditions));
    } else {
      query = db.select().from(Pet);
    }

    const pets = await query;
    return { pets };
  },
});

// New action to fetch recently adopted pets
export const getLatestAdoptions = defineAction({
  accept: "json",
  async handler({ limit = 3 }) {
    const adoptedPets = await db
      .select()
      .from(Pet)
      .where(eq(Pet.isAdopted, true))
      .orderBy(desc(Pet.adoptedDate))
      .limit(limit);

    return { adoptedPets };
  },
});

// New action to fetch all adoptions with detailed information
export const getAllAdoptions = defineAction({
  accept: "json",
  async handler() {
    const allAdoptions = await db
      .select({
        adoptionId: PetAdoption.id,
        adoptionDate: PetAdoption.adoptionDate,
        // Pet information
        petId: Pet.id,
        petName: Pet.name,
        petSpecies: Pet.species,
        petBreed: Pet.breed,
        petImageUrl: Pet.imageUrl,
        // Adopter information
        adopterId: Adopter.id,
        adopterName: Adopter.name,
        adopterEmail: Adopter.email,
        adopterPhone: Adopter.phone,
        adopterAddress: Adopter.address,
      })
      .from(PetAdoption)
      .innerJoin(Pet, eq(PetAdoption.petId, Pet.id))
      .innerJoin(Adopter, eq(PetAdoption.adopterId, Adopter.id))
      .orderBy(desc(PetAdoption.adoptionDate));

    return { allAdoptions };
  },
});

export const createPet = defineAction({
  accept: "form",
  input: z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    species: z.enum(["perro", "gato", "otro"], {
      errorMap: () => ({ message: "Especie inválida" }),
    }),
    gender: z.enum(["macho", "hembra"], {
      errorMap: () => ({ message: "Género inválido" }),
    }),
    ageGroup: z.enum(["cachorro", "joven", "adulto", "senior"], {
      errorMap: () => ({ message: "Grupo de edad inválido" }),
    }),
    breed: z.string().nullable().transform(val => val ?? ""),
    size: z.enum(["pequeño", "mediano", "grande"], {
      errorMap: () => ({ message: "Tamaño inválido" }),
    }),
    description: z.string().nullable().transform(val => val ?? ""),
    imageUrl: z.string().url("URL de imagen inválida").nullable().transform(val => val ?? ""),
    isAvailableForSponsorship: z.boolean().default(false),
  }),
  async handler({ name, species, gender, ageGroup, breed, size, description, imageUrl, isAvailableForSponsorship }) {
    try {
      const values = {
        name,
        species,
        gender,
        ageGroup,
        size,
        isAvailableForSponsorship,
        isAdopted: false,
        createdAt: new Date(),
        breed,
        description,
        imageUrl,
      };

      const newPet = await db.insert(Pet).values(values).returning();

      return {
        success: true,
        pet: newPet[0],
        message: "Mascota creada exitosamente"
      };
    } catch (error) {
      console.error("Error al crear mascota:", error);
      return {
        success: false,
        message: "Ocurrió un error al crear la mascota. Por favor intenta nuevamente."
      };
    }
  }
});
