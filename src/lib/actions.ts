"use server"
import { auth, clerkClient } from "@clerk/nextjs/server";
import { AnnouncementSchema, AssignmentSchema, AttendanceActionData, ClassSchema, EventSchema, ExamSchema, LessonSchema, ParentSchema, ResultSchema, StudentSchema, SubjectSchema, TeacherSchema } from "./formValidationSchemas";
import prisma from "./prisma";
import { TokenData } from "@/lib/utils";

type CurrentState = { success: boolean; error: boolean | string };
export const createSubject = async (currentState: CurrentState, data: SubjectSchema) => {
    try {
        await prisma.subject.create({
            data: {
                name: data.name,
                teachers: {
                    connect: data.teachers.map((teacherId) => ({ id: teacherId })),
                },
            },
        });
        return { success: true, error: false }

    } catch (e: any) {
        e.message = getFriendlyErrorMessage(e);
        return { success: false, error: true, message: e.message }
    }
}

export const updateSubject = async (currentState: CurrentState, data: SubjectSchema) => {
    try {
        await prisma.subject.update({
            where: {
                id: data.id
            },
            data: {
                name: data.name,
                teachers: {
                    set: data.teachers.map((teacherId) => ({ id: teacherId })),
                },
            },
        });
        return { success: true, error: false }

    } catch (e: any) {
        e.message = getFriendlyErrorMessage(e);
        return { success: false, error: true, message: e.message }
    }
}

export const deleteSubject = async (currentState: CurrentState, data: FormData) => {
    const id = data.get("id") as string;
    try {
        await prisma.subject.delete({
            where: {
                id: parseInt(id),
            },
        });
        return { success: true, error: false }

    } catch (e) {
        console.log(e);
        return { success: false, error: true }
    }
}

export const createClass = async (currentState: CurrentState, data: ClassSchema) => {
    try {
        const { id, ...createData } = data;
        await prisma.class.create({
            data: {
                name: createData.name,
                capacity: createData.capacity,
                supervisor: createData.supervisorId ? {
                    connect: { id: createData.supervisorId }
                } : undefined,
                grade: {
                    connect: { id: createData.gradeId }
                }
            },
        });
        return { success: true, error: false }

    } catch (e: any) {
        e.message = getFriendlyErrorMessage(e);
        return { success: false, error: true, message: e.message }
    }
}

export const updateClass = async (currentState: CurrentState, data: ClassSchema) => {
    try {
        await prisma.class.update({
            where: {
                id: data.id
            },
            data
        });
        return { success: true, error: false }
    } catch (e: any) {
        e.message = getFriendlyErrorMessage(e);
        return { success: false, error: true, message: e.message }
    }
}

export const deleteClass = async (currentState: CurrentState, data: FormData) => {
    const id = data.get("id") as string;
    try {
        await prisma.class.delete({
            where: {
                id: parseInt(id),
            },
        });
        return { success: true, error: false }

    } catch (e) {
        console.log(e);
        return { success: false, error: true }
    }
}

export const createTeacher = async (currentState: CurrentState, data: TeacherSchema) => {
    try {
        const client = await clerkClient();
        const user = await client.users.createUser({
            username: data.username,
            password: data.password,
            firstName: data.name,
            lastName: data.surname,
            publicMetadata: { role: "teacher", name: `${data.name} ${data.surname}` }
        })
        await prisma.teacher.create({
            data: {
                id: user.id,
                username: data.username,
                name: data.name,
                surname: data.surname,
                email: data.email,
                phone: data.phone,
                address: data.address,
                img: data.img,
                bloodType: data.bloodType ?? "",
                gender: data.gender,
                birthday: data.birthday,
                subjects: {
                    connect: data.subjects?.map((subjectId: string) => ({ id: parseInt(subjectId) })),
                }
            }
        });
        return { success: true, error: false }

    } catch (e: any) {
        console.error(e);
        let errorMessage = "An error occurred while creating the teacher.";

        if (e.errors && e.errors.length > 0) {
            errorMessage = e.errors[0].longMessage || e.errors[0].message;
        } else if (e.message) {

            errorMessage = e.message;
        }
        return { success: false, error: true, message: errorMessage }
    }
}

