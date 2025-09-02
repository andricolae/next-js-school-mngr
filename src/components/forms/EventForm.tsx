"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { eventSchema, EventSchema } from "@/lib/formValidationSchemas";
import { Dispatch, SetStateAction, useEffect, useState } from "react"; // added useState
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { createEvent, updateEvent } from "@/lib/actions";
import { toast } from "react-toastify";
import LoadingPopup from "@/components/LoadingPopup";
import { useTransition } from "react";
import { formatDateForInput } from "@/lib/utils";

const EventForm = ({
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
    } = useForm<EventSchema>({
        resolver: zodResolver(eventSchema),
    });

    const [state, formAction] = useFormState(type === "create"
        ? createEvent : updateEvent, { success: false, error: false })

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPending, startTransition] = useTransition();

    const onSubmit = handleSubmit(formData => {
        startTransition(() => {
            setIsSubmitting(true);
            const submissionData = {
                ...formData,
                ...(type === "update" && data?.id && { id: data.id }),
                startTime: new Date(new Date(formData.startTime).getTime()),
                endTime: new Date(new Date(formData.endTime).getTime()),
            };
            formAction(submissionData);
        });
    })

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            toast(`Eveniment ${type === "create" ? "creat" : "actualizat"} cu succes!`);
            setOpen(false);
            router.refresh();
        }
        if (state.error) {
            const errorMessage = state.message || "A apărut o eroare. Încearcă mai târziu.";
            setIsSubmitting(false);
        }
    }, [state, router, type, setOpen]);

    const { classes } = relatedData || {};

    const getDateError = (field: "startTime" | "endTime") => {
        const err = errors[field];
        if (isSubmitted && !touchedFields[field] && !err) {
            return field === "startTime"
                ? "Data și ora de început sunt obligatorii!"
                : "Data și ora de sfârșit sunt obligatorii!";
        }
        if (err?.message === "Invalid date") {
            return field === "startTime"
                ? "Data și ora de început sunt obligatorii!"
                : "Data și ora de sfârșit sunt obligatorii!";
        }
        return err?.message;
    };

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">{type === "create" ? "Adaugă un nou eveniment" : "Actualizează evenimentul"}</h1>

            <div className="flex-col gap-4">
                <InputField
                    label="Titlul evenimentului"
                    name="title"
                    defaultValue={data?.title}
                    register={register}
                    error={errors?.title}
                />

                <div className="flex flex-col gap-2 pt-2 w-full">
                    <label className="text-xs text-gray-400">Descriere</label>
                    <textarea
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        placeholder="Event description..."
                        defaultValue={data?.description}
                        {...register("description")}
                    />
                    {errors.description?.message && (
                        <p className="text-xs text-red-400">
                            {errors.description.message.toString()}
                        </p>
                    )}
                </div>

                <InputField
                    label="Data și ora de început"
                    name="startTime"
                    defaultValue={data?.startTime ? formatDateForInput(data.startTime) : undefined}
                    register={register}
                    error={getDateError("startTime")}
                    type="datetime-local"
                />

                <InputField
                    label="Data și ora de sfârșit"
                    name="endTime"
                    defaultValue={data?.endTime ? formatDateForInput(data.endTime) : undefined}
                    register={register}
                    error={getDateError("endTime")}
                    type="datetime-local"
                />

                {data && (
                    <InputField
                        label="Id"
                        name="id"
                        register={register}
                        error={errors?.id}
                        hidden
                    />
                )}

                <div className="flex flex-col gap-2 w-full pt-2">
                    <label className="text-xs text-gray-400">Clasa (Opțional)</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        defaultValue={data?.classId ?? ""}
                        {...register("classId")}
                    >
                        <option value="">Eveniment pentru întreaga școală</option>
                        {classes?.map(
                            (classItem: { id: number; name: string; grade: { level: number } }) => (
                                <option value={classItem.id} key={classItem.id}>
                                    {classItem.name} - Grade {classItem.grade.level}
                                </option>
                            )
                        )}
                    </select>
                    {errors.classId?.message && (
                        <p className="text-xs text-red-400">
                            {errors.classId.message.toString()}
                        </p>
                    )}
                </div>
            </div>

            <div className="text-xs text-gray-500">
                Important: Pentru a crea un eveniment pentru întreaga școală, lăsați câmpul „clasă” liber!
            </div>

            {state.error && (
                <span className="text-red-500">
                    {state.message || "A apărut o eroare. Încearcă din nou."}
                </span>
            )}
            <div className="flex justify-center mt-6 mb-8">
                <button
                    type="submit"
                    className={`bg-blue-500 transition ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""} text-white px-8 py-2 rounded-md text-sm w-max`}
                    disabled={isSubmitting}
                >
                    {type === "create" ? "Adaugă eveniment" : "Actualizează evenimentul"}
                </button>
            </div>
            {isPending && <LoadingPopup />}
        </form>
    )
};

export default EventForm;
