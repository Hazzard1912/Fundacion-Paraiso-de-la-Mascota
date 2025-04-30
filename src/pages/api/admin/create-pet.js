export const prerender = false;

import { actions } from "astro:actions";

export async function POST(context) {
    const { request } = context;
    const petData = await request.json();
    try {
        const result = await context.callAction(actions.createPet, petData);
        return new Response(JSON.stringify(result), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message || 'Error al crear la mascota' }), { status: 500 });
    }
}