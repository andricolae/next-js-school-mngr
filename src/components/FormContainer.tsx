import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { auth } from "@clerk/nextjs/server";
import { useEffect } from "react";
import { TokenData } from "@/lib/utils";

export type FormContainerProps = {
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
    data?: any;
    id?: number | string;
}
const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {

    let relatedData = {}

    const { userId, sessionClaims } = await auth();


    // console.log(" userId from auth():", userId);
    // console.log(" sessionClaims:", sessionClaims);
    let tokenData;
    if (sessionClaims !== null) {
        tokenData = sessionClaims as unknown as TokenData;
    }
    let role = tokenData?.userPblcMtdt?.role;

    // console.log("role detected:", role);

    // const role = (sessionClaims?.metadata as {
    // 	role?: "admin" | "teacher" | "student" | "parent";
    // })?.role;

    if (type !== "delete") {
        switch (table) {
            case "subject":
                const subjectTeachers = await prisma.teacher.findMany({
                    select: { id: true, name: true, surname: true },
                });
                relatedData = { teachers: subjectTeachers };
                break;
            case "class":
                const classGrades = await prisma.grade.findMany({
                    select: { id: true, level: true },
                });
                const classTeachers = await prisma.teacher.findMany({
                    select: { id: true, name: true, surname: true },
                });
                relatedData = { teachers: classTeachers, grades: classGrades };
                break;
            case "teacher":
                const teacherSubjects = await prisma.subject.findMany({
                    select: { id: true, name: true },
                });
                relatedData = { subjects: teacherSubjects };
                break;
            case "student":
                const studentGrades = await prisma.grade.findMany({
                    select: { id: true, level: true },
                });
                const studentClasses = await prisma.class.findMany({
                    include: { _count: { select: { students: true } } }
                });
                const studentParents = await prisma.parent.findMany({
                    select: { id: true, name: true, surname: true },
                });
                relatedData = {
                    classes: studentClasses,
                    grades: studentGrades,
                    parents: studentParents
                };
                break;
            case "exam":
                const examLessons = await prisma.lesson.findMany({
                    where: {
                        ...(role === "teacher" ? { teacherId: userId! } : {}),
                    },
                    select: { id: true, name: true },
                });
                relatedData = { lessons: examLessons };
                break;
            case "assignment":
                const assignmentLessons = await prisma.lesson.findMany({
                    where: {
                        ...(role === "teacher" ? { teacherId: userId! } : {}),
                    },
                    select: { id: true, name: true },
                });
                relatedData = { lessons: assignmentLessons };
                break;
            case "result":
                const resultStudents = await prisma.student.findMany({
                    where: {
                        ...(role === "teacher" ? {
                            class: {
                                lessons: {
                                    some: {
                                        teacherId: userId!
                                    }
                                }
                            }
                        } : {}),
                    },
                    select: { id: true, name: true, surname: true },
                });
                const resultExams = await prisma.exam.findMany({
                    where: {
                        ...(role === "teacher" ? {
                            lesson: { teacherId: userId! }
                        } : {}),
                    },
                    select: {
                        id: true,
                        title: true,
                        lesson: {
                            select: {
                                subject: { select: { name: true } },
                                class: { select: { name: true } }
                            }
                        }
                    },
                });
                const resultAssignments = await prisma.assignment.findMany({
                    where: {
                        ...(role === "teacher" ? {
                            lesson: { teacherId: userId! }
                        } : {}),
                    },
                    select: {
                        id: true,
                        title: true,
                        lesson: {
                            select: {
                                subject: { select: { name: true } },
                                class: { select: { name: true } }
                            }
                        }
                    },
                });
                relatedData = {
                    students: resultStudents,
                    exams: resultExams,
                    assignments: resultAssignments
                };
                break;
            case "event":
                const eventClasses = await prisma.class.findMany({
                    where: {
                        ...(role === "teacher" ? {
                            lessons: {
                                some: {
                                    teacherId: userId!
                                }
                            }
                        } : {}),
                    },
                    select: {
                        id: true,
                        name: true,
                        grade: { select: { level: true } }
                    },
                });
                relatedData = { classes: eventClasses };
                break;
            case "announcement":
                const announcementClasses = await prisma.class.findMany({
                    where: {
                        ...(role === "teacher" ? {
                            lessons: {
                                some: {
                                    teacherId: userId!
                                }
                            }
                        } : {}),
                    },
                    select: {
                        id: true,
                        name: true,
                        grade: { select: { level: true } }
                    },
                });
                relatedData = { classes: announcementClasses };
                break;
            case "lesson":
                const lessonSubjects = await prisma.subject.findMany({
                    where: {
                        ...(role === "teacher" ? {
                            teachers: {
                                some: {
                                    id: userId!
                                }
                            }
                        } : {}),
                    },
                    select: { id: true, name: true },
                });
                const lessonClasses = await prisma.class.findMany({
                    select: {
                        id: true,
                        name: true,
                        grade: { select: { level: true } }
                    },
                });
                const lessonTeachers = await prisma.teacher.findMany({
                    select: { id: true, name: true, surname: true, subjects: { select: { id: true, name: true } } },
                });
                relatedData = {
                    subjects: lessonSubjects,
                    classes: lessonClasses,
                    teachers: lessonTeachers
                };
                break;
            case "parent":
                const availableStudents = await prisma.student.findMany({
                    where: {
                        parentId: data ? data.id : undefined,
                    },
                    select: { id: true, name: true, surname: true },
                });
                relatedData = { students: availableStudents };
                break;
            case "attendance":
                const attendanceStudents = await prisma.student.findMany({
                    where: {
                        ...(role === "teacher" ? {
                            class: {
                                lessons: {
                                    some: {
                                        teacherId: userId!
                                    }
                                }
                            }
                        } : {}),
                    },
                    select: { id: true, name: true, surname: true, username: true },
                });
                const attendanceLessons = await prisma.lesson.findMany({
                    where: {
                        ...(role === "teacher" ? { teacherId: userId! } : {}),
                    },
                    select: {
                        id: true,
                        name: true,
                        subject: { select: { name: true } },
                        class: { select: { name: true } }
                    },
                });
                relatedData = {
                    students: attendanceStudents,
                    lessons: attendanceLessons
                };
                break;
            default:
                break;
        }
    }

    return (
        <div className=''><FormModal table={table} type={type} data={data} id={id} relatedData={relatedData} /></div>
    )
}

export default FormContainer