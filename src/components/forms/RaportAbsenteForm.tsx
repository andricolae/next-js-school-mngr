"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { assignmentSchema, AssignmentSchema } from "@/lib/formValidationSchemas";
import { createAssignment, readAttendanceData, updateAssignment } from "@/lib/actions";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { generateRaportAbsentePDF } from "@/components/RaportAbsente";
import { schoolData } from "@/lib/schoolData";
import { useTransition } from "react";
import ReactDOM from "react-dom";
import dynamic from "next/dynamic";
const LoadingPopup = dynamic(() => import("@/components/LoadingPopup"), { ssr: false });

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
    const [isPending, startTransition] = useTransition();


    const onSubmit = async (e: any) => {
        e.preventDefault();
        startTransition(async () => {
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
            const result = await readAttendanceData(student.id, selectedMonthForReport);
            const absente = result.data?.[0];

            console.log(result.data?.[0])

            generateRaportAbsentePDF(schoolData[0].name, new Date().toLocaleDateString("ro-RO").replace(/\//g, "."),
                student?.surname, student?.name, selectedMonthForReport, absente);
            setOpen(false);
            setIsSubmitting(false);
        });
    }

    const router = useRouter();

    useEffect(() => {
        if (!state) return;
        if (state.success) {
            toast(`Assignment has been ${type === "create" ? "created" : "updated"} successfully!`);
            setOpen(false);
            startTransition(() => {
                router.refresh();
            });
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
                            const options: any = [];
                            const now = new Date();
                            const currentMonth = now.getMonth(); // 0..11
                            const currentYear = now.getFullYear();
                            const prevYear = currentYear - 1;
                            const nextYear = currentYear + 1;

                            const monthNames = [
                                "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
                                "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"
                            ];

                            const pushOption = (year: any, monthIndex: any) => {
                                const value = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
                                options.push(
                                    <option key={`${year}-${monthIndex}`} value={value}>
                                        {`${monthNames[monthIndex]} ${year}`}
                                    </option>
                                );
                            };

                            if (currentMonth <= 7) {
                                for (let m = 8; m <= 11; m++) pushOption(prevYear, m);
                                for (let m = 0; m <= 6; m++) pushOption(currentYear, m);
                            } else {
                                for (let m = 8; m <= 11; m++) pushOption(currentYear, m);
                                for (let m = 0; m <= 6; m++) pushOption(nextYear, m);
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
            {isPending &&
                typeof window !== "undefined" &&
                ReactDOM.createPortal(<LoadingPopup />, document.getElementById("global-loading-root")!)
            }
        </form>
    )
};

export default RaportAbsenteForm;
