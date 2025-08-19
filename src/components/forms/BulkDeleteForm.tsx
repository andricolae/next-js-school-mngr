"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import LoadingPopup from "@/components/LoadingPopup";

type DeleteLessonsState = {
    success: boolean;
    error: boolean | string;
};

const BulkDeleteForm = ({
    formActionWrapper,
    table,
}: {
    formActionWrapper: (
        prevState: DeleteLessonsState,
        formData: FormData
    ) => Promise<DeleteLessonsState>;
    table: string;
}) => {
    const [open, setOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string>("");

    const handleOpen = () => {
        setError("");
        const checked = Array.from(
            document.querySelectorAll<HTMLInputElement>(
                'input[name="lessonIds"]:checked'
            )
        );
        const ids = checked.map((el) => parseInt(el.value, 10));

        setSelectedIds(ids);
        setOpen(true);
    };

    const [state, formAction] = useFormState<DeleteLessonsState, FormData>(
        formActionWrapper,
        { success: false, error: false }
    );

    const formActionWithTransition = (formData: FormData) => {
        startTransition(() => {
            formAction(formData);
        });
    };

    useEffect(() => {
        console.log(state);
        if (state?.success) {
            toast(`Lessons have been deleted successfully!`);
            setSelectedIds([]);
            setOpen(false);
        }
        if (state?.error) {
            setError("Lectiile nu au putut fi sterse");
        }
    }, [state]);

    return (
        <>
            <button
                type="button"
                className="w-7 h-7 flex items-center justify-center rounded-full bg-orange"
                onClick={handleOpen}
            >
                <Image src={`/delete.png`} alt="Sterge" width={16} height={16} />
            </button>

            {open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-md shadow-lg w-[50%] p-4 h-fit relative">
                        {/* Close button in top-right */}
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                            aria-label="Close"
                        >
                            <Image src={`/close.png`} alt="" width={16} height={16} />
                        </button>

                        <form action={formActionWithTransition} className="flex flex-col gap-4">
                            {selectedIds.map((id) => (
                                <input
                                    key={id}
                                    type="hidden"
                                    name="lessonIds"
                                    value={id}
                                    readOnly
                                />
                            ))}

                            <span className="text-center font-medium">
                                All data will be lost. Are you sure you want to delete{" "}
                                {selectedIds.length} {table}
                                {selectedIds.length > 1 ? "s" : ""}?
                            </span>

                            <div className="flex gap-2 justify-center">
                                <button
                                    type="submit"
                                    className="bg-red-600 text-white py-2 px-4 rounded-md"
                                >
                                    Delete
                                </button>
                            </div>

                            {error !== "" && (
                                <span className="text-red-500 text-center">
                                    {error}
                                </span>
                            )}

                            {isPending && <LoadingPopup />}
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default BulkDeleteForm;
