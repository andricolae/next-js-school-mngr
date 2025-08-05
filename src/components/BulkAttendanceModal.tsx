"use client"

import { useState } from "react";
import Image from "next/image";
import BulkAttendanceMarker from "./BulkAttendanceMarker";

type Lesson = {
    id: number;
    name: string;
    subject: { name: string };
    class: { name: string; id: number };
};

const BulkAttendanceModal = ({ lessons }: { lessons: Lesson[] }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600 flex items-center gap-2"
            >
                <Image src="/calendar.png" alt="" width={16} height={16} />
                Mark Class Attendance
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <BulkAttendanceMarker
                                lessons={lessons}
                                onClose={() => setIsOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BulkAttendanceModal;