"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { assignmentSchema, AssignmentSchema } from "@/lib/formValidationSchemas";
import { createAssignment, updateAssignment } from "@/lib/actions";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import LoadingPopup from "@/components/LoadingPopup";
import { useTransition } from "react";

const AssignmentForm = ({
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
        formState: { errors, touchedFields, isSubmitted },
    } = useForm<AssignmentSchema>({
        resolver: zodResolver(assignmentSchema),
    });

    const [state, formAction] = useFormState(type === "create"
        ? createAssignment : updateAssignment, { success: false, error: false })

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPending, startTransition] = useTransition();

    const onSubmit = handleSubmit(data => {
        startTransition(() => {
            setIsSubmitting(true);
            const formattedData = {
                ...data,
                startDate: new Date(data.startDate),
                dueDate: new Date(data.dueDate)
            };
            formAction(formattedData);
        });
    })

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            toast(`Temă ${type === "create" ? "creată" : "actualizată"} cu succes!`);
            setOpen(false);
            router.refresh();
        }

        if (state.error) {
            const errorMessage = state.message || "Ceva nu a funcționat. Încearcă mai târziu.";
            setIsSubmitting(true);
        }
    }, [state, router, type, setOpen]);

    const getDateError = (field: "startDate" | "dueDate") => {
        const err = errors[field];
        if (isSubmitted && !touchedFields[field] && !err) {
            return field === "startDate"
                ? "Data de început este obligatorie!"
                : "Data limită este obligatorie!";
        }
        if (err?.message === "Invalid date") {
            return field === "startDate"
                ? "Data de început este obligatorie!!"
                : "Data limită este obligatorie!!";
        }
        return err?.message;
    };

    const { lessons } = relatedData;

    return (
        <form className="flex flex-col gap-4 max-auto" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">{type === "create" ? "Adaugă o nouă temă" : "Actualizează tema"}</h1>

            <div className="flex flex-col gap-6">
                <InputField
                    label="Titlu temă"
                    name="title"
                    defaultValue={data?.title}
                    register={register}
                    error={errors?.title}
                />
                <InputField
                    label="Descriere"
                    name="description"
                    defaultValue={data?.description}
                    register={register}
                    error={errors?.description}
                />
                <InputField
                    label="Dată începere"
                    name="startDate"
                    defaultValue={data?.startDate ? new Date(data.startDate).toISOString().split('T')[0] : undefined}
                    register={register}
                    error={getDateError("startDate")}
                    type="date"
                />
                <InputField
                    label="Dată limită"
                    name="dueDate"
                    defaultValue={data?.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : undefined}
                    register={register}
                    error={getDateError("dueDate")}
                    type="date"
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
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-400">Ore</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("lessonId")}
                        defaultValue={data?.lessonId}
                    >
                        <option value="">Alege ora</option>
                        {lessons.map(
                            (lesson: { id: number; name: string; }) => (
                                <option value={lesson.id} key={lesson.id}>
                                    {lesson.name}
                                </option>
                            )
                        )}
                    </select>
                    {errors.lessonId?.message &&
                        <p className="text-xs text-red-400">
                            {errors.lessonId.message.toString()}
                        </p>
                    }
                </div>
            </div>
            {state.error && (
                <span className="text-red-500">
                    {state.message || "Ceva nu a funcționat. Încearcă mai târziu."}
                </span>
            )}
            <div className="flex justify-center mt-4 mb-8">
                <button
                    type="submit"
                    className={`bg-blue-500 text-white px-8 py-2 rounded-md text-sm w-max mx-auto hover:bg-blue-600 transition ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={isSubmitting}
                >
                    {type === "create" ? "Adaugă tema" : "Actualizează tema"}
                </button>
            </div>
            {isPending && <LoadingPopup />}
        </form>
    )
};

export default AssignmentForm