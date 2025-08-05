'use client'

import * as Clerk from '@clerk/elements/common'
import * as SignIn from '@clerk/elements/sign-in'
import { useUser } from '@clerk/nextjs'
import { Sign } from 'crypto'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { TokenData } from "@/lib/utils";

const LoginPage = () => {

    const { isLoaded, isSignedIn, user } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isLoaded || !isSignedIn) return;
        const role = user?.publicMetadata.role;
        if (role) {
            router.push(`/${role}`);
        }
    }, [isLoaded, isSignedIn, user, router]);

    return (
        <div className='h-screen flex items-center justify-center bg-slate-100'>
            <SignIn.Root>
                <SignIn.Step name='start' className='bg-lime-50 p-12 rounded-md shadow-2xl flex flex-col gap-2'>
                    <h1 className='text-xl font-bold flex items-center gap-2'>
                        <Image src="/logo.png" alt="logo" width={32} height={32} />
                        School Management System
                    </h1>
                    <h2 className='text-gray-400'>Sign in to you account</h2>

                    <Clerk.GlobalError className='text-sm text-red-400' />
                    <Clerk.Field name="identifier" className='flex flex-col gap-2'>
                        <Clerk.Label className='text-xs text-gray-500'>Username</Clerk.Label>
                        <Clerk.Input type='text' required className='p-2 rounded-md ring-1 ring-gray-300' />
                        <Clerk.FieldError className='text-sm text-red-400' />
                    </Clerk.Field>

                    <Clerk.Field name="password" className='flex flex-col gap-2'>
                        <Clerk.Label className='text-xs text-gray-500'>Password</Clerk.Label>
                        <Clerk.Input type='password' required className='p-2 rounded-md ring-1 ring-gray-300' />
                        <Clerk.FieldError className='text-sm text-red-400' />
                    </Clerk.Field>

                    <SignIn.Action submit className='bg-blue-500 text-white my-1 rounded text-sm p-[10px]'>Sign In</SignIn.Action>

                </SignIn.Step>
            </SignIn.Root>
        </div>
    )
}

export default LoginPage