export const updateTeacher = async (currentState: CurrentState, data: TeacherSchema) => {

    if (!data.id) {
        return { success: false, error: true };
    }

    try {
        const client = await clerkClient();
        const user = await client.users.updateUser(data.id, {
            username: data.username,
            ...(data.password !== "" && { password: data.password }),
            firstName: data.name,
            lastName: data.surname,
            publicMetadata: { role: "teacher" },
        })
        await prisma.teacher.update({
            where: {
                id: data.id
            },
            data: {
                ...(data.password !== "" && { password: data.password }),
                username: data.username,
                name: data.name,
                surname: data.surname,
                email: data.email,
                phone: data.phone,
                address: data.address,
                img: data.img,
                bloodType: data.bloodType,
                gender: data.gender,
                birthday: data.birthday,
                subjects: {
                    set: data.subjects?.map((subjectId: string) => ({ id: parseInt(subjectId) })),
                }
            }
        });
        return { success: true, error: false }
    } catch (e: any) {
        console.error(e);
        let errorMessage = "An error occurred while creating the teacher.";

        if (e.errors && e.errors.length > 0) {
            errorMessage = e.errors[0].longMessage || e.errors[0].message;
        } else if (e.message) {

            errorMessage = e.message;
        }
        return { success: false, error: true, message: errorMessage }
    }
}

export const deleteTeacher = async (currentState: CurrentState, data: FormData) => {
    const id = data.get("id") as string;
    try {
        const client = await clerkClient();
        await client.users.deleteUser(id);

        await prisma.teacher.delete({
            where: {
                id: id,
            },
        });
        return { success: true, error: false }

    } catch (e) {
        console.log(e);
        return { success: false, error: true }
    }
}

export const createStudent = async (currentState: CurrentState, data: StudentSchema) => {
    try {

        const classItem = await prisma.class.findUnique({
            where: { id: data.classId },
            include: { _count: { select: { students: true } } },
        });

        if (classItem && classItem.capacity === classItem._count.students) {
            return { success: false, error: true };
        }

        const client = await clerkClient();
        const user = await client.users.createUser({
            username: data.username,
            password: data.password,
            firstName: data.name,
            lastName: data.surname,
            publicMetadata: { role: "student" },
        })
        await prisma.student.create({
            data: {
                id: user.id,
                username: data.username,
                name: data.name,
                surname: data.surname,
                email: data.email,
                phone: data.phone,
                address: data.address,
                img: data.img,
                bloodType: data.bloodType ?? "",
                gender: data.gender,
                birthday: data.birthday,
                gradeId: data.gradeId,
                classId: data.classId,
                parentId: data.parentId,
            }
        });
        return { success: true, error: false }

    } catch (e: any) {
        console.error(e);
        let errorMessage = "An error occurred while creating the student.";

        if (e.errors && e.errors.length > 0) {
            errorMessage = e.errors[0].longMessage || e.errors[0].message;
        } else if (e.message) {
            errorMessage = e.message;
        }

        return { success: false, error: true, message: errorMessage }
    }

}

export const updateStudent = async (currentState: CurrentState, data: StudentSchema) => {

    if (!data.id) {
        return { success: false, error: true };
    }

    try {
        const client = await clerkClient();
        const user = await client.users.updateUser(data.id, {
            username: data.username,
            ...(data.password !== "" && { password: data.password }),
            firstName: data.name,
            lastName: data.surname,
            publicMetadata: { role: "student" },
        })
        await prisma.student.update({
            where: {
                id: data.id
            },
            data: {
                ...(data.password !== "" && { password: data.password }),
                username: data.username,
                name: data.name,
                surname: data.surname,
                email: data.email,
                phone: data.phone,
                address: data.address,
                img: data.img,
                bloodType: data.bloodType,
                gender: data.gender,
                birthday: data.birthday,
                gradeId: data.gradeId,
                classId: data.classId,
                parentId: data.parentId,
            }
        });
        return { success: true, error: false }
    } catch (e: any) {
        console.error(e);
        let errorMessage = "An error occurred while creating the student.";

        if (e.errors && e.errors.length > 0) {
            errorMessage = e.errors[0].longMessage || e.errors[0].message;
        } else if (e.message) {
            errorMessage = e.message;
        }

        return { success: false, error: true, message: errorMessage }
    }
}

