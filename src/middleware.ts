import { clerkMiddleware, createRouteMatcher, getAuth } from '@clerk/nextjs/server';
import { routeAccessMap } from './lib/settings';
import { NextResponse } from 'next/server';

const matchers = Object.keys(routeAccessMap).map((route) => ({
    matcher: createRouteMatcher(route),
    allowedRoles: routeAccessMap[route],
}))

export default clerkMiddleware((auth, req) => {

    const { sessionClaims } = auth();

    const role = (sessionClaims?.metadata as { role?: string })?.role;

    for (const { matcher, allowedRoles } of matchers) {
        if (matcher(req) && !allowedRoles.includes(role!)) {
            return NextResponse.redirect(new URL(`/${role}`, req.url));
        }
    }
});

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};