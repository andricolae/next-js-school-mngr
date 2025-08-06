"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { lessonSchema, LessonSchema } from "@/lib/formValidationSchemas";
import { createLesson, updateLesson, createRecurringLessons } from "@/lib/actions";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";


type ModuleType = {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
};


const holidays = [
    { name: "National Day Test1", date: "2025-07-01" },
    { name: "National Day Test2", date: "2025-07-15" },
    { name: "National Day Test3", date: "2025-07-21" },
];

const LessonForm = ({
    type,
    data,
    setOpen,
    relatedData,
}: {
    type: "create" | "update";
    data?: any;
    setOpen: Dispatch<SetStateAction<boolean>>;
    relatedData?: {
        subjects: any[];
        classes: any[];
        teachers: any[];
    };
}) => {

    const availableModules: ModuleType[] = [
        {
            id: 1,
            name: "Semester 1",
            startDate: "2025-07-01",
            endDate: "2025-07-31"
        },
        {
            id: 2,
            name: "Semester 2 ",
            startDate: "2025-08-01",
            endDate: "2025-08-31"
        },
        {
            id: 3,
            name: "Semester 3",
            startDate: "2025-09-01",
            endDate: "2025-09-30"
        }
    ];

    const [isRecurring, setIsRecurring] = useState(false);
    const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
    const [isCreatingRecurring, setIsCreatingRecurring] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LessonSchema>({
        resolver: zodResolver(lessonSchema),
        defaultValues: {
            startTime: data?.startTime ? new Date(data.startTime) : undefined,
            endTime: data?.endTime ? new Date(data.endTime) : undefined,
        }
    });

    const [state, formAction] = useFormState(
        type === "create" ? createLesson : updateLesson,
        { success: false, error: false }
    );

    const router = useRouter();


    const getDayOfWeek = (dayString: LessonSchema['day']): number => {
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
        return holidays.some(holiday => {
            const holidayDate = new Date(holiday.date);
            return date.getFullYear() === holidayDate.getFullYear() &&
                date.getMonth() === holidayDate.getMonth() &&
                date.getDate() === holidayDate.getDate();
        });
    };


    const generateRecurringLessons = async (lessonData: LessonSchema, moduleId: number) => {
        const selectedModule = availableModules.find(mod => mod.id === moduleId);
        if (!selectedModule) return { total: 0, success: 0 };

        const moduleStartDate = new Date(selectedModule.startDate);
        const moduleEndDate = new Date(selectedModule.endDate);
        const lessonDayOfWeek = getDayOfWeek(lessonData.day);

        const baseStartTime = new Date(lessonData.startTime);
        const baseEndTime = new Date(lessonData.endTime);

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

                    const uniqueLessonName = `${lessonData.name} - ${newLessonStartTime.toLocaleDateString('ro-RO')}`;

                    lessonsToCreate.push({
                        //name: lessonData.name,
                        name: uniqueLessonName,
                        day: lessonData.day,
                        startTime: newLessonStartTime,
                        endTime: newLessonEndTime,
                        subjectId: lessonData.subjectId,
                        classId: lessonData.classId,
                        teacherId: lessonData.teacherId,
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
        if (isRecurring && selectedModuleId) {
            setIsCreatingRecurring(true);
            try {
                const result = await generateRecurringLessons(formData, selectedModuleId);
                if (result && result.success > 0) {
                    toast.success(`Successfully created ${result.success} out of ${result.total} recurring lessons!`);
                    setOpen(false);
                    router.refresh();
                } else {
                    toast.error("Error creating recurring lessons!");
                }
            } catch (error) {
                console.error("Error generating recurring lessons:", error);
                toast.error("Error creating recurring lessons!");
            } finally {
                setIsCreatingRecurring(false);
            }
        } else {
            // const startDate = formData.startTime;
            // console.log(formData.startTime);

            const submissionData = {
                ...formData,
                ...(type === "update" && data?.id && { id: data.id }),
                startTime: new Date(new Date(formData.startTime).getTime() + (3 * 60 * 60 * 1000)),
                endTime: new Date(new Date(formData.endTime).getTime() + (3 * 60 * 60 * 1000)),
            };
            formAction(submissionData);
        }
    });

    useEffect(() => {
        if (state.success && !isRecurring) {
            toast(`Lesson has been ${type === "create" ? "created" : "updated"} successfully!`);
            setOpen(false);
            router.refresh();
        }
    }, [state, router, type, setOpen, isRecurring]);

    const { subjects, classes, teachers } = relatedData || {};

    return (
        <form className="flex flex-col gap-6" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Create a new lesson" : "Update the lesson"}
            </h1>
            <div className="h-fit w-full">
                <div className="w-full flex">
                    <div className="flex flex-col flex-1 mx-1 mt-7 gap-4">
                        <div className="mt-1">
                            <InputField
                                label="Lesson Name"
                                name="name"
                                defaultValue={data?.name}
                                register={register}
                                error={errors?.name}
                            />
                        </div>

                        <div className="flex flex-col gap-2 w-full mt-4">
                            <label className="text-xs text-gray-400">Day</label>
                            <select
                                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                                defaultValue={data?.day || ""}
                                {...register("day")}
                            >
                                <option value="">Select day</option>
                                <option value="MONDAY">Monday</option>
                                <option value="TUESDAY">Tuesday</option>
                                <option value="WEDNESDAY">Wednesday</option>
                                <option value="THURSDAY">Thursday</option>
                                <option value="FRIDAY">Friday</option>
                            </select>
                            {errors.day?.message && (
                                <p className="text-xs text-red-400">
                                    {errors.day.message.toString()}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2 w-full mt-3">
                            <label className="text-xs text-gray-400">Teacher</label>
                            <select
                                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                                defaultValue={data?.teacherId || data?.teacher?.id || ""}
                                {...register("teacherId")}
                            >
                                <option value="">Select teacher</option>
                                {teachers?.map(
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
                            <label className="text-xs text-gray-400">Class</label>
                            <select
                                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                                defaultValue={data?.classId || data?.class?.id || ""}
                                {...register("classId")}
                            >
                                <option value="abc">Select class</option>
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
                        <div className="mt-1">
                            <InputField
                                label="Start Time"
                                name="startTime"
                                defaultValue={data?.startTime ?
                                    new Date(data.startTime).toISOString().slice(0, 16) :
                                    undefined
                                }
                                register={register}
                                error={errors?.startTime}
                                type="datetime-local"
                            />
                        </div>
                        <div className="mt-1">
                            <InputField
                                label="End Time"
                                name="endTime"
                                defaultValue={data?.endTime ?
                                    new Date(data.endTime).toISOString().slice(0, 16) :
                                    undefined
                                }
                                register={register}
                                error={errors?.endTime}
                                type="datetime-local"
                            />
                        </div>

                        <div className="flex flex-col gap-2 w-full mt-3">
                            <label className="text-xs text-gray-400">Subject</label>
                            <select
                                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                                defaultValue={data?.subjectId || data?.subject?.id || ""}
                                {...register("subjectId")}
                            >
                                <option value="abc">Select subject</option>
                                {subjects?.map(
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
                                        Create recurring lessons
                                    </label>
                                </div>

                                {isRecurring && (
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs text-gray-400">
                                            Select module for recurring lessons
                                        </label>
                                        <select
                                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                                            value={selectedModuleId || ""}
                                            onChange={(e) => setSelectedModuleId(Number(e.target.value) || null)}
                                        >
                                            <option value="">Select module</option>
                                            {availableModules.map((module) => (
                                                <option key={module.id} value={module.id}>
                                                    {module.name}
                                                </option>
                                            ))}
                                        </select>
                                        {selectedModuleId && (
                                            <div className="3 p-2 bg-blue-50 rounded text-xs">
                                                <p><strong>Selected Module:</strong> {availableModules.find(m => m.id === selectedModuleId)?.name}</p>
                                                <p><strong>Period:</strong> {availableModules.find(m => m.id === selectedModuleId)?.startDate} - {availableModules.find(m => m.id === selectedModuleId)?.endDate}</p>
                                                <p><strong>Note:</strong> Lessons will be created for each selected day within this period, excluding holidays.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full h-fit flex flex-col items-center justify-center mt-12">
                    {state.error && <span className="text-red-500">Something went wrong!</span>}

                    <button
                        type="submit"
                        disabled={isCreatingRecurring}
                        className="bg-blue-500 text-white py-2 px-8 rounded-md disabled:bg-gray-400 w-fit"
                    >
                        {isCreatingRecurring ? "Creating lessons..." :
                            type === "create" ?
                                (isRecurring ? "Create recurring lessons" : "Create") :
                                "Update"}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default LessonForm;