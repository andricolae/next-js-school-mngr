"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { set, useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { examSchema, ExamSchema, subjectSchema, SubjectSchema } from "@/lib/formValidationSchemas";
import { createExam, createSubject, updateExam, updateSubject } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

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

    const onSubmit = handleSubmit(data => {
        data.startTime = new Date(new Date(data.startTime).getTime() + (3 * 60 * 60 * 1000));
        data.endTime = new Date(new Date(data.endTime).getTime() + (3 * 60 * 60 * 1000));
        formAction(data);
    })

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            toast(`Exam has been ${type === "create" ? "created" : "updated"} successfully!`);
            setOpen(false);
            router.refresh();
        }
    }, [state, router, type, setOpen]);

    const { lessons } = relatedData;
    console.log("lessons", lessons)
    return (
        <form className="flex flex-col gap-6 " onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold ">
                {type === "create" ? "Create a new exam" : "Update the exam"}
            </h1>

            <div className="flex flex-col gap-6 w-full">
                <InputField
                    label="Exam Title"
                    name="title"
                    defaultValue={data?.title}
                    register={register}
                    error={errors?.title}
                />

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
                        defaultValue={data?.id}
                        register={register}
                        error={errors?.id}
                        hidden
                    />
                )}

                <div className="flex flex-col gap-1 w-full">
                    <label className="text-xs text-gray-400">Lesson</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("lessonId")}
                        defaultValue={data?.lessonId || ""}
                    >
                        <option value="">Select lesson</option>
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

            <div className="flex justify-center mt-4">
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-8 py-2 rounded-md text-sm w-max"
                >
                    {type === "create" ? "Create" : "Update"}
                </button>
            </div>
        </form>
    )
};

export default ExamForm