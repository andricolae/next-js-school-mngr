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
        numarAdeverinta: false,
        motivAdeverinta: false,
        anScolarStart: false,
        anScolarSfarsit: false,
    });

    const [state, formAction] = useFormState(type === "create"
        ? createAssignment : updateAssignment, { success: false, error: false })

    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const numarAdeverinta = formData.get("numarAdeverinta");
        const motivAdeverinta = formData.get("motivAdeverinta");
        const anScolarStart = formData.get("anScolarStart");
        const anScolarSfarsit = formData.get("anScolarSfarsit");

        if (numarAdeverinta === "" || motivAdeverinta === "") {
            const newErrors = {
                numarAdeverinta: !numarAdeverinta,
                motivAdeverinta: !motivAdeverinta,
                anScolarStart: !anScolarStart,
                anScolarSfarsit: !anScolarSfarsit,
            };

            setErrorsInputs(newErrors);
            return;
        }
        setIsSubmitting(true);

        generateRaportAbsentePDF("UnitateInvatamant", "Scoala", new Date().toLocaleDateString("en-GB").replace(/\//g, "."),
            "NumeIon", "PrenumePopa", "mai 2025");
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
                <h1 className="text-cl font-semibold">{type === "create" ? "Adeverinta student" : "Update the assignment"}</h1>
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-400">Numar adeverinta: </label>
                    <input
                        type="text"
                        name="numarAdeverinta"
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        defaultValue=""
                    />
                    {errorsInputs.numarAdeverinta && (
                        <span className="text-red-500 text-sm">Acest camp este obligatoriu.</span>
                    )}
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-400">Adeverinta serveste la: </label>
                    <input
                        type="text"
                        name="motivAdeverinta"
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        defaultValue=""
                    />
                    {errorsInputs.motivAdeverinta && (
                        <span className="text-red-500 text-sm">Acest camp este obligatoriu.</span>
                    )}
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-400">Anul scolar(inceput):</label>
                    <select
                        name="anScolarStart"
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        defaultValue=""
                    >
                        <option value="" disabled hidden className="h-12">Alege un an</option>
                        {Array.from({ length: 2040 - 1989 + 1 }, (_, i) => {
                            const year = 1989 + i;
                            return <option key={year} value={year}>{year}</option>;
                        })}
                    </select>
                    {errorsInputs.anScolarStart && (
                        <span className="text-red-500 text-sm">Acest câmp este obligatoriu.</span>
                    )}
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-400">Anul scolar(sfarsit):</label>
                    <select
                        name="anScolarSfarsit"
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        defaultValue=""
                    >
                        <option value="" disabled hidden>Alege un an</option>
                        {Array.from({ length: 2040 - 1989 + 1 }, (_, i) => {
                            const year = 1989 + i;
                            return <option key={year} value={year}>{year}</option>;
                        })}
                    </select>
                    {errorsInputs.anScolarSfarsit && (
                        <span className="text-red-500 text-sm">Acest câmp este obligatoriu.</span>
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
