import { z } from "zod";
import { nationalHolidays } from "./holidays";
import { availableModules } from "./modules";

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
    supervisorId: z.preprocess(
        (val) => {
            if (val === null || val === undefined) return "";
            if (typeof val === "number" && isNaN(val)) return "";
            return val;
        },
        z.string().min(1, { message: "Numele dirigintelui este obligatoriu!" })
    ),
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
    CNP: z.union([
        z.literal(""),
        z.string()
            .refine(val => val.length === 13, { message: "CNP-ul trebuie sa aiba 13 cifre!" })
            .refine(val => /^\d+$/.test(val), { message: "CNP-ul trebuie sa contina doar cifre!" })
    ]),
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

    CNP: z.union([
        z.literal(""),
        z.string()
            .refine(val => val.length === 13, { message: "CNP-ul trebuie sa aiba 13 cifre!" })
            .refine(val => /^\d+$/.test(val), { message: "CNP-ul trebuie sa contina doar cifre!" })
    ]),
    registrationNo: z.string().optional(),

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
    gradeId: z.coerce.number().optional(),
    classId: z.coerce.number().min(1, { message: "Clasa este obligatorie!" }),
    parentId: z.coerce.string().min(1, { message: "Părintele este obligatoriu!" }),
    birthplace: z.string().optional(),
});

export type StudentSchema = z.infer<ReturnType<typeof studentSchema>>;

const baseExamSchema = {
    id: z.coerce.number().optional(),
    title: z
        .string()
        .min(1, { message: 'Titlul testului este obligatoriu!' }),
    endTime: z
        .coerce.date()
        .refine((date) => !isNaN(date.getTime()), {
            message: "Data și ora de sfârșit sunt obligatorii!",
        }),
    lessonId: z.coerce.number({ message: "Ora asociată este obligatorie!" }),
};


export const createExamSchema = z.object({
    ...baseExamSchema,
    startTime: z
        .coerce.date()
        .refine((date) => !isNaN(date.getTime()), {
            message: "Data și ora de început sunt obligatorii!",
        })
        .refine((val) => {
            const x = formatDateToISO(val);
            if (!dateTimeRegex.test(x)) return true;
            const d = new Date(x);
            return !isWeekend(d);
        }, { message: "Nu puteți programa teste în zile de weekend!" })
        .refine((val) => {
            const x = formatDateToISO(val);
            if (!dateTimeRegex.test(x)) return true;
            const d = new Date(x);
            return !isHoliday(d);
        }, { message: "Nu puteți programa teste în zile libere naționale!" })
        .refine((val) => {
            const x = formatDateToISO(val);
            if (!dateTimeRegex.test(x)) return true;
            const d = new Date(x);
            return isDateInModules(d);
        }, { message: "Nu puteți programa teste în zile de vacanță!" })
        .refine((val) => {
            const x = formatDateToISO(val);
            if (!dateTimeRegex.test(x)) return true;
            return new Date(x) >= new Date();
        }, { message: "Ora de început nu poate fi în trecut!" }),
}).refine((data) => data.endTime > data.startTime, {
    message: "Ora de sfârșit trebuie să fie după ora de început!",
    path: ["endTime"],
}).refine((data) => {
    if (!data.startTime || !data.endTime) return true;
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);

    return (
        start.getFullYear() === end.getFullYear() &&
        start.getMonth() === end.getMonth() &&
        start.getDate() === end.getDate()
    );
},
    {
        message: "Data de început și data de sfârșit trebuie să fie în aceeași zi!",
        path: ["endTime"],
    }
);

