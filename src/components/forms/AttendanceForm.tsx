"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { AttendanceActionData, AttendanceFormData, attendanceSchema } from "@/lib/formValidationSchemas";
import { createAttendance, updateAttendance } from "@/lib/actions";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const AttendanceForm = ({
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
    } = useForm<AttendanceFormData>({
        resolver: zodResolver(attendanceSchema),
    });

    const [state, formAction] = useFormState(type === "create"
        ? createAttendance : updateAttendance, { success: false, error: false })

    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = handleSubmit((formData) => {
        setIsSubmitting(true);
        const actionData = {
            id: formData.id,
            date: formData.date,
            present: formData.present === "true",
            studentId: formData.studentId,
            lessonId: formData.lessonId,
        };
        formAction(actionData);
    })

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            toast(`Attendance has been ${type === "create" ? "created" : "updated"} successfully!`);
            setOpen(false);
            router.refresh();
        }
        if (state.error) {
            const errorMessage = state.message || "Something went wrong!";
            setIsSubmitting(true);
        }
    }, [state, router, type, setOpen]);

    const { students, lessons } = relatedData || {};

    return (
        
        <form className="flex flex-col gap-14" onSubmit={onSubmit}>
            <h1 className="text-cl font-semibold">{type === "create" ? "Create attendance record" : "Update attendance record"}</h1>

            <div className="flex flex-col gap-6 w-full">
                <InputField
                    label="Date"
                    name="date"
                    type="date"
                    defaultValue={data?.date ? new Date(data.date).toISOString().split('T')[0] : undefined}
                    register={register}
                    error={errors?.date}
                />

                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-400">Status</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("present")}
                        defaultValue={data?.present !== undefined ? String(data.present) : "true"}
                    >
                        <option value="true">Present</option>
                        <option value="false">Absent</option>
                    </select>
                    {errors.present?.message && (
                        <p className="text-xs text-red-400">
                            {errors.present.message.toString()}
                        </p>
                    )}
                </div>

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
                    <label className="text-xs text-gray-400">Student</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("studentId")}
                        defaultValue={data?.studentId}
                    >
                        <option value="">Select a student</option>
                        {students?.map(
                            (student: { id: string; name: string; surname: string; username: string }) => (
                                <option value={student.id} key={student.id}>
                                    {student.name} {student.surname} ({student.username})
                                </option>
                            )
                        )}
                    </select>
                    {errors.studentId?.message && (
                        <p className="text-xs text-red-400">
                            {errors.studentId.message.toString()}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-400">Lesson</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("lessonId")}
                        defaultValue={data?.lessonId}
                    >
                        <option value="">Select a lesson</option>
                        {lessons?.map(
                            (lesson: { id: number; name: string; subject: { name: string }; class: { name: string } }) => (
                                <option value={lesson.id} key={lesson.id}>
                                    {lesson.subject.name} - {lesson.class.name} ({lesson.name})
                                </option>
                            )
                        )}
                    </select>
                    {errors.lessonId?.message && (
                        <p className="text-xs text-red-400">
                            {errors.lessonId.message.toString()}
                        </p>
                    )}
                </div>
            </div>

           {state.error && (
                <span className="text-red-500">
                    {state.message || "Something went wrong!"}
                </span>
            )}
             <div className="flex justify-center mt-6">
                <button
                type="submit"
                className={`bg-blue-500 text-white px-4 py-2 rounded-md mx-auto hover:bg-blue-600 transition ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={isSubmitting}
                >
                {type === "create" ? "Create" : "Update"}
                </button>
            </div>
        </form>
    )
};

export default AttendanceForm