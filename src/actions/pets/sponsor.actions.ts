import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { strapiService } from "../../lib/strapi";

// Action to create a sponsorship request
export const createSponsorRequest = defineAction({
    accept: "form",
    input: z.object({
        pet: z.string().min(1, "Se requiere el ID de la mascota"), // documentId
        name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
        email: z.string().email("Email inválido"),
        phone: z.string().min(8, "El teléfono debe tener al menos 8 caracteres"),
        address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
        monthlyAmount: z.coerce.number().positive("El monto debe ser positivo"),
    }),
    async handler({ pet, name, email, phone, address, monthlyAmount }) {
        try {
            // Enviar solicitud a Strapi
            const response = await strapiService.createSponsorRequest({
                pet,
                name,
                email,
                phone,
                address,
                monthlyAmount
            });

            console.log("Solicitud de apadrinamiento creada en Strapi:", response);

            return {
                success: true,
                message: "¡Solicitud de padrinazgo enviada con éxito! Nuestro equipo revisará tu solicitud y se pondrá en contacto contigo en un máximo de 48 horas."
            };
        } catch (error) {
            console.error("Error al procesar solicitud de padrinazgo:", error);
            
            return {
                success: false,
                message: "Ocurrió un error al procesar tu solicitud. Por favor intenta nuevamente."
            };
        }
    }
});
