"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect } from "react";
import { lessonSchema, LessonSchema } from "@/lib/formValidationSchemas";
import { createLesson, updateLesson } from "@/lib/actions";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const LessonForm = ({
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
    } = useForm<LessonSchema>({
        resolver: zodResolver(lessonSchema),
    });

    const [state, formAction] = useFormState(type === "create"
        ? createLesson : updateLesson, { success: false, error: false })

    const onSubmit = handleSubmit(formData => {
        const submissionData = {
            ...formData,
            ...(type === "update" && data?.id && { id: data.id }),
            startTime: new Date(new Date(formData.startTime).getTime() + (3 * 60 * 60 * 1000)),
            endTime: new Date(new Date(formData.endTime).getTime() + (3 * 60 * 60 * 1000)),
        };
        formAction(submissionData);
    })

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            toast(`Lesson has been ${type === "create" ? "created" : "updated"} successfully!`);
            setOpen(false);
            router.refresh();
        }
    }, [state, router, type, setOpen]);

    const { subjects, classes, teachers } = relatedData || {};

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-cl font-semibold">{type === "create" ? "Create a new lesson" : "Update the lesson"}</h1>
            
            <div className="flex justify-between flex-wrap gap-4">
                <InputField
                    label="Lesson Name"
                    name="name"
                    defaultValue={data?.name}
                    register={register}
                    error={errors?.name}
                />

                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-400">Day</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        defaultValue={data?.day || ""}
                        {...register("day")}
                    >
                        <option value="">Select a day</option>
                        <option value="MONDAY">Monday</option>
                        <option value="TUESDAY">Tuesday</option>
                        <option value="WEDNESDAY">Wednesday</option>
                        <option value="THURSDAY">Thursday</option>
                        <option value="FRIDAY">Friday</option>
                    </select>
                    {errors.day?.message && (
                        <p className="text-xs text-red-400">
                            {errors.day.message.toString()}
                        </p>
                    )}
                </div>

                <InputField
                    label="Start Time"
                    name="startTime"
                    defaultValue={data?.startTime ? 
                        new Date(data.startTime).toISOString().slice(0, 16) : 
                        undefined
                    }
                    register={register}
                    error={errors?.startTime}
                    type="datetime-local"
                />

                <InputField
                    label="End Time"
                    name="endTime"
                    defaultValue={data?.endTime ? 
                        new Date(data.endTime).toISOString().slice(0, 16) : 
                        undefined
                    }
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

                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-400">Subject</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        defaultValue={data?.subjectId || data?.subject?.id || ""}
                        {...register("subjectId")}
                    >
                        <option value="">Select a subject</option>
                        {subjects?.map(
                            (subject: { id: number; name: string }) => (
                                <option value={subject.id} key={subject.id}>
                                    {subject.name}
                                </option>
                            )
                        )}
                    </select>
                    {errors.subjectId?.message && (
                        <p className="text-xs text-red-400">
                            {errors.subjectId.message.toString()}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-400">Class</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        defaultValue={data?.classId || data?.class?.id || ""}
                        {...register("classId")}
                    >
                        <option value="">Select a class</option>
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

                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-400">Teacher</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        defaultValue={data?.teacherId || data?.teacher?.id || ""}
                        {...register("teacherId")}
                    >
                        <option value="">Select a teacher</option>
                        {teachers?.map(
                            (teacher: { id: string; name: string; surname: string }) => (
                                <option value={teacher.id} key={teacher.id}>
                                    {teacher.name} {teacher.surname}
                                </option>
                            )
                        )}
                    </select>
                    {errors.teacherId?.message && (
                        <p className="text-xs text-red-400">
                            {errors.teacherId.message.toString()}
                        </p>
                    )}
                </div>
            </div>

            {state.error && <span className="text-red-500">Something went wrong!</span>}
            <button className="bg-blue-500 text-white p-2 rounded-md">
                {type === "create" ? "Create" : "Update"}
            </button>
        </form>
    )
};

export default LessonForm