export const deleteStudent = async (currentState: CurrentState, data: FormData) => {
    const id = data.get("id") as string;
    try {
        const client = await clerkClient();
        await client.users.deleteUser(id);

        await prisma.student.delete({
            where: {
                id: id,
            },
        });
        return { success: true, error: false }

    } catch (e) {
        console.log(e);
        return { success: false, error: true }
    }
}

export const createExam = async (currentState: CurrentState, data: ExamSchema) => {
    const { userId, sessionClaims } = await auth();
    let tokenData;
    if (sessionClaims !== null) {
        tokenData = sessionClaims as unknown as TokenData;
    }
    let role = tokenData?.userPblcMtdt?.role;

    try {
        if (role === "teacher") {
            const teacherLesson = await prisma.lesson.findFirst({
                where: {
                    teacherId: userId!,
                    id: data.lessonId,
                }
            })
            if (!teacherLesson) {
                return { success: false, error: true };
            }
        }
        await prisma.exam.create({
            data: {
                title: data.title,
                startTime: data.startTime,
                endTime: data.endTime,
                lessonId: data.lessonId,
            },
        });
        return { success: true, error: false }

    } catch (e: any) {
        e.message = getFriendlyErrorMessage(e);
        return { success: false, error: true, message: e.message }
    }
}

export const updateExam = async (currentState: CurrentState, data: ExamSchema) => {
    const { userId, sessionClaims } = await auth();
    let tokenData;
    if (sessionClaims !== null) {
        tokenData = sessionClaims as unknown as TokenData;
    }
    let role = tokenData?.userPblcMtdt?.role;

    try {
        if (role === "teacher") {
            const teacherLesson = await prisma.lesson.findFirst({
                where: {
                    teacherId: userId!,
                    id: data.lessonId,
                }
            })
            if (!teacherLesson) {
                return { success: false, error: true };
            }
        }
        await prisma.exam.update({
            where: {
                id: data.id,
            },
            data: {
                title: data.title,
                startTime: data.startTime,
                endTime: data.endTime,
                lessonId: data.lessonId,
            },
        });
        return { success: true, error: false }

    } catch (e: any) {
        e.message = getFriendlyErrorMessage(e);
        return { success: false, error: true, message: e.message }
    }
}

export const deleteExam = async (currentState: CurrentState, data: FormData) => {
    const id = data.get("id") as string;
    const { userId, sessionClaims } = await auth();
    let tokenData;
    if (sessionClaims !== null) {
        tokenData = sessionClaims as unknown as TokenData;
    }
    let role = tokenData?.userPblcMtdt?.role;

    try {
        await prisma.exam.delete({
            where: {
                id: parseInt(id),
                ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
            },
        });
        return { success: true, error: false }

    } catch (e) {
        console.log(e);
        return { success: false, error: true }
    }
}

export const createAssignment = async (currentState: CurrentState, data: AssignmentSchema) => {
    const { userId, sessionClaims } = await auth();
    let tokenData;
    if (sessionClaims !== null) {
        tokenData = sessionClaims as unknown as TokenData;
    }
    let role = tokenData?.userPblcMtdt?.role;

    try {
        if (role === "teacher") {
            const teacherLesson = await prisma.lesson.findFirst({
                where: {
                    teacherId: userId!,
                    id: data.lessonId,
                }
            })
            if (!teacherLesson) {
                return { success: false, error: true };
            }
        }
        await prisma.assignment.create({
            data: {
                title: data.title,
                startDate: data.startDate,
                dueDate: data.dueDate,
                lessonId: data.lessonId,
            },
        });
        return { success: true, error: false }

    } catch (e: any) {
        e.message = getFriendlyErrorMessage(e);
        return { success: false, error: true, message: e.message }
    }
}

export const updateAssignment = async (currentState: CurrentState, data: AssignmentSchema) => {
    const { userId, sessionClaims } = await auth();
    let tokenData;
    if (sessionClaims !== null) {
        tokenData = sessionClaims as unknown as TokenData;
    }
    let role = tokenData?.userPblcMtdt?.role;

    try {
        if (role === "teacher") {
            const teacherLesson = await prisma.lesson.findFirst({
                where: {
                    teacherId: userId!,
                    id: data.lessonId,
                }
            })
            if (!teacherLesson) {
                return { success: false, error: true };
            }
        }
        await prisma.assignment.update({
            where: {
                id: data.id,
            },
            data: {
                title: data.title,
                startDate: data.startDate,
                dueDate: data.dueDate,
                lessonId: data.lessonId,
            },
        });
        return { success: true, error: false }

    } catch (e: any) {
        e.message = getFriendlyErrorMessage(e);
        return { success: false, error: true, message: e.message }
    }
}

