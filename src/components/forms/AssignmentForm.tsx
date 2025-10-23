"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { assignmentSchema, AssignmentSchema } from "@/lib/formValidationSchemas";
import { createAssignment, updateAssignment } from "@/lib/actions";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useTransition } from "react";
import { MultiSelect } from "@/components/forms/ResultsFilterForm";
import ReactDOM from "react-dom";
import dynamic from "next/dynamic";
const LoadingPopup = dynamic(() => import("@/components/LoadingPopup"), { ssr: false });
const InputField = dynamic(() => import("@/components/InputField"), { ssr: false });

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
        control,
        formState: { errors, touchedFields, isSubmitted },
        setValue,
    } = useForm<AssignmentSchema>({
        resolver: zodResolver(assignmentSchema),
        defaultValues: type === "update" && data ? {
            lessonId: data?.lessonId || "",
        } : {}
    });

    const [state, formAction] = useFormState(type === "create"
        ? createAssignment : updateAssignment, { success: false, error: false })

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPending, startTransition] = useTransition();

    const onSubmit = handleSubmit(data => {
        startTransition(() => {
            setIsSubmitting(true);
            const formattedData = {
                ...data,
                startDate: data.startDate,
                dueDate: new Date(data.dueDate)
            };
            formAction(formattedData);
        });
    })

    const router = useRouter();

    useEffect(() => {
        if (!state) return;
        if (state.success) {
            toast(`Temă ${type === "create" ? "creată" : "actualizată"} cu succes!`);
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

    const getDateError = (field: "dueDate") => {
        const err = errors[field];

        if (isSubmitted && !touchedFields[field] && !err) {
            return "Data limită este obligatorie!";
        }
        if (err?.message === "Invalid date") {
            return "Data limită este obligatorie!";
        }
        return err?.message;
    };

    const { lessons } = relatedData;

    const [startDate, setStartDate] = useState<any>(data?.startDate ? new Date(data.startDate).toISOString().split('T')[0] : undefined);

    const lesons = lessons.map((lesson: any) => ({
        id: lesson.id.toString(),
        name: `${lesson.name} - ${lesson.class.name} (${new Date(lesson.startTime).toLocaleDateString("ro-RO")})`,
    })) || [];

    return (
        <form className="flex flex-col gap-4 max-auto" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">{type === "create" ? "Adaugă o nouă temă" : "Actualizează tema"}</h1>

            <div className="flex flex-col gap-6">
                <InputField
                    label="Titlu temă"
                    name="title"
                    defaultValue={data?.title}
                    register={register}
                    error={errors?.title}
                />

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
                                            await setStartDate(new Date(lesson.startTime).toISOString().split("T")[0]);
                                            await setValue("startDate", new Date(lesson.startTime).toISOString().split("T")[0]);
                                        }
                                    }
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


                <InputField
                    label="Descriere"
                    name="description"
                    defaultValue={data?.description}
                    register={register}
                    error={errors?.description}
                />
                <InputField
                    label="Dată începere"
                    name="startDate"
                    // defaultValue={data?.startDate ? new Date(data.startDate).toISOString().split('T')[0] : undefined}
                    defaultValue={startDate}
                    register={register}
                    // error={getDateError("startDate")}
                    type="date"
                    readOnly={true}
                />
                <InputField
                    label="Dată limită"
                    name="dueDate"
                    defaultValue={data?.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : undefined}
                    register={register}
                    error={getDateError("dueDate")}
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
            </div>
            {state.error && (
                <span className="text-red-500">
                    {state.message || "Ceva nu a funcționat. Încearcă mai târziu."}
                </span>
            )}
            <div className="flex justify-center mt-4 mb-8">
                <button
                    type="submit"
                    className={`bg-blue-500 text-white px-8 py-2 rounded-md text-sm w-max mx-auto hover:bg-blue-600 transition ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={isSubmitting}
                >
                    {type === "create" ? "Adaugă tema" : "Actualizează tema"}
                </button>
            </div>
            {isPending &&
                typeof window !== "undefined" &&
                ReactDOM.createPortal(<LoadingPopup />, document.getElementById("global-loading-root")!)
            }
        </form>
    )
};

export default AssignmentForm