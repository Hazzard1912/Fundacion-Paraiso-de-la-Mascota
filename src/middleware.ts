import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  
  // Si ya estamos en la página de mantenimiento, permitir el acceso para evitar bucle infinito
  // También permitimos acceso a assets (imágenes, CSS, JS) para que la página se vea bien
  if (
    url.pathname === "/mantenimiento" || 
    url.pathname.startsWith("/_astro") || 
    url.pathname.startsWith("/images") ||
    url.pathname.startsWith("/_image") ||
    url.pathname.startsWith("/favicon") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") || 
    url.pathname.endsWith(".css") || 
    url.pathname.endsWith(".js")
  ) {
    return next();
  }

  // Redirigir todas las demás rutas a /mantenimiento
  return context.redirect("/mantenimiento");
});
