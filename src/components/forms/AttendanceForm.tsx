"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { AttendanceFormData, attendanceSchema } from "@/lib/formValidationSchemas";
import { createAttendance, updateAttendance } from "@/lib/actions";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import LoadingPopup from "@/components/LoadingPopup";
import { useTransition } from "react";

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
        formState: { errors, touchedFields, isSubmitted },
    } = useForm<AttendanceFormData>({
        resolver: zodResolver(attendanceSchema),
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
        if (state.success) {
            toast(`Prezență ${type === "create" ? "adăugată" : "actualizată"} cu succes!`);
            setOpen(false);
            router.refresh();
        }
        if (state.error) {
            const errorMessage = state.message || "Ceva nu a funcționat. Încearcă mai târziu.";
            setIsSubmitting(true);
        }
    }, [state, router, type, setOpen]);

    const { students, lessons } = relatedData || {};
    const [filteredStudents, setFilteredStudents] = useState(students || []);
    const [filteredLessons, setFilteredLessons] = useState(lessons || []);
    const [date, setDate] = useState<any>(data?.date ? new Date(data.date).toISOString().split('T')[0] : undefined);

    const updateSelect = (selectedOption: "student" | "lesson", classId: string | number, lesson?: any) => {
        if (selectedOption === "student") {
            const newLessons = lessons?.filter((l: any) => String(l.classId) === String(classId));
            setFilteredLessons(newLessons || []);
        } else if (selectedOption === "lesson") {
            setDate(new Date(lesson.startTime).toISOString().split('T')[0]);
            const newStudents = students?.filter((s: any) => String(s.classId) === String(classId));
            setFilteredStudents(newStudents || []);
        }
    };

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

    return (

        <form
            className="flex flex-col gap-6 w-full "
            onSubmit={onSubmit}
        >

            <h1 className="text-xl font-semibold">{type === "create" ? "Adaugă o nouă prezență" : "Actualizează prezența"}</h1>

            <div className="flex flex-col gap-4 w-full">
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-400">Ora</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("lessonId")}
                        defaultValue={data?.lessonId}
                        onChange={(e) => {
                            const selectedId = Number(e.target.value);
                            const lesson = filteredLessons?.find((s: any) => s.id === selectedId);
                            if (lesson) {
                                updateSelect("lesson", lesson.classId, lesson);
                            }
                        }}
                    >
                        <option value="">Alege o oră</option>
                        {filteredLessons?.map(
                            (lesson: { id: number; name: string; subject: { name: string }; class: { name: string } }) => (
                                <option value={lesson.id} key={lesson.id}>
                                    {lesson.subject.name} - {lesson.class.name} ({lesson.name})
                                </option>
                            )
                        )
                        }
                    </select >
                    {
                        errors.lessonId?.message && (
                            <p className="text-xs text-red-400">
                                {errors.lessonId.message.toString()}
                            </p>
                        )
                    }
                </div>








                {/* <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-400">Data</label>
                    <input
                        type="date"
                        className={`ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full bg-gray-100 text-gray-400`}
                        {...register("date")}
                        defaultValue={data?.date !== undefined ? String(data.date) : ""}
                    // readOnly
                    />
                    {errors.date?.message && (
                        <p className="text-xs text-red-400">
                            {errors.date.message.toString()}
                        </p>
                    )}
                </div> */}

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
                            {errors.date.message.toString()}
                        </p>
                    )}
                </div>

                {/* <InputField
                    label="Data"
                    name="date"
                    type="date"
                    defaultValue={date}
                    register={register}
                    error={getDateError("date")}
                /> */}











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
                    <label className="text-xs text-gray-400">Elev</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("studentId")}
                        defaultValue={data?.studentId}
                        onChange={(e) => {
                            const selectedId = e.target.value;
                            const student = filteredStudents?.find((s: any) => s.id === selectedId);
                            if (student) {
                                updateSelect("student", student.classId);
                            }
                        }}
                    >
                        <option value="">Alege un elev</option>
                        {filteredStudents?.map(
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
            {isPending && <LoadingPopup />}
        </form >
    )
};

export default AttendanceForm