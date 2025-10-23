"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { AttendanceFormData, attendanceSchema } from "@/lib/formValidationSchemas";
import { createAttendance, updateAttendance } from "@/lib/actions";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useTransition } from "react";
import { MultiSelect } from "@/components/forms/ResultsFilterForm";
import ReactDOM from "react-dom";
import dynamic from "next/dynamic";
const LoadingPopup = dynamic(() => import("@/components/LoadingPopup"), { ssr: false });
const InputField = dynamic(() => import("@/components/InputField"), { ssr: false });

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
        control,
        formState: { errors, touchedFields, isSubmitted },
        setValue,
    } = useForm<AttendanceFormData>({
        resolver: zodResolver(attendanceSchema),
        defaultValues: type === "update" && data ? {
            lessonId: data?.lessonId || "",
            studentId: data?.studentId || "",
        } : {}
    });

    const [state, formAction] = useFormState(type === "create"
        ? createAttendance : updateAttendance, { success: false, error: false })

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPending, startTransition] = useTransition();

    const onSubmit = handleSubmit((formData) => {
        startTransition(() => {
            setIsSubmitting(true);
            const actionData = {
                id: formData.id,
                date: formData.date,
                present: formData.present === "true",
                excused: formData.excused === "true",
                studentId: formData.studentId,
                lessonId: formData.lessonId,
            };
            formAction(actionData);
        });
    })

    const router = useRouter();

    useEffect(() => {
        if (!state) return;
        if (state.success) {
            toast(`Prezență ${type === "create" ? "adăugată" : "actualizată"} cu succes!`);
            setOpen(false);
            startTransition(() => {
                router.refresh();
            });
        }
        if (state.error) {
            const errorMessage = state.message || "Ceva nu a funcționat. Încearcă mai târziu.";
            setIsSubmitting(true);
        }
    }, [state, router, type, setOpen]);

    const { students, lessons } = relatedData || {};
    const [date, setDate] = useState<any>(data?.date ? new Date(data.date).toISOString().split('T')[0] : undefined);

    const getDateError = (field: "date") => {
        const err = errors[field];
        // if (isSubmitted && !touchedFields[field] && !err) {
        //     return "Data este obligatorie!";
        // }
        if (err?.message === "Invalid date") {
            return "Data este obligatorie!";
        }
        return err?.message;
    };

    const [present, setPresent] = useState<any>(data?.present !== undefined ? data.present : true);

    const lesons = lessons.map((lesson: any) => ({
        id: lesson.id.toString(),
        name: `${lesson.name} - ${lesson.class.name} (${new Date(lesson.startTime).toLocaleDateString("ro-RO")})`,
    })) || [];

    const [stdents, setStdents] = useState(students.map((student: any) => ({
        id: student.id.toString(),
        name: `${student.name} - ${student.surname} (${student.username})`,
    })) || []);

    const updateStdents = (lessonId: string) => {
        const classOfSelectedLesson = lessons.find((leson: any) => leson.id === Number(lessonId))?.classId;
        if (classOfSelectedLesson !== undefined) {
            const stdts = students.filter((stdent: any) => stdent.classId === classOfSelectedLesson);
            setStdents(stdts.map((student: any) => ({
                id: student.id.toString(),
                name: `${student.name} - ${student.surname} (${student.username})`,
            })) || []);
        } else {
            setStdents(students.map((student: any) => ({
                id: student.id.toString(),
                name: `${student.name} - ${student.surname} (${student.username})`,
            })) || []);
        }
    };

    return (
        <form className="flex flex-col gap-6 w-full" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">{type === "create" ? "Adaugă o nouă prezență" : "Actualizează prezența"}</h1>

            <div className="flex flex-col gap-4 w-full">

                <div className="flex flex-col gap-1 w-full">
                    <Controller
                        name="lessonId"
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                id="lessonId"
                                label="Ora"
                                options={lesons}
                                placeholder="Selectează ora"
                                selectedIds={field.value ? [field.value.toString()] : []}
                                onSelectionChange={async (ids) => {
                                    const selectedId = ids[0];
                                    field.onChange(selectedId ? Number(selectedId) : "");
                                    if (selectedId) {
                                        const lesson = lessons.find((lesn: any) => lesn.id.toString() === selectedId);
                                        if (lesson) {
                                            await setDate(new Date(lesson.startTime).toISOString().split("T")[0]);
                                            await setValue("date", new Date(lesson.startTime).toISOString().split("T")[0]);
                                        }
                                    }
                                    updateStdents(ids[0]);
                                }}
                            />
                        )}
                    />
                    {errors.lessonId?.message && (
                        <p className="text-xs text-red-400">
                            {errors.lessonId.message.toString()}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2 pt-2">
                    <label className="text-xs text-gray-400">Data</label>
                    <input
                        type="date"
                        {...register("date")}
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        defaultValue={date}
                        readOnly
                    />
                    {errors.date?.message && (
                        <p className="text-xs text-red-400">
                            {getDateError("date")?.toString()}
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

                <div className="flex flex-col gap-1 w-full">
                    <Controller
                        name="studentId"
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                id="studentId"
                                label="Elev"
                                options={stdents}
                                placeholder="Selectează un elev"
                                selectedIds={field.value ? [field.value] : []}
                                onSelectionChange={ids => field.onChange(ids[0] ? ids[0] : "")}
                            />
                        )}
                    />
                    {errors.studentId?.message && (
                        <p className="text-xs text-red-400">
                            {errors.studentId.message.toString()}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-400">Status</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full "
                        {...register("present")}
                        name="present"
                        defaultValue={present}
                        onChange={() => { setPresent(!present) }}
                    >
                        <option value="true">Prezent</option>
                        <option value="false">Absent</option>
                    </select>
                    {errors.present?.message && (
                        <p className="text-xs text-red-400">
                            {errors.present.message.toString()}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-400">Motivat / nemotivat</label>
                    <select
                        className={`ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full ${present ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "ring-gray-300"}`}
                        {...register("excused")}
                        defaultValue={data?.excused !== undefined ? String(data.excused) : "true"}
                        disabled={present}
                    >
                        <option value="true">Motivat</option>
                        <option value="false">Nemotivat</option>
                    </select>
                    {errors.present?.message && (
                        <p className="text-xs text-red-400">
                            {errors.present.message.toString()}
                        </p>
                    )}
                </div>
            </div >

            {state.error && (
                <span className="text-red-500">
                    {state.message || "Something went wrong!"}
                </span>
            )}
            <div className="flex justify-center mt-4 mb-8">
                <button
                    type="submit"
                    className={`bg-blue-500 text-white px-8 py-2 rounded-md text-sm w-max mx-auto hover:bg-blue-600 transition ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={isSubmitting}
                >
                    {type === "create" ? "Adaugă prezența" : "Actualizează prezența"}
                </button>
            </div >
            {isPending &&
                typeof window !== "undefined" &&
                ReactDOM.createPortal(<LoadingPopup />, document.getElementById("global-loading-root")!)
            }
        </form >
    )
};

export default AttendanceForm