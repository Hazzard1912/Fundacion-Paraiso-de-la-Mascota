import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();

  // Solo aplicar caché a peticiones GET que no sean formularios
  if (context.request.method !== "GET") return response;

  const { pathname } = context.url;

  // Excluir rutas de formularios (adoptar / apadrinar)
  if (pathname.endsWith("/adoptar") || pathname.endsWith("/apadrinar")) {
    return response;
  }

  // No sobreescribir si el handler ya definió Cache-Control
  if (!response.headers.has("Cache-Control")) {
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=600, stale-while-revalidate=30"
    );
  }

  return response;
});
