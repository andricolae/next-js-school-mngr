"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { eventSchema, EventSchema } from "@/lib/formValidationSchemas";
import { Dispatch, SetStateAction, useEffect, useState } from "react"; // added useState
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { createEvent, updateEvent } from "@/lib/actions";
import { toast } from "react-toastify";
import LoadingPopup from "@/components/LoadingPopup";
import { useTransition } from "react";

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
        formState: { errors },
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
                startTime: new Date(new Date(formData.startTime).getTime() + (3 * 60 * 60 * 1000)),
                endTime: new Date(new Date(formData.endTime).getTime() + (3 * 60 * 60 * 1000)),
            };
            formAction(submissionData);
        });
    })

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            toast(`Event has been ${type === "create" ? "created" : "updated"} successfully!`);
            setOpen(false);
            router.refresh();
        }
        if (state.error) {
            const errorMessage = state.message || "Something went wrong!";
            setIsSubmitting(false);
        }
    }, [state, router, type, setOpen]);

    const { classes } = relatedData || {};


    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">{type === "create" ? "Create a new event" : "Update the event"}</h1>

            <div className="flex-col gap-4">
                <InputField
                    label="Event Title"
                    name="title"
                    defaultValue={data?.title}
                    register={register}
                    error={errors?.title}
                />

                <div className="flex flex-col gap-2 pt-2 w-full">
                    <label className="text-xs text-gray-400">Description</label>
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
                    label="Start Time"
                    name="startTime"
                    defaultValue={data?.startTime ? new Date(data.startTime).toISOString().slice(0, 16) : undefined}
                    register={register}
                    error={errors?.startTime}
                    type="datetime-local"
                />

                <InputField
                    label="End Time"
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
                        register={register}
                        error={errors?.id}
                        hidden
                    />
                )}

                <div className="flex flex-col gap-2 w-full pt-2">
                    <label className="text-xs text-gray-400">Class (Optional)</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        defaultValue={data?.classId ?? ""}
                        {...register("classId")}
                    >
                        <option value="">School-wide event</option>
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
                Leave class empty to create a school-wide event visible to everyone.
            </div>

            {state.error && (
                <span className="text-red-500">
                    {state.message || "Something went wrong!"}
                </span>
            )}
            <div className="flex justify-center mt-6s">
                <button
                    type="submit"
                    className={`bg-blue-500 transition ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""} text-white px-8 py-2 rounded-md text-sm w-max`}
                    disabled={isSubmitting}
                >
                    {type === "create" ? "Create" : "Update"}
                </button>
            </div>
            {isPending && <LoadingPopup />}
        </form>
    )
};

export default EventForm;
