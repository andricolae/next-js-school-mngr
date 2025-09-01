"use client"

import * as Clerk from "@clerk/elements/common"
import { translateClerkError } from "@/lib/clerkErrorMessage"

export const TranslatedGlobalError = ({ className }: { className?: string }) => (
    <Clerk.GlobalError className={className}>
        {(error) => translateClerkError(error.code, error.message)}
    </Clerk.GlobalError>
)

export const TranslatedFieldError = ({ name, className }: { name: string; className?: string }) => (
    <Clerk.FieldError name={name} className={className}>
        {(error) => translateClerkError(error.code, error.message)}
    </Clerk.FieldError>
)
