"use client"

import { deleteAnnouncement, deleteAssignment, deleteAttendance, deleteClass, deleteEvent, deleteExam, deleteLesson, deleteParent, deleteResult, deleteStudent, deleteSubject, deleteTeacher } from "@/lib/actions";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { FormContainerProps } from "./FormContainer";

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
    loading: () => <h1>Loading...</h1>,
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
    loading: () => <h1>Loading...</h1>,
});
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
    loading: () => <h1>Loading...</h1>,
});
const ClassForm = dynamic(() => import("./forms/ClassForm"), {
    loading: () => <h1>Loading...</h1>,
});
const ExamForm = dynamic(() => import("./forms/ExamForm"), {
    loading: () => <h1>Loading...</h1>
});
const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"), {
    loading: () => <h1>Loading...</h1>
});
const ResultForm = dynamic(() => import("./forms/ResultForm"), {
    loading: () => <h1>Loading...</h1>
});
const EventForm = dynamic(() => import("./forms/EventForm"), {
    loading: () => <h1>Loading...</h1>
});
const ParentForm = dynamic(() => import("./forms/ParentForm"), {
    loading: () => <h1>Loading...</h1>
});
const LessonForm = dynamic(() => import("./forms/LessonForm"), {
    loading: () => <h1>Loading...</h1>
});
const AttendanceForm = dynamic(() => import("./forms/AttendanceForm"), {
    loading: () => <h1>Loading...</h1>
});
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"), {
    loading: () => <h1>Loading...</h1>
});

const forms: {
    [key: string]: (setOpen: Dispatch<SetStateAction<boolean>>, type: "create" | "update", data?: any, relatedData?:any) => JSX.Element;
} = {
    teacher: (setOpen, type, data, relatedData) => <TeacherForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
    student: (setOpen, type, data, relatedData) => <StudentForm type={type} data={data} setOpen={setOpen} relatedData={relatedData}  />,
    parent: (setOpen, type, data, relatedData) => <ParentForm type={type} data={data} setOpen={setOpen} relatedData={relatedData}  />,
    subject: (setOpen, type, data, relatedData) => <SubjectForm type={type} data={data} setOpen={setOpen} relatedData={relatedData}  />,
    class: (setOpen, type, data, relatedData) => <ClassForm type={type} data={data} setOpen={setOpen} relatedData={relatedData}  />,
    lesson: (setOpen, type, data, relatedData) => <LessonForm type={type} data={data} setOpen={setOpen} relatedData={relatedData}  />,
    exam: (setOpen, type, data, relatedData) => <ExamForm type={type} data={data} setOpen={setOpen} relatedData={relatedData}  />,
    assignment: (setOpen, type, data, relatedData) => <AssignmentForm type={type} data={data} setOpen={setOpen} relatedData={relatedData}  />,
    result: (setOpen, type, data, relatedData) => <ResultForm type={type} data={data} setOpen={setOpen} relatedData={relatedData}  />,
    attendance: (setOpen, type, data, relatedData) => <AttendanceForm type={type} data={data} setOpen={setOpen} relatedData={relatedData}  />,
    event: (setOpen, type, data, relatedData) => <EventForm type={type} data={data} setOpen={setOpen} relatedData={relatedData}  />,
    announcement: (setOpen, type, data, relatedData) => <AnnouncementForm type={type} data={data} setOpen={setOpen} relatedData={relatedData}  />,
};

const FormModal = ({ table, type, data, id, relatedData }: FormContainerProps & {relatedData?: any}) => {
    const size = type === "create" ? "w-8 h-8" : "w-7 h-7"
    const bgColor =
        type === "create" ? "bg-yellow"
            : type === "update"
                ? "bg-sky"
                : "bg-orange";

    const [open, setOpen] = useState(false);

const modalWidthClass = table === "subject"
  ? "w-[30%] p-5 h-[50%]"
  : ["exam", "assignment", "result", "attendance"].includes(table)
    ? "w-[40%] p-6 h-[70%]"   
    : [ "announcement", "event", "lesson", "class", "teacher", "student", "parent"].includes(table)
      ? "w-[40%] p-3 h-[80%]"
      : "w-[50%] p-4 h-[80%]";


    const Form = () => {

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
            forms[table](setOpen, type, data, relatedData)
        ) : "Form not found";
    };

    return <>
        <button
            className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
            onClick={() => {setOpen(true); }}
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