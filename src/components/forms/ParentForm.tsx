"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { parentSchema, ParentSchema } from "@/lib/formValidationSchemas";
import { createParent, updateParent } from "@/lib/actions";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import LoadingPopup from "@/components/LoadingPopup";
import { useTransition } from "react";

const ParentForm = ({
    type,
    data,
    setOpen,
    relatedData,
}: {
    type: "create" | "update";
    data?: any;
    setOpen: Dispatch<SetStateAction<boolean>>;
    relatedData?: any;
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ParentSchema>({
        resolver: zodResolver(parentSchema(type === "update")),
        defaultValues: {
            id: data?.id,
            username: data?.username,
            name: data?.name,
            surname: data?.surname,
            email: data?.email,
            phone: data?.phone,
            address: data?.address,
            password: data?.password,
        },
    });

    const [state, formAction] = useFormState(
        type === "create" ? createParent : updateParent,
        { success: false, error: false }
    );

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPending, startTransition] = useTransition();

    const onSubmit = handleSubmit(data => {
        startTransition(() => {
            formAction(data);
            setIsSubmitting(true);
        });
    });

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            toast(`Părinte ${type === "create" ? "adăugat" : "actualizat"} cu succes!`);
            setOpen(false);
            router.refresh();
        }
        if (state.error) {
            const errorMessage = state.message || "Ceva nu a funcționat. Încearcă mai târziu.";
            toast.error(errorMessage);
            setIsSubmitting(false);
        }
    }, [state, router, type, setOpen]);

    return (
        <form className="flex flex-col gap-8 mx-auto " onSubmit={onSubmit}>

            <h1 className="text-xl font-semibold">
                {type === "create" ? "Adaugă un nou părinte" : "Actualizează părintele"}
            </h1>


            <div className="flex gap-8">
                <span className="text-xs text-gray-400 font-medium flex-1">Informații de autentificare</span>
                <span className="text-xs text-gray-400 font-medium flex-1">Informații personale</span>
            </div>


            <div className="flex gap-8">
                {/* Coloana 1 */}
                <div className="flex flex-col gap-2 flex-1">
                    <InputField
                        label="Nume de utilizator"
                        name="username"
                        defaultValue={data?.username}
                        register={register}
                        error={errors?.username}
                    />
                    <InputField
                        label="Email"
                        name="email"
                        type="email"
                        defaultValue={data?.email}
                        register={register}
                        error={errors?.email}
                    />
                    <InputField
                        label="Parolă"
                        name="password"
                        type="password"
                        defaultValue={data?.password}
                        register={register}
                        error={errors?.password}
                    />
                </div>

                {/* Coloana 2 */}
                <div className="flex flex-col gap-2 flex-1">
                    <InputField
                        label="Prenume"
                        name="name"
                        defaultValue={data?.name}
                        register={register}
                        error={errors?.name}
                    />
                    <InputField
                        label="Nume"
                        name="surname"
                        defaultValue={data?.surname}
                        register={register}
                        error={errors?.surname}
                    />
                    <InputField
                        label="Telefon"
                        name="phone"
                        defaultValue={data?.phone}
                        register={register}
                        error={errors?.phone}
                    />
                </div>
            </div>


            <InputField
                label="Adresă"
                name="address"
                defaultValue={data?.address}
                register={register}
                error={errors?.address}
            />

            <div className="text-xs text-gray-500">
                Important: Asocierea elevului se realizează prin formularul de student.
            </div>

            <div className="flex justify-center mt-1">
                <button
                    className={`bg-blue-500 text-white px-8 py-2 rounded-md text-sm w-max ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={isSubmitting}
                >
                    {type === "create" ? "Adaugă" : "Actualizează"} părinte
                </button>
            </div>
            {isPending && <LoadingPopup />}
        </form>
    );
};

export default ParentForm;
