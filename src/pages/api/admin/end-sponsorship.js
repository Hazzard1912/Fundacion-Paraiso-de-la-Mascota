export const prerender = false;

import { actions } from "astro:actions";

export async function POST(context) {
    const { request } = context;

    try {
        const data = await request.json();
        const { sponsorshipId } = data;

        if (!sponsorshipId) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "ID de padrinaje no proporcionado"
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        // Llama al action de Astro para terminar el padrinaje
        const result = await context.callAction(actions.endSponsorship, {
            sponsorshipId: parseInt(sponsorshipId)
        });

        return new Response(
            JSON.stringify({
                success: true,
                data: result.data
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    } catch (error) {
        console.error("Error al procesar la solicitud:", error);

        return new Response(
            JSON.stringify({
                success: false,
                error: error.message || "Error al terminar el padrinaje"
            }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }
}