export const deleteAssignment = async (currentState: CurrentState, data: FormData) => {
    const id = data.get("id") as string;
    const { userId, sessionClaims } = await auth();
    let tokenData;
    if (sessionClaims !== null) {
        tokenData = sessionClaims as unknown as TokenData;
    }
    let role = tokenData?.userPblcMtdt?.role;

    try {
        await prisma.assignment.delete({
            where: {
                id: parseInt(id),
                ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
            },
        });
        return { success: true, error: false }

    } catch (e) {
        console.log(e);
        return { success: false, error: true }
    }
}

export const createResult = async (currentState: CurrentState, data: ResultSchema) => {
    const { userId, sessionClaims } = await auth();
    let tokenData;
    if (sessionClaims !== null) {
        tokenData = sessionClaims as unknown as TokenData;
    }
    let role = tokenData?.userPblcMtdt?.role;

    try {
        if (role === "teacher") {
            const teacherLesson = await prisma.lesson.findFirst({
                where: {
                    teacherId: userId!,
                    OR: [
                        { exams: { some: { id: data.examId } } },
                        { assignments: { some: { id: data.assignmentId } } }
                    ]
                }
            });
            if (!teacherLesson) {
                return { success: false, error: true };
            }
        }

        await prisma.result.create({
            data: {
                score: data.score,
                studentId: data.studentId,
                ...(data.examId && { examId: data.examId }),
                ...(data.assignmentId && { assignmentId: data.assignmentId }),
            },
        });
        return { success: true, error: false }

    } catch (e: any) {
        e.message = getFriendlyErrorMessage(e);
        return { success: false, error: true, message: e.message }
    }
}

export const updateResult = async (currentState: CurrentState, data: ResultSchema) => {
    const { userId, sessionClaims } = await auth();
    let tokenData;
    if (sessionClaims !== null) {
        tokenData = sessionClaims as unknown as TokenData;
    }
    let role = tokenData?.userPblcMtdt?.role;

    try {
        if (!data.id) {
            console.error("No ID provided for result update");
            return { success: false, error: true };
        }

        const existingResult = await prisma.result.findUnique({
            where: { id: data.id }
        });

        if (!existingResult) {
            console.error("Result not found with id:", data.id);
            return { success: false, error: true };
        }

        if (role === "teacher") {
            const teacherLesson = await prisma.lesson.findFirst({
                where: {
                    teacherId: userId!,
                    OR: [
                        { exams: { some: { id: data.examId } } },
                        { assignments: { some: { id: data.assignmentId } } }
                    ]
                }
            });
            if (!teacherLesson) {
                return { success: false, error: true };
            }
        }

        await prisma.result.update({
            where: {
                id: data.id,
            },
            data: {
                score: data.score,
                studentId: data.studentId,
                ...(data.examId && { examId: data.examId }),
                ...(data.assignmentId && { assignmentId: data.assignmentId }),
            },
        });
        return { success: true, error: false }

    } catch (e: any) {
        e.message = getFriendlyErrorMessage(e);
        return { success: false, error: true, message: e.message }
    }
}

export const deleteResult = async (currentState: CurrentState, data: FormData) => {
    const id = data.get("id") as string;
    const { userId, sessionClaims } = await auth();
    let tokenData;
    if (sessionClaims !== null) {
        tokenData = sessionClaims as unknown as TokenData;
    }
    let role = tokenData?.userPblcMtdt?.role;

    try {
        await prisma.result.delete({
            where: {
                id: parseInt(id),
                ...(role === "teacher" ? {
                    OR: [
                        { exam: { lesson: { teacherId: userId! } } },
                        { assignment: { lesson: { teacherId: userId! } } }
                    ]
                } : {}),
            },
        });
        return { success: true, error: false }

    } catch (e) {
        console.log(e);
        return { success: false, error: true }
    }
}

