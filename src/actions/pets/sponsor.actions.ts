import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { strapiService } from "../../lib/strapi";

// Action to create a sponsorship request
export const createSponsorRequest = defineAction({
    accept: "form",
    input: z.object({
        petId: z.coerce.number().int().positive(),
        name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
        email: z.string().email("Email inválido"),
        phone: z.string().min(8, "El teléfono debe tener al menos 8 caracteres"),
        address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
        monthlyAmount: z.coerce.number().positive("El monto debe ser positivo"),
    }),
    async handler({ petId, name, email, phone, address, monthlyAmount }) {
        try {
            // Enviar solicitud a Strapi
            const response = await strapiService.createSponsorRequest({
                petId,
                name,
                email,
                phone,
                address,
                monthlyAmount
            });

            console.log("Solicitud de apadrinamiento creada en Strapi:", response);

            return {
                success: true,
                message: "¡Solicitud de padrinazgo enviada con éxito! Te contactaremos pronto para continuar el proceso."
            };
        } catch (error) {
            console.error("Error al procesar solicitud de padrinazgo:", error);
            
            // Manejar errores específicos de Strapi
            if (error instanceof Error) {
                if (error.message.includes('duplicate') || error.message.includes('already exists')) {
                    return {
                        success: false,
                        message: "Ya has enviado una solicitud de padrinazgo para esta mascota. Te contactaremos pronto."
                    };
                }
            }
            
            return {
                success: false,
                message: "Ocurrió un error al procesar tu solicitud. Por favor intenta nuevamente."
            };
        }
    }
});
