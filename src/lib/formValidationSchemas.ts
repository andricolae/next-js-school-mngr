import { z } from "zod";

export const subjectSchema = z.object({
    id: z.coerce.number().optional(),
    name: z
        .string()
        .min(1, { message: 'Subject name is required' }),
    teachers: z.array(z.string()),
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const moduleSchema = z.object({
  id: z.number().optional(), 
  name: z.string().min(1, "Module name is required."),
  startDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), "Invalid start date"),
  endDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), "Invalid end date"),
  
  holidays: z.array(z.object({
    name: z.string().min(1, "Holiday name is required"),
    date: z.string().refine((date) => !isNaN(new Date(date).getTime()), "Invalid date"),
  })).default([]),
});

export type ModuleSchema = z.infer<typeof moduleSchema>;


export const holidaySchema = z.object({
  name: z.string().min(1, "Holiday name is required"),
  date: z.string().refine((date) => !isNaN(new Date(date).getTime()), "Invalid date"),
});

export type HolidaySchema = z.infer<typeof holidaySchema>;

export const classSchema = z.object({
    id: z.coerce.number().optional(),
    name: z
        .string()
        .min(1, { message: 'Class name is required' }),
    capacity: z
        .coerce.number()
        .min(1, { message: 'Capacity is required' }),
    gradeId: z
        .coerce.number()
        .min(1, { message: 'Grade name is required' }),
    supervisorId: z
        .string()
        .optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

export const teacherSchema = z.object({
    id: z.string().optional(),
    username: z
        .string()
        .min(3, { message: 'Username must be at least 3 characters long!' })
        .max(20, { message: 'Username must be max 20 characters long!' }),
    password: z
        .string()
        .min(6, { message: "Password must be at least 8 characters long!" })
        .optional()
        .or(z.literal("")),
    name: z.string().min(1, { message: "First Name is required!" }),
    surname: z.string().min(1, { message: "Last Name is required!" }),
    email: z
        .string()
        .email({ message: "Invalid email address!" })
        .optional()
        .or(z.literal("")),
    phone: z.string().optional(),
    address: z.string(),
    img: z.string().optional(),
    bloodType: z.string().min(1, { message: "Blood Type is required!" }),
    birthday: z.coerce.date({ message: "Birthday is required!" }),
    gender: z.enum(["FEMALE", "MALE", "OTHER"], { message: "Gender is required!" }),
    subjects: z.array(z.string()).optional(),
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

export const studentSchema = z.object({
    id: z.string().optional(),
    username: z
        .string()
        .min(3, { message: 'Username must be at least 3 characters long!' })
        .max(20, { message: 'Username must be max 20 characters long!' }),
    password: z
        .string()
        .min(6, { message: "Password must be at least 8 characters long!" })
        .optional()
        .or(z.literal("")),
    name: z.string().min(1, { message: "First Name is required!" }),
    surname: z.string().min(1, { message: "Last Name is required!" }),
    email: z
        .string()
        .email({ message: "Invalid email address!" })
        .optional()
        .or(z.literal("")),
    phone: z.string().optional(),
    address: z.string(),
    img: z.string().optional(),
    bloodType: z.string().min(1, { message: "Blood Type is required!" }),
    birthday: z.coerce.date({ message: "Birthday is required!" }),
    gender: z.enum(["FEMALE", "MALE", "OTHER"], { message: "Gender is required!" }),
    gradeId: z.coerce.number().min(1, { message: "Grade is required" }),
    classId: z.coerce.number().min(1, { message: "Class is required" }),
    parentId: z.coerce.string().min(1, { message: "Parent ID is required" }),
});

export type StudentSchema = z.infer<typeof studentSchema>;

export const examSchema = z.object({
    id: z.coerce.number().optional(),
    title: z
        .string()
        .min(1, { message: 'Subject name is required' }),
    startTime: z.coerce.date({ message: "Start time is required!" }),
    endTime: z.coerce.date({ message: "End time is required!" }),
    lessonId: z.coerce.number({ message: "Lesson is required!" }),
});

export type ExamSchema = z.infer<typeof examSchema>;

export const assignmentSchema = z.object({
    id: z.coerce.number().optional(),
    title: z
        .string()
        .min(1, { message: 'Subject name is required' }),
    startDate: z.coerce.date({ message: "Start date is required!" }),
    dueDate: z.coerce.date({ message: "Due date is required!" }),
    lessonId: z.coerce.number({ message: "Lesson is required!" }),
});

export type AssignmentSchema = z.infer<typeof assignmentSchema>;

export const resultSchema = z.object({
    id: z.coerce.number().optional(),
    score: z.coerce.number().min(0).max(100, { message: "Score must be between 0 and 100" }),
    examId: z.coerce.number().optional(),
    assignmentId: z.coerce.number().optional(),
    studentId: z.string().min(1, { message: "Student is required" }),
});

export type ResultSchema = z.infer<typeof resultSchema>;

export const eventSchema = z.object({
    id: z.coerce.number().optional(),
    title: z.string().min(1, { message: "Event title is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    startTime: z.coerce.date({ message: "Start time is required" }),
    endTime: z.coerce.date({ message: "End time is required" }),
    classId: z.coerce.number().optional(),
});

export type EventSchema = z.infer<typeof eventSchema>;

export const announcementSchema = z.object({
    id: z.coerce.number().optional(),
    title: z.string().min(1, { message: "Announcement title is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    date: z.coerce.date({ message: "Date is required" }),
    classId: z.coerce.number().optional(),
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;

export const lessonSchema = z.object({
    id: z.coerce.number().optional(),
    name: z.string().min(1, { message: "Lesson name is required" }),
    day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"], { message: "Day is required" }),
    startTime: z.coerce.date({ message: "Start time is required" }),
    endTime: z.coerce.date({ message: "End time is required" }),
    subjectId: z.coerce.number({ message: "Subject is required" }),
    classId: z.coerce.number({ message: "Class is required" }),
    teacherId: z.string().min(1, { message: "Teacher is required" }),
});

export type LessonSchema = z.infer<typeof lessonSchema>;

export type GeneratedLessonData = Omit<LessonSchema, 'isRecurring' | 'moduleId' | 'id'> & {id?: number};

export const parentSchema = z.object({
    id: z.string().optional(),
    username: z
        .string()
        .min(3, { message: 'Username must be at least 3 characters long!' })
        .max(20, { message: 'Username must be max 20 characters long!' }),
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters long!" })
        .optional()
        .or(z.literal("")),
    name: z.string().min(1, { message: "First Name is required!" }),
    surname: z.string().min(1, { message: "Last Name is required!" }),
    email: z
        .string()
        .email({ message: "Invalid email address!" })
        .optional()
        .or(z.literal("")),
    phone: z.string().min(1, { message: "Phone number is required!" }),
    address: z.string().min(1, { message: "Address is required!" }),
});

export type ParentSchema = z.infer<typeof parentSchema>;

export const attendanceSchema = z.object({
    id: z.coerce.number().optional(),
    date: z.coerce.date({ message: "Date is required" }),
    present: z.string(), 
    studentId: z.string().min(1, { message: "Student is required" }),
    lessonId: z.coerce.number({ message: "Lesson is required" }),
});

export type AttendanceFormData = z.infer<typeof attendanceSchema>;

export type AttendanceActionData = {
    id?: number;
    date: Date;
    present: boolean; 
    studentId: string;
    lessonId: number;
};