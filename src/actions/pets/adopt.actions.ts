import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { strapiService } from "../../lib/strapi";

// Action to create an adoption request
export const createAdoptionRequest = defineAction({
    
    accept: "form",
    input: z.object({
        pet: z.string().min(1, "Se requiere el ID de la mascota"), // documentId
        name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
        email: z.string().email("Email inválido"),
        phone: z.string().min(8, "El teléfono debe tener al menos 8 caracteres"),
        address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
        hasPets: z.string().default("no"),
        adoptionReason: z.string().min(10, "Por favor cuéntanos más sobre por qué quieres adoptar").max(1000)
    }),
    async handler({ pet, name, email, phone, address, hasPets, adoptionReason }) {
        try {
            // Enviar solicitud a Strapi
            const response = await strapiService.createAdoptionRequest({
                pet,
                name,
                email,
                phone,
                address,
                hasPets,
                adoptionReason
            });

            return response;
        } catch (error: any) {
            let message = "Ocurrió un error al procesar tu solicitud. Por favor intenta nuevamente.";
            if (error?.error?.message) {
                message = error.error.message;
            }
            return {
                success: false,
                message
            };
        }
    }
});