export const createEvent = async (currentState: CurrentState, data: EventSchema) => {
    const { userId, sessionClaims } = await auth();
    let tokenData;
    if (sessionClaims !== null) {
        tokenData = sessionClaims as unknown as TokenData;
    }
    let role = tokenData?.userPblcMtdt?.role;

    try {
        if (role === "teacher" && data.classId) {
            const teacherClass = await prisma.class.findFirst({
                where: {
                    id: data.classId,
                    lessons: {
                        some: {
                            teacherId: userId!
                        }
                    }
                }
            });
            if (!teacherClass) {
                return { success: false, error: true };
            }
        }

        await prisma.event.create({
            data: {
                title: data.title,
                description: data.description,
                startTime: data.startTime,
                endTime: data.endTime,
                ...(data.classId && { classId: data.classId }),
            },
        });
        return { success: true, error: false }

    } catch (e: any) {
        e.message = getFriendlyErrorMessage(e);
        return { success: false, error: true, message: e.message }
    }
}

export const updateEvent = async (currentState: CurrentState, data: EventSchema) => {
    const { userId, sessionClaims } = await auth();
    let tokenData;
    if (sessionClaims !== null) {
        tokenData = sessionClaims as unknown as TokenData;
    }
    let role = tokenData?.userPblcMtdt?.role;

    try {
        if (!data.id) {
            console.error("No ID provided for event update");
            return { success: false, error: true };
        }

        const existingEvent = await prisma.event.findUnique({
            where: { id: data.id }
        });

        if (!existingEvent) {
            console.error("Event not found with id:", data.id);
            return { success: false, error: true };
        }

        if (role === "teacher" && data.classId) {
            const teacherClass = await prisma.class.findFirst({
                where: {
                    id: data.classId,
                    lessons: {
                        some: {
                            teacherId: userId!
                        }
                    }
                }
            });
            if (!teacherClass) {
                return { success: false, error: true };
            }
        }
        if (data.classId === 0) {
            data.classId = null
        }

        await prisma.event.update({
            where: {
                id: data.id,
            },
            data: {
                title: data.title,
                description: data.description,
                startTime: data.startTime,
                endTime: data.endTime,
                ...(typeof data.classId === 'number' || data.classId === null
                    ? { classId: data.classId }
                    : {}),
            },
        });
        return { success: true, error: false }

    } catch (e: any) {
        e.message = getFriendlyErrorMessage(e);
        return { success: false, error: true, message: e.message }
    }
}

export const deleteEvent = async (currentState: CurrentState, data: FormData) => {
    const id = data.get("id") as string;
    const { userId, sessionClaims } = await auth();
    let tokenData;
    if (sessionClaims !== null) {
        tokenData = sessionClaims as unknown as TokenData;
    }
    let role = tokenData?.userPblcMtdt?.role;

    try {
        await prisma.event.delete({
            where: {
                id: parseInt(id),
                ...(role === "teacher" ? {
                    class: {
                        lessons: {
                            some: { teacherId: userId! }
                        }
                    }
                } : {}),
            },
        });
        return { success: true, error: false }

    } catch (e) {
        console.log(e);
        return { success: false, error: true }
    }
}

export const createAnnouncement = async (currentState: CurrentState, data: AnnouncementSchema) => {
    const { userId, sessionClaims } = await auth();
    let tokenData;
    if (sessionClaims !== null) {
        tokenData = sessionClaims as unknown as TokenData;
    }
    let role = tokenData?.userPblcMtdt?.role;

    try {
        if (role === "teacher" && data.classId) {
            const teacherClass = await prisma.class.findFirst({
                where: {
                    id: data.classId,
                    lessons: {
                        some: {
                            teacherId: userId!
                        }
                    }
                }
            });
            if (!teacherClass) {
                return { success: false, error: true };
            }
        }

        await prisma.announcement.create({
            data: {
                title: data.title,
                description: data.description,
                date: data.date,
                ...(data.classId && { classId: data.classId }),
            },
        });
        return { success: true, error: false }

    } catch (e: any) {
        e.message = getFriendlyErrorMessage(e);
        return { success: false, error: true, message: e.message }
    }
}

