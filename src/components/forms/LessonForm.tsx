"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { CreateLessonSchema, createLessonSchema, updateLessonSchema } from "@/lib/formValidationSchemas";
import { createLesson, updateLesson, createRecurringLessons } from "@/lib/actions";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import LoadingPopup from "@/components/LoadingPopup";
import { useTransition } from "react";
import { availableModules } from "@/lib/modules";
import { nationalHolidays } from "@/lib/holidays";
import { formatDateForInput } from "@/lib/utils";
import z from "zod";

type ModuleType = {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
};

type Weekday =
    | ""
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | undefined;

// const holidays = [
//     { name: "National Day Test1", date: "2025-07-01" },
//     { name: "National Day Test2", date: "2025-07-15" },
//     { name: "National Day Test3", date: "2025-07-21" },
// ];

const LessonForm = ({
    type,
    data,
    setOpen,
    relatedData,
}: {
    type: "create" | "update";
    data?: any;
    setOpen: Dispatch<SetStateAction<boolean>>;
    relatedData?: any;
}) => {

    const schema = type === "create" ? createLessonSchema : updateLessonSchema;
    type FormValues = z.infer<typeof schema>;

    const {
        register,
        handleSubmit,
        formState: { errors, touchedFields, isSubmitted },
        setValue,
        watch,
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            // startTime: data?.startTime ? new Date(data.startTime) : undefined,
            // endTime: data?.endTime ? new Date(data.endTime) : undefined,
            isRecurring: false,
        }
    });

    const [isRecurring, setIsRecurring] = useState(false);
    const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
    const [isCreatingRecurring, setIsCreatingRecurring] = useState(false);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setValue("isRecurring", isRecurring);
    }, [isRecurring, setValue]);

    const [state, formAction] = useFormState(
        type === "create" ? createLesson : updateLesson,
        { success: false, error: false }
    );

    const router = useRouter();

    const getDayOfWeek = (dayString: CreateLessonSchema['day']): number => {
        switch (dayString) {
            case "MONDAY": return 1;
            case "TUESDAY": return 2;
            case "WEDNESDAY": return 3;
            case "THURSDAY": return 4;
            case "FRIDAY": return 5;
            default: return -1;
        }
    };

    const isHoliday = (date: Date): boolean => {
        return nationalHolidays.some(holiday => {
            const holidayDate = new Date(holiday.date);
            return date.getFullYear() === holidayDate.getFullYear() &&
                date.getMonth() === holidayDate.getMonth() &&
                date.getDate() === holidayDate.getDate();
        });
    };

    const getNextWeekday = (targetDay: Weekday, fromDate: Date): Date | undefined | string => {
        if (!targetDay) return undefined;

        // Map weekday names to numeric values (Sunday = 0, Monday = 1, ..., Saturday = 6)
        const dayMap: Record<Exclude<Weekday, "" | undefined>, number> = {
            MONDAY: 1,
            TUESDAY: 2,
            WEDNESDAY: 3,
            THURSDAY: 4,
            FRIDAY: 5,
        };
        const targetDayNum = dayMap[targetDay];
        if (targetDayNum === undefined) return undefined;

        const currentDayNum = fromDate.getDay(); // Sunday=0 ... Saturday=6
        // Compute days to add
        const daysToAdd = (targetDayNum - currentDayNum + 7) % 7; // ensures non-negative result
        // If the target day is today, return the same date
        if (daysToAdd === 0) {
            return new Date(fromDate);
        }
        // Otherwise, add the difference
        const result = new Date(fromDate);
        result.setDate(fromDate.getDate() + daysToAdd);
        return result.toISOString();
    };

    const setDateWithHour = (dateInput: string | Date | undefined, time: string): Date => {
        const date = dateInput ? new Date(dateInput) : new Date();

        if (isNaN(date.getTime())) {
            throw new Error("Invalid date input");
        }
        const [hours, minutes] = time.split(":").map(Number);

        if (
            isNaN(hours) || isNaN(minutes) ||
            hours < 0 || hours > 23 ||
            minutes < 0 || minutes > 59
        ) {
            throw new Error("Invalid time format. Expected hh:mm in 24-hour format.");
        }
        date.setHours(hours, minutes, 0, 0);

        return date;
    };

    const generateRecurringLessons = async (lessonData: CreateLessonSchema, moduleId: number) => {
        const selectedModule = availableModules.find(mod => mod.id === moduleId);
        if (!selectedModule) return { total: 0, success: 0 };

        const moduleStartDate = new Date(selectedModule.startDate);
        const moduleEndDate = new Date(selectedModule.endDate);
        const lessonDayOfWeek = getDayOfWeek(lessonData.day);

        const dateOfFirstTypeOfDayInModule = getNextWeekday(lessonData.day, moduleStartDate);
        const dateOfFirstTypeOfDayOutOfModule = getNextWeekday(lessonData.day, moduleEndDate);

        const dateOfFirstTypeOfDayInModuleWithCorrectHour = setDateWithHour(dateOfFirstTypeOfDayInModule, lessonData.startTime);
        const dateOfFirstTypeOfDayOutOfModuleWithCorrectHour = setDateWithHour(dateOfFirstTypeOfDayOutOfModule, lessonData.endTime);

        const baseStartTime = new Date(dateOfFirstTypeOfDayInModuleWithCorrectHour || "");
        const baseEndTime = new Date(dateOfFirstTypeOfDayOutOfModuleWithCorrectHour || "");

        moduleStartDate.setHours(0, 0, 0, 0);
        moduleEndDate.setHours(0, 0, 0, 0);

        let currentDate = new Date(moduleStartDate);
        const lessonsToCreate = [];

        while (currentDate.getTime() <= moduleEndDate.getTime()) {
            if (currentDate.getDay() === lessonDayOfWeek) {
                if (!isHoliday(currentDate)) {
                    const lessonDate = new Date(currentDate);

                    lessonDate.setHours(baseStartTime.getHours());
                    lessonDate.setMinutes(baseStartTime.getMinutes());
                    lessonDate.setSeconds(0);
                    lessonDate.setMilliseconds(0);
                    const newLessonStartTime = new Date(lessonDate);

                    lessonDate.setHours(baseEndTime.getHours());
                    lessonDate.setMinutes(baseEndTime.getMinutes());
                    const newLessonEndTime = new Date(lessonDate);

                    const uniqueLessonName = `${lessonData.name} - ${newLessonStartTime.toISOString()}`;

                    lessonsToCreate.push({
                        //name: lessonData.name,
                        name: uniqueLessonName,
                        day: lessonData.day,
                        startTime: newLessonStartTime.toString(),
                        endTime: newLessonEndTime.toString(),
                        subjectId: lessonData.subjectId,
                        classId: lessonData.classId,
                        teacherId: lessonData.teacherId,
                        isRecurring: false,
                    });
                }
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const result = await createRecurringLessons(lessonsToCreate);

        if (result.success) {
            return { total: lessonsToCreate.length, success: result.successCount || 0 };
        } else {
            console.error("Error from createRecurringLessons action:", result.message || "Unknown error");
            return { total: lessonsToCreate.length, success: 0 };
        }
    };

    const onSubmit = handleSubmit(async (formData) => {
        if (isRecurring && selectedModuleId === null) {
            toast.error("Selectați modulul!");
            return;
        }
        if (isRecurring && formData.day === "") {
            toast.error("Selectați ziua!");
            return;
        }
        if (formData.teacherId === null || formData.teacherId === "abc") {
            toast.error("Selectați profesorul!");
            return;
        }
        startTransition(async () => {
            if (isRecurring && selectedModuleId) {
                setIsCreatingRecurring(true);
                try {
                    const result = await generateRecurringLessons(formData, selectedModuleId);
                    if (result && result.success > 0) {
                        toast.success(`Au fost create cu succes ${result.success} din ${result.total} ore recurente!`);
                        setOpen(false);
                        router.refresh();
                    } else {
                        toast.error("A intervenit o eroare la crearea orelor recurente. Încearcă mai târziu.");
                    }
                } catch (error) {
                    console.error("A intervenit o eroare la generarea orelor recurente:", error);
                    toast.error("A intervenit o eroare la crearea orelor recurente. Încearcă mai târziu.");
                } finally {
                    setIsCreatingRecurring(false);
                }
            } else {
                const submissionData = {
                    ...formData,
                    ...(type === "update" && data?.id && { id: data.id }),
                    startTime: new Date(new Date(formData.startTime).getTime()),
                    endTime: new Date(new Date(formData.endTime).getTime()),
                };
                formAction(submissionData);
            }
        });
    });

    useEffect(() => {
        if (state.success && !isRecurring) {
            toast(`Oră ${type === "create" ? "creată" : "actualizată"} cu succes!`);
            setOpen(false);
            router.refresh();
        }
    }, [state, router, type, setOpen, isRecurring]);

    const { subjects, classes, teachers } = relatedData || {};
    const [filteredSubjects, setFilteredSubjects] = useState(subjects || []);
    const [filteredTeachers, setFilteredTeachers] = useState(teachers || []);

    const getDateError = (field: "startTime" | "endTime") => {
        const err = errors[field];
        if (isSubmitted && !touchedFields[field] && !err) {
            return field === "startTime"
                ? "Data și ora de început sunt obligatorii!"
                : "Data și ora de sfârșit sunt obligatorii!";
        }
        if (err?.message === "Invalid date") {
            return field === "startTime"
                ? "Data și ora de început sunt obligatorii!"
                : "Data și ora de sfârșit sunt obligatorii!";
        }
        return err?.message;
    };
    const updateSelect = async (selectedOption: "subjects" | "teachers", teacherIdOrSubjectName: string) => {
        startTransition(async () => {
            if (selectedOption === "subjects") {
                const newTeachers = teachers?.filter((t: any) => t.subjects?.some((sub: any) => sub.name === teacherIdOrSubjectName));
                setFilteredTeachers(newTeachers || []);
            } else if (selectedOption === "teachers") {
                const newSubjects = teachers?.find((s: any) => String(s.id) === String(teacherIdOrSubjectName))?.subjects;
                setFilteredSubjects(newSubjects || []);
            }
        });
    };

    const isRecurringWatch = watch("isRecurring", isRecurring);

    return (
        <form className="flex flex-col gap-6" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Adaugă o nouă oră" : "Actualizează ora"}
            </h1>
            <div className="h-fit w-full">
                <div className="w-full flex">
                    <div className="flex flex-col flex-1 mx-1 mt-7 gap-4">
                        <div className="mt-1">
                            <InputField
                                label="Subiectul lecției"
                                name="name"
                                defaultValue={data?.name}
                                register={register}
                                error={errors?.name}
                            />
                        </div>

                        <div className="flex flex-col gap-2 w-full mt-4">
                            <div className="flex items-center gap-1">
                                <label
                                    className={`text-xs ${!isRecurring ? "text-gray-400" : "text-gray-600"}`}
                                >
                                    Ziua
                                </label>
                                {!isRecurring && (
                                    <span
                                        className="text-gray-400 text-xs cursor-help"
                                        title="Disponibil doar dacă este bifată opțiunea de ore recurente"
                                    >
                                        ⓘ
                                    </span>
                                )}
                            </div>
                            <select
                                className={`ring-[1.5px] p-2 rounded-md text-sm w-full ${!isRecurring ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "ring-gray-300"
                                    }`}
                                defaultValue={data?.day || ""}
                                {...register("day")}
                                disabled={!isRecurring}
                            >
                                <option value="">Alege o zi</option>
                                <option value="MONDAY">Luni</option>
                                <option value="TUESDAY">Marți</option>
                                <option value="WEDNESDAY">Miercuri</option>
                                <option value="THURSDAY">Joi</option>
                                <option value="FRIDAY">Vineri</option>
                            </select>
                            {errors.day?.message && (
                                <p className="text-xs text-red-400">
                                    {errors.day.message.toString()}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2 w-full mt-3">
                            <label className="text-xs text-gray-400">Profesor</label>
                            <select
                                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                                defaultValue={data?.teacherId || data?.teacher?.id || ""}
                                {...register("teacherId")}
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    const teacher = filteredTeachers?.find((s: any) => s.id === selectedId);
                                    if (teacher) {
                                        updateSelect("teachers", teacher.id);
                                    }
                                }}
                            >
                                <option value="abc">Alege un profesor</option>
                                {filteredTeachers?.map(
                                    (teacher: { id: string; name: string; surname: string }) => (
                                        <option value={teacher.id} key={teacher.id}>
                                            {teacher.name} {teacher.surname}
                                        </option>
                                    )
                                )}
                            </select>
                            {errors.teacherId?.message && (
                                <p className="text-xs text-red-400">
                                    {errors.teacherId.message.toString()}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2 w-full mt-4">
                            <label className="text-xs text-gray-400">Clasa</label>
                            <select
                                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                                defaultValue={data?.classId || data?.class?.id || ""}
                                {...register("classId")}
                            >
                                <option value="abc">Alege o clasa</option>
                                {classes?.map(
                                    (classItem: { id: number; name: string; grade: { level: number } }) => (
                                        <option value={classItem.id} key={classItem.id}>
                                            {classItem.name} - Grade {classItem.grade.level}
                                        </option>
                                    )
                                )}
                            </select>
                            {errors.classId?.message && (
                                <p className="text-xs text-red-400">
                                    {errors.classId.message.toString()}
                                </p>
                            )}
                        </div>

                    </div>
                    <div className="flex flex-col flex-1 mx-1 mt-7 gap-4">
                        <div className="mt-1 flex items-start gap-2">
                            {/* <span
                                className="text-gray-400 text-xs cursor-help shrink-0 pt-2"
                                title="Dacă este bifată opțiunea de ore recurente, atunci selectați doar ora și minutul. Puteți ignora data."
                            >
                                ⓘ
                            </span> */}
                            <div className="flex-1">
                                <InputField
                                    label="Începutul orei"
                                    name="startTime"
                                    defaultValue={data?.startTime ? formatDateForInput(data.startTime) : undefined}
                                    register={register}
                                    error={getDateError("startTime")}
                                    type={isRecurringWatch ? "time" : "datetime-local"}
                                />
                            </div>
                        </div>
                        <div className="mt-1 flex items-start gap-2">
                            {/* <span
                                className="text-gray-400 text-xs cursor-help shrink-0 pt-2"
                                title="Dacă este bifată opțiunea de ore recurente, atunci selectați doar ora și minutul. Puteți ignora data."
                            >
                                ⓘ
                            </span> */}
                            <div className="flex-1">
                                <InputField
                                    label="Sfârșitul orei"
                                    name="endTime"
                                    defaultValue={data?.endTime ? formatDateForInput(data.endTime) : undefined}
                                    register={register}
                                    error={getDateError("endTime")}
                                    type={isRecurringWatch ? "time" : "datetime-local"}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 w-full mt-3">
                            <label className="text-xs text-gray-400">Materie</label>
                            <select
                                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                                defaultValue={data?.subjectId || data?.subject?.id || ""}
                                {...register("subjectId")}
                                onChange={(e) => {
                                    const selectedId = Number(e.target.value);
                                    const subject = filteredSubjects?.find((s: any) => s.id === selectedId);
                                    if (subject) {
                                        updateSelect("subjects", subject.name);
                                    }
                                }}
                            >
                                <option value="abc">Alege o materie</option>
                                {filteredSubjects?.map(
                                    (subject: { id: number; name: string }) => (
                                        <option value={subject.id} key={subject.id}>
                                            {subject.name}
                                        </option>
                                    )
                                )}
                            </select>
                            {errors.subjectId?.message && (
                                <p className="text-xs text-red-400">
                                    {errors.subjectId.message.toString()}
                                </p>
                            )}
                        </div>

                        {type === "create" && (
                            <div className="flex flex-col gap-4 p-4 border rounded-md bg-gray-50 mt-6">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isRecurring"
                                        checked={isRecurring}
                                        onChange={(e) => setIsRecurring(e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                    <label htmlFor="isRecurring" className="text-sm font-medium">
                                        Creează ore recurente
                                    </label>
                                </div>

                                {isRecurring && (
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs text-gray-400">
                                            Selectează modulul pentru care vrei să creezi orele recurente
                                        </label>
                                        <select
                                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                                            value={selectedModuleId || ""}
                                            onChange={(e) => setSelectedModuleId(Number(e.target.value) || null)}
                                        >
                                            <option value="">Alege modulul</option>
                                            {availableModules.map((module) => (
                                                <option key={module.id} value={module.id}>
                                                    {module.name}
                                                </option>
                                            ))}
                                        </select>
                                        {selectedModuleId && (
                                            <div className="3 p-2 bg-blue-50 rounded text-xs">
                                                <p><strong>Modul selectat:</strong> {availableModules.find(m => m.id === selectedModuleId)?.name}</p>
                                                <p><strong>Perioada:</strong> {availableModules.find(m => m.id === selectedModuleId)?.startDate} - {availableModules.find(m => m.id === selectedModuleId)?.endDate}</p>
                                                <p><strong>Important:</strong> Lecțiile vor fi create pentru fiecare zi selectată din intervalul ales, exceptând weekendurile și zilele libere naționale!</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full h-fit flex flex-col items-center justify-center mt-12 mb-8">
                    {state.error && <span className="text-red-500">{state?.message}</span>}

                    <button
                        type="submit"
                        disabled={isCreatingRecurring}
                        className="bg-blue-500 text-white py-2 px-8 rounded-md disabled:bg-gray-400 w-fit"
                    >
                        {isCreatingRecurring ? "Creez orele..." :
                            type === "create" ?
                                (isRecurring ? "Adaugă ore recurente" : "Adaugă ora") :
                                "Actualizează ora"}
                    </button>
                </div>
            </div>
            {isPending && <LoadingPopup />}
        </form >
    );
};

export default LessonForm;
