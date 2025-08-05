"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { assignmentSchema, AssignmentSchema } from "@/lib/formValidationSchemas";
import { createAssignment, updateAssignment } from "@/lib/actions";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { generateCertificatePDF } from "@/components/AdeverintaElev";

const AdeverintaElevForm = ({
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
    });

    const [state, formAction] = useFormState(type === "create"
        ? createAssignment : updateAssignment, { success: false, error: false })

    const onSubmit = (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const numarAdeverinta = formData.get("numarAdeverinta");
        const motivAdeverinta = formData.get("motivAdeverinta");

        if (numarAdeverinta === "" || motivAdeverinta === "") {
            const newErrors = {
                numarAdeverinta: !numarAdeverinta,
                motivAdeverinta: !motivAdeverinta,
            };

            setErrorsInputs(newErrors);
            return;
        }

        generateCertificatePDF("Scoala Loamnes", numarAdeverinta, new Date().toLocaleDateString("de-DE").replace(/\//g, "."),
            "Ion", "1 C", "111122223456789", "24", "25", motivAdeverinta);
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
            </div>
            <button type="submit" className="bg-blue-500 text-white p-2 rounded-md w-fit"> {type === "create" ? "Descarca" : "Update"} </button>
        </form>
    )
};

export default AdeverintaElevForm;