export const updateAnnouncement = async (currentState: CurrentState, data: AnnouncementSchema) => {
    const { userId, sessionClaims } = await auth();
    let tokenData;
    if (sessionClaims !== null) {
        tokenData = sessionClaims as unknown as TokenData;
    }
    let role = tokenData?.userPblcMtdt?.role;

    try {
        if (role === "teacher" && data.classId) {
            const teacherClass = await prisma.class.findFirst({
                where: {
                    id: data.classId,
                    lessons: {
                        some: {
                            teacherId: userId!
                        }
                    }
                }
            });
            if (!teacherClass) {
                return { success: false, error: true };
            }
        }

        if (data.classId === 0) {
            data.classId = null
        }

        await prisma.announcement.update({
            where: {
                id: data.id,
            },
            data: {
                title: data.title,
                description: data.description,
                date: data.date,
                ...(typeof data.classId === 'number' || data.classId === null
                    ? { classId: data.classId }
                    : {}),
            },
        });
        return { success: true, error: false }

    } catch (e: any) {
        e.message = getFriendlyErrorMessage(e);
        return { success: false, error: true, message: e.message }
    }
}

export const deleteAnnouncement = async (currentState: CurrentState, data: FormData) => {
    const id = data.get("id") as string;
    const { userId, sessionClaims } = await auth();
    let tokenData;
    if (sessionClaims !== null) {
        tokenData = sessionClaims as unknown as TokenData;
    }
    let role = tokenData?.userPblcMtdt?.role;

    try {
        await prisma.announcement.delete({
            where: {
                id: parseInt(id),
                ...(role === "teacher" ? {
                    class: {
                        lessons: {
                            some: { teacherId: userId! }
                        }
                    }
                } : {}),
            },
        });
        return { success: true, error: false }

    } catch (e) {
        console.log(e);
        return { success: false, error: true }
    }
}

export const createParent = async (currentState: CurrentState, data: ParentSchema) => {
    try {
        const client = await clerkClient();
        const user = await client.users.createUser({
            username: data.username,
            password: data.password,
            firstName: data.name,
            lastName: data.surname,
            publicMetadata: { role: "parent" },
        })
        await prisma.parent.create({
            data: {
                id: user.id,
                username: data.username,
                name: data.name,
                surname: data.surname,
                email: data.email || null,
                phone: data.phone,
                address: data.address,
            }
        });
        return { success: true, error: false }

    } catch (e: unknown) {
        console.log(e);


        let errorMessage = "Something went wrong!";


        if (e && typeof e === 'object' && 'errors' in e && Array.isArray(e.errors) && e.errors.length > 0 && typeof e.errors[0] === 'object' && 'message' in e.errors[0]) {
            errorMessage = (e.errors[0] as { message: string }).message;
        }

        else if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2002') {
            errorMessage = "Username or email already exists!";
        }

        else if (e instanceof Error) {
            errorMessage = e.message;
        }

        return { success: false, error: true, message: errorMessage }
    }
}

export const updateParent = async (currentState: CurrentState, data: ParentSchema) => {
    if (!data.id) {
        return { success: false, error: true };
    }

    try {
        const client = await clerkClient();
        const user = await client.users.updateUser(data.id, {
            username: data.username,
            ...(data.password !== "" && { password: data.password }),
            firstName: data.name,
            lastName: data.surname,
            publicMetadata: { role: "parent" },
        })
        await prisma.parent.update({
            where: {
                id: data.id
            },
            data: {
                username: data.username,
                name: data.name,
                surname: data.surname,
                email: data.email || null,
                phone: data.phone,
                address: data.address,
            }
        });
        return { success: true, error: false }
    } catch (e: unknown) {
        console.log(e);


        let errorMessage = "Something went wrong!";


        if (e && typeof e === 'object' && 'errors' in e && Array.isArray(e.errors) && e.errors.length > 0 && typeof e.errors[0] === 'object' && 'message' in e.errors[0]) {
            errorMessage = (e.errors[0] as { message: string }).message;
        }

        else if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2002') {
            errorMessage = "Username or email already exists!";
        }

        else if (e instanceof Error) {
            errorMessage = e.message;
        }

        return { success: false, error: true, message: errorMessage }
    }
}

export const deleteParent = async (currentState: CurrentState, data: FormData) => {
    const id = data.get("id") as string;
    try {
        const client = await clerkClient();
        await client.users.deleteUser(id);

        await prisma.parent.delete({
            where: {
                id: id,
            },
        });
        return { success: true, error: false }

    } catch (e) {
        console.log(e);
        return { success: false, error: true }
    }
}


