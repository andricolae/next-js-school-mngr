import { z } from "zod";

export const subjectSchema = z.object({
    id: z.coerce.number().optional(),
    name: z
        .string()
        .min(1, { message: 'Denumire materiei este obligatorie!' }),
    teachers: z.array(z.string({ message: "Profesorul este obligatoriu!" }))
        .min(1, { message: "Minim un profesor trebuie să fie selectat!" }),
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const moduleSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, "Denumirea modulului este obligatorie!"),
    startDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), "Dată de început invalidă!"),
    endDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), "Dată de sfârșit invalidă!"),

    holidays: z.array(z.object({
        name: z.string().min(1, "Denumirea zilei libere este obligatorie!"),
        date: z.string().refine((date) => !isNaN(new Date(date).getTime()), "Dată invalidă!"),
    })).default([]),
});

export type ModuleSchema = z.infer<typeof moduleSchema>;

export const holidaySchema = z.object({
    name: z.string().min(1, "Denumirea zilei libere este obligatorie!"),
    date: z.string().refine((date) => !isNaN(new Date(date).getTime()), "Dată invalidă!"),
});

export type HolidaySchema = z.infer<typeof holidaySchema>;

export const classSchema = z.object({
    id: z.coerce.number().optional(),
    name: z
        .string()
        .min(1, { message: 'Numele clasei este obligatoriu!' }),
    capacity: z
        .coerce.number()
        .min(1, { message: 'Capacitatea este obligatorie!' }),
    gradeId: z
        .coerce.number()
        .min(1, { message: 'Denumirea nivelului este obligatorie!' }),
    supervisorId: z
        .string()
        .optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

export const teacherSchema = (isUpdate = false) => z.object({
    id: z.string().optional(),
    username: z
        .string()
        .nonempty({ message: "Numele de utilizator este obligatoriu!" })
        .min(5, { message: 'Numele de utilizator trebuie să aibă minim 5 caractere!' })
        .max(20, { message: 'Numele de utilizator trebuie să aibă maxim 20 de caractere!' }),
    password: isUpdate
        ? z.string()
            .transform((val) => val === "" ? undefined : val)
            .optional()
            .refine(
                (val) => val === undefined || val.length >= 8,
                { message: "Parola trebuie să aibă minim 8 caractere!" }
            )
        : z.string().nonempty({ message: "Parola este obligatorie și trebuie să conțină literă mică, mare, cifră și un caracter special!" }).min(6, { message: "Parola trebuie să aibă minim 8 caractere!" }),


    name: z.string().min(1, { message: "Prenumele este obligatoriu!" }),
    surname: z.string().min(1, { message: "Numele este obligatoriu" }),
    email: z.string().min(1, { message: "Email-ul este obligatoriu!" }).email({ message: "Adresă de email invalidă!" }),


    phone: z.string().min(1, { message: "Numărul de telefon este obligatoriu!" }),
    address: z.string(),
    img: z.string().optional(),
    bloodType: z.string().optional(),
    birthday: z.coerce.date({ message: "Data nașterii este obligatorie!" })
        .refine(
            (date) => {
                const ageDifMs = new Date().getTime() - date.getTime();
                const ageDate = new Date(ageDifMs);
                const age = Math.abs(ageDate.getUTCFullYear() - 1970);
                return age >= 18;
            },
            { message: "Un profesor trebuie să aibă minim 18 ani!" }
        ),
    gender: z.enum(["FEMALE", "MALE", "OTHER"], { message: "Genul este obligatoriu!" }),
    subjects: z.array(z.string().min(1, { message: "Materia este obligatorie!" }))
});

export type TeacherSchema = z.infer<ReturnType<typeof teacherSchema>>;

export const studentSchema = (isUpdate = false) => z.object({
    id: z.string().optional(),
    username: z
        .string()
        .nonempty({ message: "Numele de utilizator este obligatoriu!" })
        .min(5, { message: 'Numele de utilizator trebuie să aibă minim 5 caractere!' })
        .max(20, { message: 'Numele de utilizator trebuie să aibă maxim 20 de caractere!' }),
    password: isUpdate
        ? z.string()
            .transform((val) => val === "" ? undefined : val)
            .optional()
            .refine(
                (val) => val === undefined || val.length >= 8,
                { message: "Parola trebuie să aibă minim 8 caractere!" }
            )
        : z.string().nonempty({ message: "Parola este obligatorie și trebuie să conțină literă mică, mare, cifră și un caracter special!" }).min(6, { message: "Parola trebuie să aibă minim 8 caractere!" }),

    name: z.string().min(1, { message: "Prenumele este obligatoriu!" }),
    surname: z.string().min(1, { message: "Numele este obligatoriu!" }),
    email: z.string().min(1, { message: "Email-ul este obligatoriu!" }).email({ message: "Adresă de email invalidă!" }),

    address: z.string().min(1, { message: "Adresa este obligatorie!" }),
    bloodType: z.string().optional(),

    img: z.string().optional(),
    phone: z.string().optional(),
    birthday: z.coerce.date({ message: "Data nașterii este obligatorie!" })
        .refine(
            (date) => {
                const ageDifMs = new Date().getTime() - date.getTime();
                const ageDate = new Date(ageDifMs);
                const age = Math.abs(ageDate.getUTCFullYear() - 1970);
                return age >= 5;
            },
            { message: "Elevul/a trebuie să aibă minim vârsta de 5 ani!" }
        ),
    gender: z.enum(["FEMALE", "MALE", "OTHER"], { message: "Genul este obligatoriu!" }),
    gradeId: z.coerce.number().min(1, { message: "Nivelul este obligatoriu!" }),
    classId: z.coerce.number().min(1, { message: "Clasa este obligatorie!" }),
    parentId: z.coerce.string().min(1, { message: "Părintele este obligatoriu!" }),
});

export type StudentSchema = z.infer<ReturnType<typeof studentSchema>>;

export const examSchema = z
    .object({
        id: z.coerce.number().optional(),
        title: z
            .string()
            .min(1, { message: 'Denumirea materiei este obligatorie!' }),
        startTime: z
            .coerce.date()
            .refine((date) => !isNaN(date.getTime()), {
                message: "Data și ora de început sunt obligatorii!",
            }),
        endTime: z
            .coerce.date()
            .refine((date) => !isNaN(date.getTime()), {
                message: "Data și ora de sfârșit sunt obligatorii!",
            }),
        lessonId: z.coerce.number({ message: "Ora asociată este obligatorie!" }),
    })
    .refine((data) => data.endTime > data.startTime, {
        message: "Ora de sfârșit trebuie să fie după ora de început!",
        path: ["endTime"],
    })
    .refine((data) => data.startTime >= new Date(), {
        message: "Ora de început nu poate fi în trecut!",
        path: ["startTime"],
    });

export type ExamSchema = z.infer<typeof examSchema>;

export const assignmentSchema = z.object({
    id: z.coerce.number().optional(),
    title: z
        .string()
        .min(1, { message: 'Denumirea materiei este obligatorie!' }),
    description: z.coerce.string().min(1, { message: 'Descrierea este obligatorie!' }),
    startDate: z.coerce.date({ message: "Data de început este obligatorie!" }).min(new Date(new Date().toDateString()), { message: "Ora de început nu poate să fie în trecut!" }),
    dueDate: z.coerce.date({ message: "Termenul limită este obligatoriu!" }),
    lessonId: z
        .coerce.number({ message: "Ora asociată este obligatorie!" })
        .refine((val) => val > 0, { message: "Ora asociată este obligatorie!" }),
})

    .refine(
        data => data.dueDate >= data.startDate,
        {
            message: "Termenul limită trebuie să fie după data de start!",
            path: ["dueDate"]
        }
    );

export type AssignmentSchema = z.infer<typeof assignmentSchema>;

export const resultSchema = z.object({
    id: z.coerce.number().optional(),
    score: z
        .coerce.number()
        .min(1)
        .max(10, { message: "Nota trebuie să fie între 1 și 10!" })
        .refine((val) => val < 1, { message: "Nota trebuie să fie mai mare sau egală cu 1!" }),
    examId: z.coerce.number().optional(),
    assignmentId: z.coerce.number().optional(),
    studentId: z.string().min(1, { message: "Studentul este obligatoriu!" }),
});

export type ResultSchema = z.infer<typeof resultSchema>;

export const eventSchema = z.object({
    id: z.coerce.number().optional(),
    title: z.string().min(1, { message: "Titlul evenimentului este obligatoriu!" }),
    description: z.string().min(1, { message: "Descrierea este obligatorie!" }),
    startTime: z.coerce.date({ message: "Data și ora de început sunt obligatorii!" }),
    endTime: z.coerce.date({ message: "Data și ora de sfârșit sunt obligatorii!" }),
    classId: z.union([z.coerce.number(), z.null()]).optional()
})

    .refine(
        data => data.startTime >= new Date(),
        {
            message: "Data și ora de început nu pot fi în trecut!",
            path: ["startTime"],
        })

    .refine(
        data => data.endTime > data.startTime,
        {
            message: "Data și ora de sfârșit trebuie să fie după data și ora de început!",
            path: ["endTime"],
        }
    )

    .refine(
        data => (data.endTime.getTime() - data.startTime.getTime()) >= 15 * 60 * 1000,
        {
            message: "Evenimentul trebuie să aibă o durată minimă de 15 minute!",
            path: ["endTime"],
        }
    );

export type EventSchema = z.infer<typeof eventSchema>;

const baseAnnouncementSchema = {
    id: z.coerce.number().optional(),
    title: z.string().min(1, { message: "Titlul anunțului este obligatoriu!" }),
    description: z.string().min(1, { message: "Descrierea este obligatorie!" }),
    classId: z.union([z.coerce.number(), z.null()]).optional(),
};

// Schema for CREATE
export const createAnnouncementSchema = z.object({
    ...baseAnnouncementSchema,
    date: z.coerce.date({ message: "Data este obligatorie" }).refine(
        d => d.toDateString() === new Date().toDateString(),
        { message: "Data trebuie să fie chiar astăzi!" }
    ),
});

// Schema for UPDATE
export const updateAnnouncementSchema = z.object({
    ...baseAnnouncementSchema,
    date: z.coerce.date().optional(), // ignored
});

export type CreateAnnouncementSchema = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementSchema = z.infer<typeof updateAnnouncementSchema>;

export const lessonSchema = z.object({
    id: z.coerce.number().optional(),
    name: z.string().min(1, { message: "Titlul orei este obligatoriu!" }),
    day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", ""]).optional(),
    startTime: z.coerce.date({ message: "Data și ora de început sunt obligatorii!" }).refine(
        (val) => {
            const hour = val.getHours();
            const minute = val.getMinutes();
            return (hour >= 8 && hour < 18) || (hour === 18 && minute === 0);
        },
        {
            message: "Ora de început trebuie să fie între 08:00 și 18:00!",
        }
    ),
    endTime: z.coerce.date({ message: "Ora de sfârșit este obligatorie!" })
        .refine(
            (val) => {
                const hour = val.getHours();
                const minute = val.getMinutes();

                return (hour >= 9 && hour < 19) || (hour === 9 && minute === 0);
            },
            {
                message: "Ora de sfârșit trebuie să fie între 09:00 și 19:00!",
            }
        ),
    subjectId: z.coerce.number({ message: "Materia este obligatorie!" }),
    classId: z.coerce.number({ message: "Clasa este obligatorie!" }),
    teacherId: z.string().min(1, { message: "Profesorul este obligatoriu!" }),
    isRecurring: z.boolean(),
}).refine(
    (data) => {
        if (!data.isRecurring) {
            return (
                data.startTime.getFullYear() === data.endTime.getFullYear() &&
                data.startTime.getMonth() === data.endTime.getMonth() &&
                data.startTime.getDate() === data.endTime.getDate()
            );
        }
        return true;
    },
    {
        message: "Pentru o lecție singulară, începutul și sfârșitul trebuie să fie în aceeași zi",
        path: ["endTime"],
    });

export type LessonSchema = z.infer<typeof lessonSchema>;

export type GeneratedLessonData = Omit<LessonSchema, 'isRecurring' | 'moduleId' | 'id'> & { id?: number };

export const parentSchema = (isUpdate = false) => z.object({
    id: z.string().optional(),
    username: z
        .string()
        .nonempty({ message: "Numele de utilizator este obligatoriu!" })
        .min(5, { message: 'Numele de utilizator trebuie să aibă minim 5 caractere!' })
        .max(20, { message: 'Numele de utilizator trebuie să aibă maxim 20 de caractere!' }),
    password: isUpdate
        ? z.string()
            .transform((val) => val === "" ? undefined : val)
            .optional()
            .refine(
                (val) => val === undefined || val.length >= 8,
                { message: "" }
            )
        : z.string().nonempty({ message: "Parola este obligatorie și trebuie să conțină literă mică, mare, cifră și un caracter special!" }).min(6, { message: "Parola trebuie să aibă minim 8 caractere!" }),
    name: z.string().min(1, { message: "Prenumele este obligatoriu!" }),
    surname: z.string().min(1, { message: "Numele este obligatoriu!" }),
    email: z
        .string()
        .email({ message: "Adresă de email invalidă!" })
        .optional()
        .or(z.literal("")),
    phone: z.string().min(1, { message: "Numărul de telefon este obligatoriu!" }),
    address: z.string().min(1, { message: "Adresa este obligatorie!" }),
});

export type ParentSchema = z.infer<ReturnType<typeof parentSchema>>;

export const attendanceSchema = z.object({
    id: z.coerce.number().optional(),
    date: z.coerce.date({ message: "Data este obligatorie!" }),
    present: z.string(),
    studentId: z.string().min(1, { message: "Studentul este obligatoriu!" }),
    lessonId: z.coerce
        .number({ message: "Ora asociată este obligatorie!" })
        .refine((val) => val > 0, { message: "Ora asociată este obligatorie!" }),
});

export type AttendanceFormData = z.infer<typeof attendanceSchema>;

export type AttendanceActionData = {
    id?: number;
    date: Date;
    present: boolean;
    studentId: string;
    lessonId: number;
};