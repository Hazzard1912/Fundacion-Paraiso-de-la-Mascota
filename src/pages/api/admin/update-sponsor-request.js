export const prerender = false;

import { actions } from "astro:actions";

export async function POST(context) {
    const { request } = context;

    try {
        const data = await request.json();
        const { requestId, status } = data;

        console.log("Actualizando solicitud de apadrinamiento:", requestId, "a estado:", status);

        if (!requestId || !status) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "ID de solicitud o estado no proporcionado"
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        // Validar que el estado sea válido
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "Estado de solicitud inválido"
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        // Llama al action de Astro para actualizar la solicitud
        const result = await context.callAction(actions.updateSponsorRequestStatus, {
            requestId: parseInt(requestId),
            status: status
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
                error: error.message || "Error al actualizar la solicitud"
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
