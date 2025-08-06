"use client";
import { deleteAnnouncement, deleteAssignment, deleteAttendance, deleteClass, deleteEvent, deleteExam, deleteLesson, deleteParent, deleteResult, deleteStudent, deleteSubject, deleteTeacher } from "@/lib/actions";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import LoadingPopup from "@/components/LoadingPopup";

const deleteActionMap = {
    subject: deleteSubject,
    class: deleteClass,
    lesson: deleteLesson,
    exam: deleteExam,
    assignment: deleteAssignment,
    result: deleteResult,
    attendance: deleteAttendance,
    event: deleteEvent,
    announcement: deleteAnnouncement,
    parent: deleteParent,
    teacher: deleteTeacher,
    student: deleteStudent,
};

export type FormContainerPropsCustom2 = {
    table:
    "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement";
    type:
    "create"
    | "update"
    | "delete";
    title: any;
    student: any;
    results?: any;
    data?: any;
    id?: number | string;
};

const AdeverintaElevForm = dynamic(() => import("./forms/AdeverintaElevForm"), {
    loading: () => <LoadingPopup />,
});
const FoaieMatricolaForm = dynamic(() => import("./forms/FoaieMatricolaForm"), {
    loading: () => <LoadingPopup />,
});

const forms: {
    [key: string]: (setOpen: Dispatch<SetStateAction<boolean>>, type: "create" | "update", data?: any, relatedData?: any, student?: any, results?: any) => JSX.Element;
} = {
    teacher: (setOpen, type, data, relatedData, student) => <AdeverintaElevForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} student={student} />,
    parent: (setOpen, type, data, relatedData, student, results) => <FoaieMatricolaForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} student={student} results={results} />,
};

const FormModalCustom = ({ table, type, title, student, data, id, relatedData, results }: FormContainerPropsCustom2 & { relatedData?: any }) => {
    const [open, setOpen] = useState(false);

    const Form = (props: any) => {

        const [state, formAction] = useFormState(deleteActionMap[table], {
            success: false,
            error: false,
        });

        const router = useRouter();

        useEffect(() => {
            if (state.success) {
                toast(`${table} has been deleted successfully!`);
                setOpen(false);
                router.refresh();
            }
        }, [state, router]);

        return type === "delete" && id ? (
            <form action={formAction} className="p-4 flex flex-col gap-4">
                <input type="text|number" name="id" value={id} hidden />
                <span className="text-center font-medium">All data will be lost. Are you sure you want to delete this {table}?</span>
                <button className="bg-red-600 text-white py-3 px-4 rounded-md border-none w-max self-center">Delete</button>
            </form>
        ) : type === "create" || type === "update" ? (
            forms[table](setOpen, type, data, relatedData, student, results)
        ) : "Form not found";
    };

    return (
        <>
            <button
                className={`p-3 rounded-md bg-skyLight`}
                onClick={() => setOpen(true)}
            >
                {title}
            </button>
            {open && (
                <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
                        <Form />
                        <div className="absolute top-4 right-4 cursor-pointer" onClick={() => setOpen(false)}>
                            <Image src="/close.png" alt="" width={14} height={14} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FormModalCustom;
