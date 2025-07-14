"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect } from "react";
import { resultSchema, ResultSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createResult, updateResult } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";


const ResultForm = ({
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
        watch,
        setValue,
        reset
    } = useForm<ResultSchema>({
        resolver: zodResolver(resultSchema),
        defaultValues: type === "update" && data ? {
            id: data.id,
            score: data.score,
            studentId: data.studentId || "",
            examId: data.examId || undefined,
            assignmentId: data.assignmentId || undefined,
        } : {}
    });

    const [state, formAction] = useFormState(type === "create"
        ? createResult : updateResult, { success: false, error: false })

    const onSubmit = handleSubmit(formData => {
        const submissionData = {
            ...formData,
            ...(type === "update" && data?.id && { id: data.id }),
        };
        formAction(submissionData);
    })

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            toast(`Result has been ${type === "create" ? "created" : "updated"} successfully!`);
            setOpen(false);
            router.refresh();
        }
        if (state.error) {
            const errorMessage = state.message || "Something went wrong!";
        }
    }, [state, router, type, setOpen]);

    const { students, exams, assignments } = relatedData;

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-cl font-semibold">{type === "create" ? "Create a new result" : "Update the result"}</h1>

            <div className="flex justify-between flex-wrap gap-4">
                <InputField
                    label="Score"
                    name="score"
                    type="number"
                    defaultValue={data?.score}
                    register={register}
                    error={errors?.score}
                    inputProps={{ min: 0, max: 100 }}
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
                    <label className="text-xs text-gray-400">Student</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        defaultValue={data?.studentId || ""}
                        {...register("studentId")}
                    >
                        <option value="">Select a student</option>
                        {students?.map(
                            (student: { id: string; name: string; surname: string }) => (
                                <option value={student.id} key={student.id}>
                                    {student.name} {student.surname}
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

                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-400">Exam (Optional)</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        defaultValue={data?.examId || ""}
                        {...register("examId")}
                    >
                        <option value="">Select an exam</option>
                        {exams?.map(
                            (exam: { id: number; title: string; lesson: { subject: { name: string }, class: { name: string } } }) => (
                                <option value={exam.id} key={exam.id}>
                                    {exam.title} - {exam.lesson.subject.name} ({exam.lesson.class.name})
                                </option>
                            )
                        )}
                    </select>
                    {errors.examId?.message && (
                        <p className="text-xs text-red-400">
                            {errors.examId.message.toString()}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-400">Assignment (Optional)</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        defaultValue={data?.assignmentId || ""}
                        {...register("assignmentId")}
                    >
                        <option value="">Select an assignment</option>
                        {assignments?.map(
                            (assignment: { id: number; title: string; lesson: { subject: { name: string }, class: { name: string } } }) => (
                                <option value={assignment.id} key={assignment.id}>
                                    {assignment.title} - {assignment.lesson.subject.name} ({assignment.lesson.class.name})
                                </option>
                            )
                        )}
                    </select>
                    {errors.assignmentId?.message && (
                        <p className="text-xs text-red-400">
                            {errors.assignmentId.message.toString()}
                        </p>
                    )}
                </div>
            </div>

            <div className="text-xs text-gray-500">
                Note: Select either an exam OR an assignment, not both.
            </div>

          {state.error && (
                <span className="text-red-500">
                    {state.message || "Something went wrong!"}
                </span>
            )}
            <button className="bg-blue-500 text-white p-2 rounded-md">
                {type === "create" ? "Create" : "Update"}
            </button>
        </form>
    )
};

export default ResultForm