export const updateExamSchema = z.object({
    ...baseExamSchema,
    startTime: z
        .coerce.date()
        .refine((date) => !isNaN(date.getTime()), {
            message: "Data și ora de început sunt obligatorii!",
        })
        .refine((val) => {
            const x = formatDateToISO(val);
            if (!dateTimeRegex.test(x)) return true;
            const d = new Date(x);
            return !isWeekend(d);
        }, { message: "Nu puteți programa teste în zile de weekend!" })
        .refine((val) => {
            const x = formatDateToISO(val);
            if (!dateTimeRegex.test(x)) return true;
            const d = new Date(x);
            return !isHoliday(d);
        }, { message: "Nu puteți programa teste în zile libere naționale!" })
        .refine((val) => {
            const x = formatDateToISO(val);
            if (!dateTimeRegex.test(x)) return true;
            const d = new Date(x);
            return isDateInModules(d);
        }, { message: "Nu puteți programa teste în zile de vacanță!" })
}).refine((data) => data.endTime > data.startTime, {
    message: "Ora de sfârșit trebuie să fie după ora de început!",
    path: ["endTime"],
}).refine((data) => {
    if (!data.startTime || !data.endTime) return true;
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);

    return (
        start.getFullYear() === end.getFullYear() &&
        start.getMonth() === end.getMonth() &&
        start.getDate() === end.getDate()
    );
},
    {
        message: "Data de început și data de sfârșit trebuie să fie în aceeași zi!",
        path: ["endTime"],
    }
);

export type CreateExamSchema = z.infer<typeof createExamSchema>;
export type UpdateExamSchema = z.infer<typeof updateExamSchema>;

const formatDateToISO = (date: Date | string): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export const assignmentSchema = z.object({
    id: z.coerce.number().optional(),
    title: z
        .string()
        .min(1, { message: 'Denumirea materiei este obligatorie!' }),
    description: z.coerce.string().min(1, { message: 'Descrierea este obligatorie!' }),
    startDate: z.any().optional(),

    dueDate: z.coerce.date({ message: "Termenul limită este obligatoriu!" }),
    lessonId: z
        .coerce.number({ message: "Ora asociată este obligatorie!" })
        .refine((val) => val > 0, { message: "Ora asociată este obligatorie!" }),
}).refine(
    data => data.dueDate.getTime() > new Date(data.startDate).getTime(),
    {
        message: "Termenul limită trebuie să fie după data de start!",
        path: ["dueDate"]
    }
);

export type AssignmentSchema = z.infer<typeof assignmentSchema>;

export const resultSchema = z.object({
    id: z.coerce.number().optional(),
    score: z.string().min(1, { message: "Nota este obligatorie!" }),
    examId: z.any().optional(),
    assignmentId: z.any().optional(),
    studentId: z.string({ required_error: "Elevul este obligatoriu!" }),
    resultDate: z.any().optional()
}).refine(
    (data) => 
        ((data.examId && data.examId !== 0) && !data.assignmentId) ||
        ((!data.examId || data.examId === 0) && data.assignmentId),
    {
        message: "Trebuie completat examenul sau tema, nu ambele sau niciunul.",
        path: ["examId"],
    }
);

export type ResultSchema = z.infer<typeof resultSchema>;

export const eventSchema = z.object({
    id: z.coerce.number().optional(),
    title: z.string().min(1, { message: "Titlul evenimentului este obligatoriu!" }),
    description: z.string().min(1, { message: "Descrierea este obligatorie!" }),
    startTime: z.coerce.date({ message: "Data și ora de început sunt obligatorii!" }),
    endTime: z.coerce.date({ message: "Data și ora de sfârșit sunt obligatorii!" }),
    classId: z.union([z.coerce.number(), z.null()]).optional()
}).refine(
    data => data.startTime >= new Date(),
    {
        message: "Data și ora de început nu pot fi în trecut!",
        path: ["startTime"],
    }
).refine(
    data => data.endTime > data.startTime,
    {
        message: "Data și ora de sfârșit trebuie să fie după data și ora de început!",
        path: ["endTime"],
    }
).refine(
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

export const createAnnouncementSchema = z.object({
    ...baseAnnouncementSchema,
    date: z.coerce.date({ message: "Data este obligatorie" }).refine(
        d => d.toDateString() === new Date().toDateString(),
        { message: "Data trebuie să fie în ziua curentă!" }
    ),
});

export const updateAnnouncementSchema = z.object({
    ...baseAnnouncementSchema,
    date: z.coerce.date().optional(),
});

export type CreateAnnouncementSchema = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementSchema = z.infer<typeof updateAnnouncementSchema>;

const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
};

