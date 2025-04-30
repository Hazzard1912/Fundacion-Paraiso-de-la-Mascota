export const prerender = false; // Desactiva el prerenderizado para esta ruta

import { actions } from "astro:actions";

export async function POST(context) {
    const { request } = context;

    try {
        const data = await request.json();
        const { id } = data;

        if (!id) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "ID de adopción no proporcionado"
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        // Llama al action de Astro para eliminar la adopción
        const result = await context.callAction(actions.deleteAdoption, {
            id: parseInt(id)
        });

        return new Response(
            JSON.stringify({
                success: true,
                data: result
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
                error: error.message || "Error al eliminar la adopción"
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
