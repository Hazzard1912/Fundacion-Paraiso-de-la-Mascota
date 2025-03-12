import { defineMiddleware } from "astro:middleware";
import { getSession } from 'auth-astro/server';

export const onRequest = defineMiddleware(async ({ url, request, redirect }, next) => {
    const pathname = url.pathname;

    if (pathname.startsWith('/admin/')) {
        const session = await getSession(request);
        const isAuthenticated = !!session;

        if (!isAuthenticated && pathname !== '/admin/login') {
            return redirect('/admin/login');
        }

        if (isAuthenticated && pathname === '/admin/login') {
            return redirect('/admin/dashboard');
        }
    }

    return next();
});