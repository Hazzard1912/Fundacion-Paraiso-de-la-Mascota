import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { strapiService } from "../../lib/strapi";
import { Resend } from "resend";
import AdminSponsorNotificationEmail from "../../emails/AdminSponsorNotification";
import SponsorConfirmationEmail from "../../emails/SponsorConfirmation";
import React from "react";

const resend = new Resend(import.meta.env.RESEND_API_KEY);

// Action to create a sponsorship request
export const createSponsorRequest = defineAction({
    accept: "form",
    input: z.object({
        pet: z.string().min(1, "Se requiere el ID de la mascota"), // documentId
        petName: z.string().optional(),
        petImage: z.string().optional(),
        name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
        email: z.string().email("Email inválido"),
        phone: z.string().min(8, "El teléfono debe tener al menos 8 caracteres"),
        address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
        monthlyAmount: z.coerce.number().positive("El monto debe ser positivo"),
        message: z.string().optional(),
    }),
    async handler({ pet, petName, petImage, name, email, phone, address, monthlyAmount, message }) {
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

            if (response.success && import.meta.env.RESEND_API_KEY) {
                try {
                    // Enviar emails en paralelo
                    await Promise.allSettled([
                        // Al administrador
                        resend.emails.send({
                            from: 'Fundación Paraíso de la Mascota <notificaciones@paraisodelamascota.org>',
                            to: 'paraisodelamascota@hotmail.com',
                            subject: `💖 Nueva solicitud de apadrinamiento: ${petName || 'Mascota'}`,
                            react: React.createElement(AdminSponsorNotificationEmail, {
                                sponsorName: name,
                                sponsorEmail: email,
                                sponsorPhone: phone,
                                petName: petName || 'Mascota',
                                petImage: petImage,
                                message: message
                            }),
                        }),
                        // Al padrino/madrina (Confirmación)
                        resend.emails.send({
                            from: 'Fundación Paraíso de la Mascota <notificaciones@paraisodelamascota.org>',
                            to: email,
                            subject: `💖 Gracias por tu interés en apadrinar a ${petName || 'nuestra mascota'}`,
                            react: React.createElement(SponsorConfirmationEmail, {
                                sponsorName: name,
                                petName: petName || 'nuestra mascota',
                                petImage: petImage
                            }),
                        })
                    ]);
                } catch (emailError) {
                    console.error("Error sending sponsorship notification emails:", emailError);
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
