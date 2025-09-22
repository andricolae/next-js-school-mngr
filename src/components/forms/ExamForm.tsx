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
import { formatDateForInput } from "@/lib/utils";

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
        formState: { errors, touchedFields, isSubmitted },
        setValue,
        watch
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
            data.startTime = new Date(new Date(data.startTime).getTime());
            data.endTime = new Date(new Date(data.endTime).getTime());
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

    const { lessons } = relatedData;

    const [startTime, setStartTime] = useState<any>(data?.startTime ? new Date(data.startTime).toISOString().split('T')[0] : "");
    const [endTime, setEndTime] = useState<any>(data?.endTime ? new Date(data.endTime).toISOString().split('T')[0] : "");

    const updateTime = (selectedLessonId: string | number) => {
        const lesson = lessons.find((l: any) => l.id === Number(selectedLessonId));
        if (lesson) {
            setStartTime(formatDateForInput(lesson.startTime));
            setEndTime(formatDateForInput(lesson.endTime));
        }
    }

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

                <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center gap-1">
                        <label className="text-xs text-gray-400">Lecția</label>
                        <span
                            className="text-gray-400 text-xs cursor-help"
                            title="Odată selectată ora, date și ora de început și sfârșit vor fi completate automat conform orei selectate."
                        >
                            ⓘ
                        </span>
                    </div>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("lessonId")}
                        defaultValue={data?.lessonId || ""}
                        onChange={(e) => { updateTime(Number(e.target.value)) }}
                    >
                        <option value="q">Selectează o oră</option>
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

                <InputField
                    label="Dată și oră început"
                    name="startTime"
                    // defaultValue={data?.startTime ? formatDateForInput(data.startTime) : ""}
                    defaultValue={startTime}
                    register={register}
                    error={getDateError("startTime")}
                    type="datetime-local"
                />

                <InputField
                    label="Dată și oră sfârșit"
                    name="endTime"
                    // defaultValue={data?.endTime ? formatDateForInput(data.endTime) : ""}
                    defaultValue={endTime}
                    register={register}
                    error={getDateError("endTime")}
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