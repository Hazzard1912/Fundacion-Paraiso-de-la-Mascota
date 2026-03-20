import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { strapiService } from "../../lib/strapi";
import { Resend } from "resend";
import AdminNotificationEmail from "../../emails/AdminNotification";
import AdopterConfirmationEmail from "../../emails/AdopterConfirmation";
import React from "react";

const resend = new Resend(import.meta.env.RESEND_API_KEY);

// Action to create an adoption request
export const createAdoptionRequest = defineAction({
    accept: "form",
    input: z.object({
        pet: z.string().min(1, "Se requiere el ID de la mascota"), // documentId
        petName: z.string().optional(),
        petImage: z.string().optional(),
        name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
        email: z.string().email("Email inválido"),
        phone: z.string().min(8, "El teléfono debe tener al menos 8 caracteres"),
        address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
        hasPets: z.string().default("no"),
        adoptionReason: z.string().min(10, "Por favor cuéntanos más sobre por qué quieres adoptar").max(1000)
    }),
    async handler({ pet, petName, petImage, name, email, phone, address, hasPets, adoptionReason }) {
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

            if (response.success && import.meta.env.RESEND_API_KEY) {
                try {
                    // Enviar emails en paralelo
                    await Promise.allSettled([
                        // Al administrador
                        resend.emails.send({
                            from: 'Fundación Paraíso de la Mascota <notificaciones@paraisodelamascota.org>',
                            to: 'paraisodelamascota@hotmail.com',
                            subject: `🐾 Nueva solicitud de adopción: ${petName || 'Mascota'}`,
                            react: React.createElement(AdminNotificationEmail, {
                                adopterName: name,
                                adopterEmail: email,
                                adopterPhone: phone,
                                adopterAddress: address,
                                adopterHasPets: hasPets === 'yes' ? 'Sí' : 'No',
                                adoptionReason: adoptionReason,
                                petName: petName || 'Mascota',
                                petImage: petImage
                            }),
                        }),
                        // Al adoptante (Confirmación)
                        resend.emails.send({
                            from: 'Fundación Paraíso de la Mascota <notificaciones@paraisodelamascota.org>',
                            to: email,
                            subject: `🐾 Recibimos tu solicitud para adoptar a ${petName || 'tu nueva mascota'}`,
                            react: React.createElement(AdopterConfirmationEmail, {
                                adopterName: name,
                                petName: petName || 'nuestra mascota',
                                petImage: petImage
                            }),
                        })
                    ]);
                } catch (emailError) {
                    console.error("Error sending notification emails:", emailError);
                }
            }

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
