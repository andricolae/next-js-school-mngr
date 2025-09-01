"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { resultSchema, ResultSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createResult, studentsOfClassAssignedToAnAssignment, updateResult } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import LoadingPopup from "@/components/LoadingPopup";
import { useTransition } from "react";

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

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPending, startTransition] = useTransition();

    const onSubmit = handleSubmit(formData => {
        startTransition(() => {
            setIsSubmitting(true);
            const submissionData = {
                ...formData,
                ...(type === "update" && data?.id && { id: data.id }),
            };
            formAction(submissionData);
        });
    })

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            toast(`Notă ${type === "create" ? "adăugată" : "actualizată"} cu succes!`);
            setOpen(false);
            router.refresh();
        }
        if (state.error) {
            const errorMessage = state.message || "Ceva nu a funcționat. Încearcă mai târziu.";
            setIsSubmitting(true);
        }
    }, [state, router, type, setOpen]);

    const { students, exams, assignments } = relatedData;
    const [filteredStudents, setFilteredStudents] = useState(students || []);

    const updateSelect = async (selectedOption: "exam" | "assignment", id: number) => {
        startTransition(async () => {
            if (selectedOption === "exam") {
                const newStudents = students?.filter((t: any) => t.subjects?.some((sub: any) => sub.name === id));
                setFilteredStudents(newStudents || []);
            } else if (selectedOption === "assignment") {
                const newStudents = await studentsOfClassAssignedToAnAssignment(id);
                setFilteredStudents(newStudents || []);
            }
        });
    };

    return (
        <form className="flex flex-col gap-6 mx-auto" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Adaugă o nouă notă" : "Actualizează nota"}</h1>

            <div className=" mt-2 text-xs text-gray-500">
                Important: Pentru a adăuga o notă, selectează un test sau o temă, nu ambele.
            </div>

            <div className="flex flex-col gap-4">
                <InputField
                    label="Nota"
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

                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-400">Elev</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        defaultValue={data?.studentId || ""}
                        {...register("studentId")}
                    >
                        <option value="">Alege un elev</option>
                        {filteredStudents !== undefined ?
                            <>
                                {filteredStudents?.lesson?.class?.students?.map(
                                    (student: { id: string; name: string; surname: string }) => (
                                        <option value={student.id} key={student.id}>
                                            {student.name} {student.surname}
                                        </option>
                                    )
                                )}
                            </>
                            :
                            <></>
                        }
                    </select>
                    {errors.studentId?.message && (
                        <p className="text-xs text-red-400">
                            {errors.studentId.message.toString()}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-400">Test (Opțional)</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        defaultValue={data?.examId || ""}
                        {...register("examId")}
                        onChange={(e) => {
                            setValue("examId", parseInt(e.target.value));
                            setValue("assignmentId", undefined);
                            // const selectedId = e.target.value;
                            // const exam = exams?.find((s: any) => s.id === selectedId);
                            // if (exam) {
                            //     updateSelect("exam", exam.id);
                            // }
                        }}
                    >
                        <option value="">Selectează un test</option>
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

                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-400">Temă (Opțional)</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        defaultValue={data?.assignmentId || ""}
                        {...register("assignmentId")}
                        onChange={(e) => {
                            setValue("assignmentId", parseInt(e.target.value));
                            setValue("examId", undefined);
                            const selectedId = Number(e.target.value);
                            const assignment = assignments?.find((s: any) => s.id === selectedId);
                            if (assignment) {
                                updateSelect("assignment", assignment.id);
                            }
                        }}
                    >
                        <option value="">Selectează o temă</option>
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

            {state.error && (
                <span className="text-red-500">
                    {state.message || "Ceva nu a funcționat. Încearcă mai târziu."}
                </span>
            )}
            <div className="flex justify-center mt-2 mb-8">
                <button
                    type="submit"
                    className={`bg-blue-500 text-white px-8 py-2 rounded-md text-sm w-max mx-auto hover:bg-blue-600 transition ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={isSubmitting}
                >
                    {type === "create" ? "Adaugă nota" : "Actualizează nota"}
                </button>
            </div>
            {isPending && <LoadingPopup />}
        </form>
    )
};

export default ResultForm