"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { assignmentSchema, AssignmentSchema } from "@/lib/formValidationSchemas";
import { createAssignment, updateAssignment } from "@/lib/actions";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

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
        formState: { errors },
    } = useForm<AssignmentSchema>({
        resolver: zodResolver(assignmentSchema),
    });

    const [state, formAction] = useFormState(type === "create"
        ? createAssignment : updateAssignment, { success: false, error: false })

    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = handleSubmit(data => {
        setIsSubmitting(true);
        const formattedData = {
            ...data,
            startDate: new Date(data.startDate),
            dueDate: new Date(data.dueDate)
        };
        formAction(formattedData);
    })

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            toast(`Assignment has been ${type === "create" ? "created" : "updated"} successfully!`);
            setOpen(false);
            router.refresh();
        }

        if (state.error) {
            const errorMessage = state.message || "Something went wrong!";
            setIsSubmitting(true);
        }
    }, [state, router, type, setOpen]);

    const { lessons } = relatedData;

    return (
        <form className="flex flex-col gap-4 max-auto" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">{type === "create" ? "Create a new assignment" : "Update the assignment"}</h1>
       
            <div className="flex flex-col gap-6">
                <InputField
                    label="Assignment Title"
                    name="title"
                    defaultValue={data?.title}
                    register={register}
                    error={errors?.title}
                />
                <InputField
                    label="Start Date"
                    name="startDate"
                    defaultValue={data?.startDate ? new Date(data.startDate).toISOString().split('T')[0] : undefined}
                    register={register}
                    error={errors?.startDate}
                    type="date"
                />
                <InputField
                    label="Due Date"
                    name="dueDate"
                    defaultValue={data?.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : undefined}
                    register={register}
                    error={errors?.dueDate}
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
                    <label className="text-xs text-gray-400">Lesson</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("lessonId")}
                        defaultValue={data?.lessonId}
                    >
                         <option value="">Select lesson</option>
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
                    {state.message || "Something went wrong!"}
                </span>
            )}
          <div className="flex justify-center mt-4">
         <button
            type="submit"
            className={`bg-blue-500 text-white px-8 py-2 rounded-md text-sm w-max mx-auto hover:bg-blue-600 transition ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isSubmitting}
         >
          {type === "create" ? "Create" : "Update"}
        </button>
      </div>
        </form>
    )
};

export default AssignmentForm