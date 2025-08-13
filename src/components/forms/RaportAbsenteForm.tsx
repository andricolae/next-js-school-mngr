"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { assignmentSchema, AssignmentSchema } from "@/lib/formValidationSchemas";
import { createAssignment, updateAssignment } from "@/lib/actions";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { generateRaportAbsentePDF } from "@/components/RaportAbsente";

const RaportAbsenteForm = ({
    type,
    data,
    setOpen,
    relatedData,
    student,
}: {
    type: "create" | "update";
    data?: any;
    setOpen: Dispatch<SetStateAction<boolean>>;
    relatedData?: any;
    student: any
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AssignmentSchema>({
        resolver: zodResolver(assignmentSchema),
    });

    const [errorsInputs, setErrorsInputs] = useState({
        selectedMonthForReport: false,
    });

    const [state, formAction] = useFormState(type === "create"
        ? createAssignment : updateAssignment, { success: false, error: false })

    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = (e: any) => {

        e.preventDefault();
        const formData = new FormData(e.target);
        const selectedMonthForReport = formData.get("selectedMonthForReport") as string;

        if (selectedMonthForReport === null) {
            const newErrors = {
                selectedMonthForReport: !selectedMonthForReport,
            };

            setErrorsInputs(newErrors);
            return;
        }
        setIsSubmitting(true);
        let absente = [{ data: "01.05", status: "motivata" }, { data: "07.05", status: "nemotivata" }, { data: "09.05", status: "motivata" }]

        generateRaportAbsentePDF("UnitateInvatamant", new Date().toLocaleDateString("en-GB").replace(/\//g, "."),
            student?.surname, student?.name, selectedMonthForReport, absente);
        setOpen(false);
        setIsSubmitting(false);
    }

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            toast(`Assignment has been ${type === "create" ? "created" : "updated"} successfully!`);
            setOpen(false);
            router.refresh();
        }

        if (state.error) {
            const errorMessage = state.message || "Something went wrong!";
            setIsSubmitting(false);
        }
    }, [state, router, type, setOpen]);

    return (
        <form className="flex flex-col gap-8 items-center" onSubmit={onSubmit}>
            <div className="flex flex-col gap-4 w-full">
                <h1 className="text-cl font-semibold">{type === "create" ? "Raport absente" : "Update the assignment"}</h1>
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-400">Raport absente pentru luna:</label>
                    <select
                        name="selectedMonthForReport"
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        defaultValue=""
                    >
                        <option value="" disabled hidden className="h-12">
                            Alege o lună
                        </option>
                        {(() => {
                            const options = [];
                            const now = new Date();
                            const currentYear = now.getFullYear();
                            const previousYear = currentYear - 1;

                            const monthNames = [
                                "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
                                "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"
                            ];

                            // Last 4 months of previous year (Sep–Dec)
                            for (let month = 8; month <= 11; month++) {
                                options.push(
                                    <option
                                        key={`${previousYear}-${month}`}
                                        value={`${previousYear}-${month + 1}`}
                                    >
                                        {`${monthNames[month]} ${previousYear}`}
                                    </option>
                                );
                            }

                            // First 7 months of current year (Jan–Jul)
                            for (let month = 0; month <= 6; month++) {
                                options.push(
                                    <option
                                        key={`${currentYear}-${month}`}
                                        value={`${currentYear}-${month + 1}`}
                                    >
                                        {`${monthNames[month]} ${currentYear}`}
                                    </option>
                                );
                            }

                            return options;
                        })()}
                    </select>
                    {errorsInputs.selectedMonthForReport && (
                        <span className="text-red-500 text-sm">
                            Acest câmp este obligatoriu.
                        </span>
                    )}
                </div>
            </div>
            <button type="submit"
                className={`bg-blue-500 transition ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""} text-white p-2 rounded-md w-fit`}
                disabled={isSubmitting}
            >
                {type === "create" ? "Descarca" : "Update"}
            </button>
        </form>
    )
};

export default RaportAbsenteForm;