export const createAttendance = async (currentState: CurrentState, data: AttendanceActionData) => {
    const { userId, sessionClaims } = await auth();
    let tokenData;
    if (sessionClaims !== null) {
        tokenData = sessionClaims as unknown as TokenData;
    }
    let role = tokenData?.userPblcMtdt?.role;

    try {
        if (role === "teacher") {
            const teacherLesson = await prisma.lesson.findFirst({
                where: {
                    teacherId: userId!,
                    id: data.lessonId,
                }
            });
            if (!teacherLesson) {
                return { success: false, error: true };
            }
        }

        await prisma.attendance.create({
            data: {
                date: data.date,
                present: data.present,
                studentId: data.studentId,
                lessonId: data.lessonId,
            },
        });
        return { success: true, error: false }

    } catch (e: any) {
        e.message = getFriendlyErrorMessage(e);
        return { success: false, error: true, message: e.message }
    }
}

export const updateAttendance = async (currentState: CurrentState, data: AttendanceActionData) => {
    const { userId, sessionClaims } = await auth();
    let tokenData;
    if (sessionClaims !== null) {
        tokenData = sessionClaims as unknown as TokenData;
    }
    let role = tokenData?.userPblcMtdt?.role;

    try {
        if (role === "teacher") {
            const teacherLesson = await prisma.lesson.findFirst({
                where: {
                    teacherId: userId!,
                    id: data.lessonId,
                }
            });
            if (!teacherLesson) {
                return { success: false, error: true };
            }
        }

        await prisma.attendance.update({
            where: {
                id: data.id,
            },
            data: {
                date: data.date,
                present: data.present,
                studentId: data.studentId,
                lessonId: data.lessonId,
            },
        });
        return { success: true, error: false }

    } catch (e: any) {
        e.message = getFriendlyErrorMessage(e);
        return { success: false, error: true, message: e.message }
    }
}

export const deleteAttendance = async (currentState: CurrentState, data: FormData) => {
    const id = data.get("id") as string;
    const { userId, sessionClaims } = await auth();
    let tokenData;
    if (sessionClaims !== null) {
        tokenData = sessionClaims as unknown as TokenData;
    }
    let role = tokenData?.userPblcMtdt?.role;

    try {
        await prisma.attendance.delete({
            where: {
                id: parseInt(id),
                ...(role === "teacher" ? {
                    lesson: { teacherId: userId! }
                } : {}),
            },
        });
        return { success: true, error: false }

    } catch (e) {
        console.log(e);
        return { success: false, error: true }
    }
}

export const createLesson = async (currentState: CurrentState, data: LessonSchema) => {
    const { userId, sessionClaims } = await auth();
    let tokenData;
    if (sessionClaims !== null) {
        tokenData = sessionClaims as unknown as TokenData;
    }
    let role = tokenData?.userPblcMtdt?.role;

    try {
        if (role === "teacher" && data.teacherId !== userId) {
            return { success: false, error: true };
        }

        await prisma.lesson.create({
            data: {
                name: data.name,
                day: data.day,
                startTime: data.startTime,
                endTime: data.endTime,
                subjectId: data.subjectId,
                classId: data.classId,
                teacherId: data.teacherId,
            },
        });
        return { success: true, error: false }

    } catch (e: any) {
        e.message = getFriendlyErrorMessage(e);
        return { success: false, error: true, message: e.message }
    }
}

export const updateLesson = async (currentState: CurrentState, data: LessonSchema) => {
    const { userId, sessionClaims } = await auth();
    let tokenData;
    if (sessionClaims !== null) {
        tokenData = sessionClaims as unknown as TokenData;
    }
    let role = tokenData?.userPblcMtdt?.role;

    try {
        if (!data.id) {
            console.error("No ID provided for lesson update");
            return { success: false, error: true };
        }

        const existingLesson = await prisma.lesson.findUnique({
            where: { id: data.id }
        });

        if (!existingLesson) {
            console.error("Lesson not found with id:", data.id);
            return { success: false, error: true };
        }

        if (role === "teacher" && data.teacherId !== userId) {
            return { success: false, error: true };
        }

        await prisma.lesson.update({
            where: {
                id: data.id,
            },
            data: {
                name: data.name,
                day: data.day,
                startTime: data.startTime,
                endTime: data.endTime,
                subjectId: data.subjectId,
                classId: data.classId,
                teacherId: data.teacherId,
            },
        });
        return { success: true, error: false }

    } catch (e: any) {
        e.message = getFriendlyErrorMessage(e);
        return { success: false, error: true, message: e.message }
    }
}

