import { db, Slide, eq } from 'astro:db';
import { defineAction } from 'astro:actions';

export const createSlide = defineAction({
    accept: 'json',
    async handler({ imageUrl }) {
        try {
            const newSlide = await db.insert(Slide).values({ imageUrl }).returning().execute();
            return { success: true, slide: newSlide };
        } catch (error) {
            console.error('Error al crear slide:', error);
            return { success: false, error: 'Error al crear el slide' };
        }
    }
});

export const updateSlide = defineAction({
    accept: 'json',
    async handler({ id, imageUrl }) {
        try {
            const updatedSlide = await db.update(Slide).set({ imageUrl }).where(eq(Slide.id, id)).returning().execute();
            return { success: true, slide: updatedSlide };
        } catch (error) {
            console.error('Error al actualizar slide:', error);
            return { success: false, error: 'Error al actualizar el slide' };
        }
    }
});

export const getSlides = defineAction({
    accept: 'json',
    async handler(_) {
        try {
            const slides = await db.select().from(Slide).orderBy(Slide.id);
            return { success: true, slides };
        } catch (error) {
            console.error('Error al obtener slides:', error);
            return { success: false, error: 'Error al cargar los slides' };
        }
    }
});

export const activateSlide = defineAction({
    // Type-safe input validation
    accept: 'json',
    async handler({ id }) {
        try {
            await db.update(Slide).set({ active: true }).where(eq(Slide.id, id));
            return { success: true };
        } catch (error) {
            console.error('Error al activar slide:', error);
            return { success: false, error: 'Error al activar el slide' };
        }
    }
});

export const deactivateSlide = defineAction({
    accept: 'json',
    async handler({ id }) {
        try {
            await db.update(Slide).set({ active: false }).where(eq(Slide.id, id));
            return { success: true };
        } catch (error) {
            console.error('Error al desactivar slide:', error);
            return { success: false, error: 'Error al desactivar el slide' };
        }
    }
});

// Agrega esto a tu archivo de acciones
export async function getActiveSlides() {
    try {
        // Suponiendo que tienes una función que obtiene los slides de tu base de datos
        const slides = await db.select().from(Slide).where(eq(Slide.active, true)).orderBy(Slide.id);
        
        return {
            data: { slides }
        };
    } catch (error) {
        console.error("Error getting active slides:", error);
        return {
            error: "Failed to fetch active slides"
        };
    }
}