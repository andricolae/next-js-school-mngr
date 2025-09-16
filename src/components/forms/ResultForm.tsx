"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import InputField from "@/components/InputField";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { resultSchema, ResultSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createResult, updateResult } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import LoadingPopup from "@/components/LoadingPopup";
import { useTransition } from "react";
import { MultiSelect } from "@/components/forms/FilterForm";

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
        control,
        formState: { errors },
        watch,
        setValue,
        reset
    } = useForm<ResultSchema>({
        resolver: zodResolver(resultSchema),
        defaultValues: type === "update" && data ? {
            // id: data.id,
            // score: data.score,
            studentId: data.studentId || "",
            examId: data.examId || undefined,
            assignmentId: data.assignmentId || undefined,
            // resultDate: data.resultDate,
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

    const getDateError = (field: "resultDate") => {
        const err = errors[field];
        if (err?.message === "Invalid date") {
            return "Data este obligatorie!";
        }
        return err?.message;
    };

    const stdents: any[] = students?.map((stud: any) => ({
        id: stud.id.toString(),
        name: stud.name + " " + stud.surname,
    })) || [];

    const exms: any[] = exams?.map((exam: any) => ({
        id: exam.id.toString(),
        name: exam.title + " - " + exam.lesson.subject.name + " (" + exam.lesson.class.name + ")",
    })) || [];

    const asignments: any[] = assignments?.map((assign: any) => ({
        id: assign.id.toString(),
        name: assign.title + " - " + assign.lesson.subject.name + " (" + assign.lesson.class.name + ")",
    })) || [];

    return (
        <form className="flex flex-col gap-6 mx-auto" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Adaugă o nouă notă" : "Actualizează nota"}</h1>

            <div className="mt-2 text-xs text-gray-500">
                Important: Pentru a adăuga o notă, selectează un test sau o temă, nu ambele.
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-400 mb-1 block">Nota</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("score")}
                        defaultValue={data?.score}
                    >
                        <option value="">Selectează nota</option>
                        <option value="10">10</option>
                        <option value="9">9</option>
                        <option value="8">8</option>
                        <option value="7">7</option>
                        <option value="6">6</option>
                        <option value="5">5</option>
                        <option value="4">4</option>
                        <option value="3">3</option>
                        <option value="2">2</option>
                        <option value="1">1</option>
                        <option value="FB">FB</option>
                        <option value="B">B</option>
                        <option value="S">S</option>
                        <option value="I">I</option>
                    </select>
                    {errors.score?.message && (
                        <p className="text-xs text-red-400">
                            {errors.score.message.toString()}
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
                                onSelectionChange={(ids) => field.onChange(ids[0] ?? "")}
                            />
                        )}
                    />
                    {errors.studentId?.message && (
                        <p className="text-xs text-red-400">
                            {errors.studentId.message.toString()}
                        </p>
                    )}
                </div>

                <InputField
                    label="Data obținerii notei"
                    name="resultDate"
                    type="date"
                    defaultValue={data?.resultDate !== undefined ? new Date(data?.resultDate).toISOString().split("T")[0] : ""}
                    register={register}
                    error={getDateError("resultDate")}
                />

                <div className="flex flex-col gap-2 w-full">
                    <Controller
                        name="examId"
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                id="examId"
                                label="Test (Opțional)"
                                options={exms}
                                placeholder="Selectează un test"
                                selectedIds={field.value?.toString() ? [field.value.toString()] : []}
                                onSelectionChange={(ids) => field.onChange(ids[0] ?? "")}
                            />
                        )}
                    />
                    {errors.examId?.message && (
                        <p className="text-xs text-red-400">
                            {errors.examId.message.toString()}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2 w-full">
                    <Controller
                        name="assignmentId"
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                id="assignmentId"
                                label="Temă (Opțional)"
                                options={asignments}
                                placeholder="Selectează o temă"
                                selectedIds={field.value?.toString() ? [field.value.toString()] : []}
                                onSelectionChange={(ids) => field.onChange(ids[0] ?? "")}
                            />
                        )}
                    />
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

export default ResultForm;