export const deleteLesson = async (currentState: CurrentState, data: FormData) => {
    const id = data.get("id") as string;
    const { userId, sessionClaims } = await auth();
    let tokenData;
    if (sessionClaims !== null) {
        tokenData = sessionClaims as unknown as TokenData;
    }
    let role = tokenData?.userPblcMtdt?.role;

    try {
        await prisma.lesson.delete({
            where: {
                id: parseInt(id),
                ...(role === "teacher" ? { teacherId: userId! } : {}),
            },
        });
        return { success: true, error: false }

    } catch (e) {
        console.log(e);
        return { success: false, error: true }
    }
}

export async function createRecurringLessons(lessonsData: LessonSchema[]) {
    try {
        let successCount = 0;
        for (const lessonData of lessonsData) {

            await prisma.lesson.create({
                data: {
                    name: lessonData.name,
                    day: lessonData.day,
                    startTime: lessonData.startTime,
                    endTime: lessonData.endTime,
                    subjectId: lessonData.subjectId,
                    classId: lessonData.classId,
                    teacherId: lessonData.teacherId,

                }
            });
            successCount++;
        }
        return { success: true, error: false, total: lessonsData.length, successCount: successCount };
    } catch (error: any) {
        console.error("Error creating recurring lessons:", error);

        return { success: false, error: true, message: error.message || "Failed to create recurring lessons." };
    }
}



export async function checkTeacherAvailability(
    teacherId: string,
    day: string,
    startTime: Date,
    endTime: Date,
    lessonIdToExclude?: number
): Promise<boolean> {
    try {

        const startHour = startTime.getHours();
        const startMinute = startTime.getMinutes();
        const endHour = endTime.getHours();
        const endMinute = endTime.getMinutes();


        const existingLessons = await prisma.lesson.findMany({
            where: {
                teacherId: teacherId,
                day: day as any,

                ...(lessonIdToExclude && { id: { not: lessonIdToExclude } }),
            },
        });


        for (const lesson of existingLessons) {
            const existingStartTime = new Date(lesson.startTime);
            const existingEndTime = new Date(lesson.endTime);


            const existingStartHour = existingStartTime.getHours();
            const existingStartMinute = existingStartTime.getMinutes();
            const existingEndHour = existingEndTime.getHours();
            const existingEndMinute = existingEndTime.getMinutes();


            const newLessonStartInMinutes = startHour * 60 + startMinute;
            const newLessonEndInMinutes = endHour * 60 + endMinute;
            const existingLessonStartInMinutes = existingStartHour * 60 + existingStartMinute;
            const existingLessonEndInMinutes = existingEndHour * 60 + existingEndMinute;

            if (
                newLessonStartInMinutes < existingLessonEndInMinutes &&
                existingLessonStartInMinutes < newLessonEndInMinutes
            ) {
                return true;
            }
        }

        return false;
    } catch (error) {
        console.error("Error checking teacher availability:", error);
        return false;
    }
}


function getFriendlyErrorMessage(e: any): string {
    let friendlyMessage = "An unknown error occurred.";

    if (e.errors && Array.isArray(e.errors) && e.errors.length > 0) {
        friendlyMessage = e.errors[0].longMessage || e.errors[0].message;
        if (friendlyMessage.startsWith("Validation error: ")) {
            friendlyMessage = friendlyMessage.replace("Validation error: ", "");
        }
        if (friendlyMessage.includes("username is already taken")) {
            friendlyMessage = "The username is already taken.";
        } else if (friendlyMessage.includes("password must be at least")) {
            friendlyMessage = "The password is too short. It must be at least 8 characters long.";
        }
    } else if (e.message) {
        friendlyMessage = e.message;
        if (e.message.includes("Unique constraint failed on the")) {
            friendlyMessage = "This record already exists (duplicate).";
        }
    } else if (typeof e === 'string') {
        friendlyMessage = e;
    }

    return friendlyMessage;
}

