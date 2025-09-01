'use client'

import { TranslatedFieldError, TranslatedGlobalError } from '@/components/ClerkTranslatedErrors'
import * as Clerk from '@clerk/elements/common'
import * as SignIn from '@clerk/elements/sign-in'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTransition } from "react";

const LoginPage = () => {
    const { isLoaded, isSignedIn, user } = useUser();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            sessionStorage.clear()

            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('clerk-')) {
                    localStorage.removeItem(key)
                }
            })
        }
        setHasCheckedAuth(true)
    }, [])

    useEffect(() => {
        if (!hasCheckedAuth || !isLoaded || isRedirecting) return;

        if (isSignedIn && user) {
            const role = user?.publicMetadata.role;
            if (role) {
                setIsRedirecting(true);
                startTransition(() => {
                    if (typeof window !== 'undefined') {
                        sessionStorage.clear()
                    }
                    router.push(`/${role}`);
                });
            }
        }
    }, [isLoaded, isSignedIn, user, router, hasCheckedAuth, isRedirecting]);

    if (!hasCheckedAuth || !isLoaded || isRedirecting || isPending) {
        return (
            <div className='h-screen flex items-center justify-center bg-slate-100'>
                <div className="flex items-center gap-2">
                    <Image src="/logo.png" alt="logo" width={32} height={32} />
                    <span className="text-gray-600">Se încarcă...</span>
                </div>
            </div>
        )
    }

    return (
        <div className='h-screen flex items-center justify-center bg-slate-100'>
            <SignIn.Root>
                <SignIn.Step name='start' className='bg-lime-50 p-12 rounded-md shadow-2xl flex flex-col gap-2'>
                    <h1 className='text-xl font-bold flex items-center gap-2'>
                        <Image src="/logo.png" alt="logo" width={32} height={32} />
                        Smart Class
                    </h1>
                    <h2 className='text-gray-400'>Introduceți credențialele pentru a vă autentifica</h2>

                    {/* <Clerk.GlobalError className='text-sm text-red-400' /> */}
                    <TranslatedGlobalError className="text-sm text-red-400" />

                    <Clerk.Field name="identifier" className='flex flex-col gap-2'>
                        <Clerk.Label className='text-xs text-gray-500'>Utilizator</Clerk.Label>
                        <Clerk.Input type='text' required className='p-2 rounded-md ring-1 ring-gray-300' />
                        {/* <Clerk.FieldError className='text-sm text-red-400' /> */}
                        <TranslatedFieldError name="identifier" className="text-sm text-red-400" />
                    </Clerk.Field>

                    <Clerk.Field name="password" className='flex flex-col gap-2'>
                        <Clerk.Label className='text-xs text-gray-500'>Parolă</Clerk.Label>
                        <Clerk.Input type='password' required className='p-2 rounded-md ring-1 ring-gray-300' />
                        {/* <Clerk.FieldError className='text-sm text-red-400' /> */}
                        <TranslatedFieldError name="password" className="text-sm text-red-400" />

                    </Clerk.Field>

                    <SignIn.Action submit className='bg-blue-500 text-white my-1 rounded text-sm p-[10px]'>Autentificare</SignIn.Action>
                </SignIn.Step>
            </SignIn.Root>
        </div>
    )
}

export default LoginPage