const isHoliday = (date: any): boolean => {
    const dateString = date.toISOString().split('T')[0];
    return nationalHolidays.some(holiday => holiday.date === dateString);
};

const isDateInModules = (date: Date | string): boolean => {
    const checkDate = new Date(date).getTime();

    return availableModules.some((module) => {
        const start = new Date(module.startDate).getTime();
        const end = new Date(module.endDate).getTime();
        return checkDate >= start && checkDate <= end;
    });
};

const formatDate = (date: Date): string => {
    return date.toLocaleDateString('ro-RO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Europe/Bucharest'
    });
};

const timeRegex = /^\d{2}:\d{2}$/;
const dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const parseToDate = (val: string): Date | null => {
    if (timeRegex.test(val)) {
        const [h, m] = val.split(":").map(Number);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        return d;
    }
    if (dateTimeRegex.test(val)) {
        return new Date(val);
    }
    return null;
};

const baseLessonSchema = {
    id: z.coerce.number().optional(),
    name: z.string().min(1, { message: "Titlul orei este obligatoriu!" }),
    day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", ""]).optional(),
    subjectId: z.coerce.number({ message: "Materia este obligatorie!" }),
    classId: z.coerce.number({ message: "Clasa este obligatorie!" }),
    teacherId: z.string().min(1, { message: "Profesorul este obligatoriu!" }),
    isRecurring: z.boolean(),
};

export const createLessonSchema = z.object({
    ...baseLessonSchema,
    startTime: z.string().refine((val) => {
        const d = parseToDate(val);
        if (!d) return false;
        const h = d.getHours();
        const m = d.getMinutes();
        return (h >= 8 && h < 18) || (h === 18 && m === 0);
    }, { message: "Ora de început trebuie să fie între 08:00 și 18:00!" })
        .refine((val) => {
            if (!dateTimeRegex.test(val)) return true;
            const d = new Date(val);
            return !isWeekend(d);
        }, { message: "Nu puteți programa ore în zile de weekend!" })
        .refine((val) => {
            if (!dateTimeRegex.test(val)) return true;
            const d = new Date(val);
            return !isHoliday(d);
        }, { message: "Nu puteți programa ore în zile libere naționale!" })
        .refine((val) => {
            if (!dateTimeRegex.test(val)) return true;
            const d = new Date(val);
            return isDateInModules(d);
        }, { message: "Nu puteți programa ore în zile de vacanță!" })
        .refine((val) => {
            if (!dateTimeRegex.test(val)) return true;
            return new Date(val) >= new Date();
        }, { message: "Ora de început nu poate fi în trecut!" }),

    endTime: z.string().refine((val) => {
        const d = parseToDate(val);
        if (!d) return false;
        const h = d.getHours();
        const m = d.getMinutes();
        return (h >= 9 && h < 19) || (h === 19 && m === 0);
    }, { message: "Ora de sfârșit trebuie să fie între 09:00 și 19:00!" })
        .refine((val) => {
            if (!dateTimeRegex.test(val)) return true;
            const d = new Date(val);
            return !isWeekend(d);
        }, { message: "Nu puteți programa ore în zile de weekend!" })
        .refine((val) => {
            if (!dateTimeRegex.test(val)) return true;
            const d = new Date(val);
            return !isHoliday(d);
        }, { message: "Nu puteți programa ore în zile libere naționale!" }),
}).refine((data) => {
    if (!data.isRecurring && dateTimeRegex.test(data.startTime) && dateTimeRegex.test(data.endTime)) {
        const s = new Date(data.startTime);
        const e = new Date(data.endTime);
        return (
            s.getFullYear() === e.getFullYear() &&
            s.getMonth() === e.getMonth() &&
            s.getDate() === e.getDate()
        );
    }
    return true;
}, {
    message: "Începutul și sfârșitul trebuie să fie în aceeași zi",
    path: ["endTime"],
}
).refine((data) => {
    const start = parseToDate(data.startTime);
    const end = parseToDate(data.endTime);
    if (!start || !end) return false;
    return end > start;
}, {
    message: "Ora de sfârșit trebuie să fie după ora de început!",
    path: ["endTime"],
});;

