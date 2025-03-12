import { defineAction } from "astro:actions";
import { db, Pet, eq, and, desc, sql } from "astro:db";

export const getPets = defineAction({
    accept: 'json',
    async handler(_) {
        const pets = await db.select().from(Pet);
        return { pets };
    },
});

export const getPetsForAdoption = defineAction({
    accept: 'json',
    async handler(_) {
        const pets = await db.select().from(Pet).where(eq(Pet.isAdopted, false));
        return { pets };
    },
});

export const getPet = defineAction({
    accept: 'json',
    async handler({ id }) {
        const pet = await db.select().from(Pet).where(eq(Pet.id, id));
        return { pet };
    },
});

export const getFeaturedPets = defineAction({
    accept: 'json',
    async handler(_) {
        const pets = await db.select().from(Pet).orderBy(sql`RANDOM()`).limit(4);
        console.log(pets)
        return { pets };
    },
});


export const getPetsWithFilters = defineAction({
    accept: 'json',
    async handler({ request }) {
        const url = new URL(request.url);
        const especie = url.searchParams.get('especie');
        const tamaño = url.searchParams.get('tamaño');
        const edad = url.searchParams.get('edad');
        const sexo = url.searchParams.get('sexo');

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
            query = db.select().from(Pet).where(and(...conditions));
        } else {
            query = db.select().from(Pet);
        }

        const pets = await query;
        return { pets };
    },
});

// New action to fetch recently adopted pets
export const getLatestAdoptions = defineAction({
    accept: 'json',
    async handler({ limit = 3 }) {
        const adoptedPets = await db.select()
            .from(Pet)
            .where(eq(Pet.isAdopted, true))
            .orderBy(desc(Pet.adoptedDate))
            .limit(limit);

        return { adoptedPets };
    },
});