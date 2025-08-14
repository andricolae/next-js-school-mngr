"use client";
import { useState } from "react";
import Image from "next/image";

export default function BulkDeleteForm({
    formActionWrapper,
    table,
}: {
    formActionWrapper: any;
    table: string;
}) {
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const handleOpen = () => {
        const checked = Array.from(
            document.querySelectorAll<HTMLInputElement>(
                'input[name="lessonIds"]:checked'
            )
        );
        const ids = checked.map((el) => parseInt(el.value, 10));

        setSelectedIds(ids);
        setOpen(true);
    };

    const handleSubmit = async (formData: FormData) => {
        setIsPending(true);
        await formActionWrapper(formData);
        setIsPending(false);
        setOpen(false);
        setSelectedIds([]);
    };

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
                    <div className="bg-white rounded-md shadow-lg p-4 w-[300px]">
                        <form action={handleSubmit} className="flex flex-col gap-4">
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
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="bg-gray-300 py-2 px-4 rounded-md"
                                >
                                    Cancel
                                </button>
                            </div>
                            {isPending && <div>Loading...</div>}
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
