"use client"

import { deleteAnnouncement, deleteAssignment, deleteAttendance, deleteClass, deleteEvent, deleteExam, deleteLesson, deleteParent, deleteResult, deleteStudent, deleteSubject, deleteTeacher } from "@/lib/actions";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { FormContainerProps } from "./FormContainer";
import LoadingPopup from "@/components/LoadingPopup";
import { useTransition } from "react";

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
}

const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
    loading: () => <LoadingPopup />,
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
    loading: () => <LoadingPopup />,
});
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
    loading: () => <LoadingPopup />,
});
const ClassForm = dynamic(() => import("./forms/ClassForm"), {
    loading: () => <LoadingPopup />,
});
const ExamForm = dynamic(() => import("./forms/ExamForm"), {
    loading: () => <LoadingPopup />
});
const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"), {
    loading: () => <LoadingPopup />
});
const ResultForm = dynamic(() => import("./forms/ResultForm"), {
    loading: () => <LoadingPopup />
});
const EventForm = dynamic(() => import("./forms/EventForm"), {
    loading: () => <LoadingPopup />
});
const ParentForm = dynamic(() => import("./forms/ParentForm"), {
    loading: () => <LoadingPopup />
});
const LessonForm = dynamic(() => import("./forms/LessonForm"), {
    loading: () => <LoadingPopup />
});
const AttendanceForm = dynamic(() => import("./forms/AttendanceForm"), {
    loading: () => <LoadingPopup />
});
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"), {
    loading: () => <LoadingPopup />
});

const forms: {
    [key: string]: (setOpen: Dispatch<SetStateAction<boolean>>, type: "create" | "update", data?: any, relatedData?: any) => JSX.Element;
} = {
    teacher: (setOpen, type, data, relatedData) => <TeacherForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
    student: (setOpen, type, data, relatedData) => <StudentForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
    parent: (setOpen, type, data, relatedData) => <ParentForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
    subject: (setOpen, type, data, relatedData) => <SubjectForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
    class: (setOpen, type, data, relatedData) => <ClassForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
    lesson: (setOpen, type, data, relatedData) => <LessonForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
    exam: (setOpen, type, data, relatedData) => <ExamForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
    assignment: (setOpen, type, data, relatedData) => <AssignmentForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
    result: (setOpen, type, data, relatedData) => <ResultForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
    attendance: (setOpen, type, data, relatedData) => <AttendanceForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
    event: (setOpen, type, data, relatedData) => <EventForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
    announcement: (setOpen, type, data, relatedData) => <AnnouncementForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
};

const FormModal = ({ table, type, data, id, relatedData }: FormContainerProps & { relatedData?: any }) => {
    const size = type === "create" ? "w-8 h-8" : "w-7 h-7"
    const bgColor =
        type === "create" ? "bg-yellow"
            : type === "update"
                ? "bg-sky"
                : "bg-orange";

    const [open, setOpen] = useState(false);

    const modalWidthClass =
        (table === "teacher" || table === "student") && (type === "create" || type === "update")
            ? "w-[40%] p-3 h-[70%]"
            : table === "subject"
                ? "w-[30%] p-5 h-fit"
                : ["exam", "assignment", "result", "attendance"].includes(table)
                    ? "w-[40%] p-6 h-fit"
                    : ["announcement", "event", "lesson", "class", "teacher", "student", "parent"].includes(table)
                        ? "w-[40%] p-3 h-fit"
                        : "w-[50%] p-4 h-fit";

    const Form = () => {
        const [isPending, startTransition] = useTransition();
        const [state, formAction] = useFormState(deleteActionMap[table], {
            success: false,
            error: false,
        });

        const formActionWrapper = (formData: FormData) => {
            startTransition(() => {
                formAction(formData);
            });
        };

        const router = useRouter();

        useEffect(() => {
            if (state.success) {
                toast(`${table} has been deleted successfully!`);
                setOpen(false);
                router.refresh();
            }
            if (state.error) {
                toast(`${table} nu a putut fi sters. Exista o tema sau un examen asociat`);
                setOpen(false);
            }
        }, [state, router]);

        return type === "delete" && id ? (
            <form action={formActionWrapper} className="p-4 flex flex-col gap-4">
                <input type="text|number" name="id" value={id} hidden readOnly />
                <span className="text-center font-medium">All data will be lost. Are you sure you want to delete this {table}?</span>
                <button className="bg-red-600 text-white py-3 px-4 rounded-md border-none w-max self-center">Delete</button>
                {isPending && <LoadingPopup />}
            </form>
        ) : type === "create" || type === "update" ? (
            forms[table](setOpen, type, data, relatedData)
        ) : "Form not found";
    };

    return <>
        <button
            className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
            onClick={() => { setOpen(true); }}
        >
            <Image src={`/${type}.png`} alt="" width={16} height={16} />
        </button>
        {open && (
            <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
                <div className={`bg-white rounded-md relative ${modalWidthClass} overflow-y-auto`}>

                    {/*<div className="bg-white p-4 rounded-md relative w-[90%] sm:w-[450px] max-w-full">*/}

                    <Form />
                    <div className="absolute top-4 right-4 cursor-pointer" onClick={() => setOpen(false)}>
                        <Image src="/close.png" alt="" width={14} height={14} />
                    </div>
                </div>
            </div>
        )}
    </>;
}
export default FormModal