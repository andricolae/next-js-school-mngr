import { clerkMiddleware, createRouteMatcher, getAuth } from '@clerk/nextjs/server';
import { routeAccessMap } from './lib/settings';
import { NextResponse } from 'next/server';
import { TokenData } from "@/lib/utils";

const matchers = Object.keys(routeAccessMap).map((route) => ({
    matcher: createRouteMatcher(route),
    allowedRoles: routeAccessMap[route],
}))

export default clerkMiddleware(async (auth, req) => {
    const { sessionClaims } = await auth();

    let tokenData;
    if (sessionClaims !== null) {
        tokenData = sessionClaims as unknown as TokenData;
    }
    let role = tokenData?.userPblcMtdt?.role;

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