export const updateLessonSchema = z.object({
    ...baseLessonSchema,
    startTime: z.string().refine((val) => {
        const d = parseToDate(val);
        if (!d) return false;
        const h = d.getHours();
        const m = d.getMinutes();
        return (h >= 8 && h < 18) || (h === 18 && m === 0);
    }, { message: "Ora de început trebuie să fie între 08:00 și 18:00!" })
        .refine((val) => {
            if (!dateTimeRegex.test(val)) return true;
            const d = new Date(val);
            return !isWeekend(d);
        }, { message: "Nu puteți programa ore în zile de weekend!" })
        .refine((val) => {
            if (!dateTimeRegex.test(val)) return true;
            const d = new Date(val);
            return !isHoliday(d);
        }, { message: "Nu puteți programa ore în zile libere naționale!" })
        .refine((val) => {
            if (!dateTimeRegex.test(val)) return true;
            const d = new Date(val);
            return isDateInModules(d);
        }, { message: "Nu puteți programa ore în zile de vacanță!" }),

    endTime: z.string().refine((val) => {
        const d = parseToDate(val);
        if (!d) return false;
        const h = d.getHours();
        const m = d.getMinutes();
        return (h >= 9 && h < 19) || (h === 19 && m === 0);
    }, { message: "Ora de sfârșit trebuie să fie între 09:00 și 19:00!" })
        .refine((val) => {
            if (!dateTimeRegex.test(val)) return true;
            const d = new Date(val);
            return !isWeekend(d);
        }, { message: "Nu puteți programa ore în zile de weekend!" })
        .refine((val) => {
            if (!dateTimeRegex.test(val)) return true;
            const d = new Date(val);
            return !isHoliday(d);
        }, { message: "Nu puteți programa ore în zile libere naționale!" }),
}).refine((data) => {
    if (!data.isRecurring && dateTimeRegex.test(data.startTime) && dateTimeRegex.test(data.endTime)) {
        const s = new Date(data.startTime);
        const e = new Date(data.endTime);
        return (
            s.getFullYear() === e.getFullYear() &&
            s.getMonth() === e.getMonth() &&
            s.getDate() === e.getDate()
        );
    }
    return true;
}, {
    message: "Începutul și sfârșitul trebuie să fie în aceeași zi",
    path: ["endTime"],
}
).refine((data) => {
    const start = parseToDate(data.startTime);
    const end = parseToDate(data.endTime);
    if (!start || !end) return false;
    return end > start;
}, {
    message: "Ora de sfârșit trebuie să fie după ora de început!",
    path: ["endTime"],
});

export type CreateLessonSchema = z.infer<typeof createLessonSchema>;
export type UpdateLessonSchema = z.infer<typeof updateLessonSchema>;

export type GeneratedLessonData = Omit<CreateLessonSchema, 'isRecurring' | 'moduleId' | 'id'> & { id?: number };

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
    // date: z.coerce.date({ message: "Data este obligatorie!" }),
    date: z.any(),
    present: z.string(),
    excused: z.string(),
    studentId: z.string({ message: "Elevul este obligatoriu!" }),
    lessonId: z.coerce
        .number({ message: "Ora asociată este obligatorie!" })
        .refine((val) => val > 0, { message: "Ora asociată este obligatorie!" }),
});

export type AttendanceFormData = z.infer<typeof attendanceSchema>;

export type AttendanceActionData = {
    id?: number;
    date: string;
    present: boolean;
    excused: boolean;
    studentId: string;
    lessonId: number;
};