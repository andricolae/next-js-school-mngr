"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { examSchema, ExamSchema } from "@/lib/formValidationSchemas";
import { createExam, updateExam } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import LoadingPopup from "@/components/LoadingPopup";
import { useTransition } from "react";

const ExamForm = ({
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
        setValue
    } = useForm<ExamSchema>({
        resolver: zodResolver(examSchema),
    });

    const [state, formAction] = useFormState(type === "create"
        ? createExam : updateExam, { success: false, error: false })

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPending, startTransition] = useTransition();

    const onSubmit = handleSubmit(data => {
        startTransition(() => {
            setIsSubmitting(true);
            data.startTime = new Date(new Date(data.startTime).getTime() + (3 * 60 * 60 * 1000));
            data.endTime = new Date(new Date(data.endTime).getTime() + (3 * 60 * 60 * 1000));
            formAction(data);
        });
    })

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            toast(`Test ${type === "create" ? "creat" : "actualizat"} cu succes!`);
            setOpen(false);
            router.refresh();
        }
        if (state.error) {
            const errorMessage = state.message || "Ceva nu a funcționat. Încearcă mai târziu.";
            setIsSubmitting(false);
        }
    }, [state, router, type, setOpen]);

    const { lessons } = relatedData;
    console.log("lessons", lessons)
    return (
        <form className="flex flex-col gap-6 " onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold ">
                {type === "create" ? "Adaugă un nou test" : "Actualizează testul"}
            </h1>

            <div className="flex flex-col gap-6 w-full">
                <InputField
                    label="Titlu test"
                    name="title"
                    defaultValue={data?.title}
                    register={register}
                    error={errors?.title}
                />

                <InputField
                    label="Dată și oră început"
                    name="startTime"
                    defaultValue={data?.startTime ? new Date(data.startTime).toISOString().slice(0, 16) : undefined}
                    register={register}
                    error={errors?.startTime}
                    type="datetime-local"
                />

                <InputField
                    label="Dată și oră sfârșit"
                    name="endTime"
                    defaultValue={data?.endTime ? new Date(data.endTime).toISOString().slice(0, 16) : undefined}
                    register={register}
                    error={errors?.endTime}
                    type="datetime-local"
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

                <div className="flex flex-col gap-1 w-full">
                    <label className="text-xs text-gray-400">Ora</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("lessonId")}
                        defaultValue={data?.lessonId || ""}
                    >
                        <option value="">Selectează o oră</option>
                        {lessons.map((lesson: { id: number; name: string }) => (
                            <option value={lesson.id} key={lesson.id}>
                                {lesson.name}
                            </option>
                        ))}
                    </select>
                    {errors.lessonId?.message && (
                        <p className="text-xs text-red-400">{errors.lessonId.message.toString()}</p>
                    )}
                </div>
            </div>

            {state.error && (
                <span className="text-red-500 text-center">
                    {state.error}
                </span>
            )}

            <div className="flex justify-center mt-4 mb-8">
                <button
                    type="submit"
                    className={`bg-blue-500 transition ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""} text-white px-8 py-2 rounded-md text-sm w-max`}
                    disabled={isSubmitting}
                >
                    {type === "create" ? "Adaugă testul" : "Actualizează testul"}
                </button>
            </div>
            {isPending && <LoadingPopup />}
        </form>
    )
};

export default ExamForm