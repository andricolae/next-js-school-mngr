"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { classSchema, ClassSchema } from "@/lib/formValidationSchemas";
import { createClass, updateClass } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import LoadingPopup from "@/components/LoadingPopup";
import { useTransition } from "react";

const ClassForm = ({
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
    } = useForm({
        resolver: zodResolver(classSchema),
        defaultValues: type === "update" ? {
            name: data?.name,
            capacity: data?.capacity,
            supervisorId: data?.supervisorId?.toString() ?? "",
            gradeId: data?.gradeId,
        } : {},
    });

    const [state, formAction] = useFormState(
        type === "create" ? createClass : updateClass,
        { success: false, error: false }
    );

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPending, startTransition] = useTransition();

    const onSubmit = handleSubmit(data => {
        startTransition(() => {
            setIsSubmitting(true);
            formAction(data);
        });
    });

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            toast(`Clasă ${type === "create" ? "creată" : "actualizată"} cu succes!`);
            setOpen(false);
            router.refresh();
        }

        if (state.error) {
            toast.error(state.message || "Ceva nu a funcționat. Încearcă mai târziu.");
            setIsSubmitting(false);
        }
    }, [state, router, type, setOpen]);

    const { teachers, grades } = relatedData || {};

    return (
        <form className="flex flex-col gap-8 mx-auto" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold text-left mb-6">
                {type === "create" ? "Adaugă o nouă clasă" : "Actualizează clasa"}
            </h1>

            <div className="flex flex-col gap-6 w-full">
                <InputField
                    label="Denumire clasă"
                    name="name"
                    defaultValue={data?.name}
                    register={register}
                    error={errors?.name}
                />
                <InputField
                    label="Număr maxim elevi"
                    name="capacity"
                    type="number"
                    defaultValue={data?.capacity}
                    register={register}
                    error={errors?.capacity}
                />
                {data && (
                    <InputField
                        label="Id"
                        name="id"
                        defaultValue={data?.id}
                        register={register}
                        error={errors?.id}
                        hidden
                    />
                )}

                {/* Supervisor */}
                <div className="flex flex-col gap-1 w-full">
                    <label className="text-xs text-gray-400">Diriginte</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("supervisorId")}
                        defaultValue={data?.supervisorId || ""}
                    >
                        <option value="">Alege un profesor</option>
                        {teachers?.map(
                            (teacher: { id: string; name: string; surname: string }) => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.name} {teacher.surname}
                                </option>
                            )
                        )}
                    </select>
                    {errors.supervisorId?.message && (
                        <p className="text-xs text-red-400">{errors.supervisorId.message.toString()}</p>
                    )}
                </div>

                {/* Grade */}
                <div className="flex flex-col gap-1 w-full">
                    <label className="text-xs text-gray-400">Nivel</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("gradeId")}
                        defaultValue={data?.gradeId || ""}
                    >
                        <option value="">Alege un nivel</option>
                        {grades?.map(
                            (grade: { id: number; level: number }) => (
                                <option key={grade.id} value={grade.id}>
                                    {grade.level}
                                </option>
                            )
                        )}
                    </select>
                    {errors.gradeId?.message && (
                        <p className="text-xs text-red-400">{errors.gradeId.message.toString()}</p>
                    )}
                </div>
            </div>

            {state.error && (
                <span className="text-red-500 text-center">
                    {state.message || "Ceva nu a funcționat. Încearcă mai târziu."}
                </span>
            )}

            <div className="flex justify-center mt-6 mb-8">
                <button
                    className={`bg-blue-500 text-white px-4 py-2 rounded-md mx-auto hover:bg-blue-600 transition ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={isSubmitting}
                >
                    {type === "create" ? "Adaugă clasa" : "Actualizează clasa"}
                </button>
            </div>
            {isPending && <LoadingPopup />}
        </form>
    );
};

export default ClassForm;
