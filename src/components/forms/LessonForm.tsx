"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { lessonSchema, LessonSchema } from "@/lib/formValidationSchemas";
import { createLesson, updateLesson, createRecurringLessons, checkTeacherAvailability } from "@/lib/actions"; 
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { availableModules, ModuleType } from "@/lib/modules"; 


const holidays = [
    { name: "National Day Test1", date: "2025-07-01" },
    { name: "National Day Test2", date: "2025-07-15" },
    { name: "National Day Test3", date: "2025-07-21" },
];

type TeacherWithSubjects = {
    id: string; 
    name: string;
    surname: string;
    
    subjects?: { id: number; name: string }[];
    subjectIds?: number[]; 
};

 
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
        teachers: TeacherWithSubjects[];
    };
}) => {
    
   
    const [isRecurring, setIsRecurring] = useState(false);
    const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
    const [isCreatingRecurring, setIsCreatingRecurring] = useState(false);
    
  
    const [teacherOverlapWarning, setTeacherOverlapWarning] = useState<boolean>(false);
    const [checkingAvailability, setCheckingAvailability] = useState<boolean>(false);


    const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
        data?.subjectId || data?.subject?.id || ""
    );
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
        data?.teacherId || data?.teacher?.id || ""
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch, 
        setError, 
        clearErrors 
    } = useForm<LessonSchema>({
        resolver: zodResolver(lessonSchema),
        defaultValues: {
            startTime: data?.startTime ? new Date(data.startTime) : undefined,
            endTime: data?.endTime ? new Date(data.endTime) : undefined,
            name: data?.name || "",
            day: data?.day || "",
            subjectId: data?.subjectId || data?.subject?.id || "",
            classId: data?.classId || data?.class?.id || "",
            teacherId: data?.teacherId || data?.teacher?.id || "",
        }
    });

   
    const watchedTeacherId = watch("teacherId");
    const watchedDay = watch("day");
    const watchedStartTime = watch("startTime");
    const watchedEndTime = watch("endTime");


    const [state, formAction] = useFormState(
        type === "create" ? createLesson : updateLesson, 
        { success: false, error: false }
    );

    const router = useRouter();

   
    const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSubjectId = e.target.value;
        setSelectedSubjectId(newSubjectId);
        setSelectedTeacherId(""); 
        clearErrors("teacherId"); 
    };


    const getFilteredTeachers = () => {
    if (!selectedSubjectId || !relatedData?.teachers) {
        return relatedData?.teachers || [];
    }

    return relatedData.teachers.filter((teacher: any) => {
        

        if (teacher.subjects && Array.isArray(teacher.subjects)) {
            return teacher.subjects.some((subject: any) => 
                subject.id?.toString() === selectedSubjectId.toString()
            );
        }
        
        if (teacher.subjectIds && Array.isArray(teacher.subjectIds)) {
            return teacher.subjectIds.includes(parseInt(selectedSubjectId));
        }
        
        return true;
    });
};
    
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
        
        if (teacherOverlapWarning) {
            toast.warn("Teacher has an overlapping lesson. Please resolve before submitting.");
            return; 
        }

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
            
            const submissionData = {
                ...formData,
                ...(type === "update" && data?.id && { id: data.id }),
              
                startTime: new Date(formData.startTime),
                endTime: new Date(formData.endTime),
            };
            formAction(submissionData);
        }
    });

    
    useEffect(() => {
        const checkAvailability = async () => {
            const teacherId = watchedTeacherId;
            const day = watchedDay;
            const startTime = watchedStartTime;
            const endTime = watchedEndTime;

           
            if (teacherId && day && startTime && endTime) {
                setCheckingAvailability(true);
               
                const startDateTime = new Date(startTime);
                const endDateTime = new Date(endTime);

               
                const lessonIdToExclude = type === "update" && data?.id ? data.id : undefined;

                const hasOverlap = await checkTeacherAvailability(
                    teacherId,
                    day,
                    startDateTime,
                    endDateTime,
                    lessonIdToExclude
                );
                setTeacherOverlapWarning(hasOverlap);
                setCheckingAvailability(false);

                if (hasOverlap) {
                    setError("teacherId", {
                        type: "manual",
                        message: "Teacher has an overlapping lesson at this time."
                    });
                } else {
                    clearErrors("teacherId");
                }
            } else {
                
                setTeacherOverlapWarning(false);
                clearErrors("teacherId");
            }
        };

       
        const debounceTimeout = setTimeout(() => {
            checkAvailability();
        }, 500); 

        return () => clearTimeout(debounceTimeout); 
    }, [watchedTeacherId, watchedDay, watchedStartTime, watchedEndTime, type, data?.id, setError, clearErrors]);


    useEffect(() => {
        if (state.success && !isRecurring) {
            toast(`Lesson has been ${type === "create" ? "created" : "updated"} successfully!`);
            setOpen(false);
            router.refresh();
        }
        if (state.error) {
            const errorMessage = state.message || "Something went wrong!";
        }
    }, [state, router, type, setOpen, isRecurring]);

    const { subjects, classes, teachers } = relatedData || {};
    const filteredTeachers = getFilteredTeachers();

    return (
      <form className="flex flex-col gap-8 mx-auto" onSubmit={handleSubmit(async () => {
        onSubmit
      })}>
  <h1 className="text-xl font-semibold">
    {type === "create" ? "Create a new lesson" : "Update the lesson"}
  </h1>

  <div className="grid grid-cols-2 gap-4 mt-6">
    {/* Lesson Name */}
    <InputField
      label="Lesson Name"
      name="name"
      defaultValue={data?.name}
      register={register}
      error={errors?.name}
    />

    {/* Start Time */}
    <InputField
      label="Start Time"
      name="startTime"
      defaultValue={
        data?.startTime
          ? isRecurring
            ? new Date(data.startTime).toISOString().slice(11, 16)
            : new Date(data.startTime).toISOString().slice(0, 16)
          : undefined
      }
      register={register}
      error={errors?.startTime}
      type={isRecurring ? "time" : "datetime-local"}
    />

    {/* Day */}
    <div className="flex flex-col gap-2">
      <label className="text-xs text-gray-400 font-medium">Day</label>
      <select
        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
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
        <p className="text-xs text-red-400">{errors.day.message.toString()}</p>
      )}
    </div>

    {/* End Time */}
    <InputField
      label="End Time"
      name="endTime"
      defaultValue={
        data?.endTime
          ? isRecurring
            ? new Date(data.endTime).toISOString().slice(11, 16)
            : new Date(data.endTime).toISOString().slice(0, 16)
          : undefined
      }
      register={register}
      error={errors?.endTime}
      type={isRecurring ? "time" : "datetime-local"}
        className="mt-[-10px]"
    />

    {/* Teacher */}
    <div className="flex flex-col gap-2">
      <label className="text-xs text-gray-400 font-medium">
        Teacher
        {selectedSubjectId && (
          <span className="text-blue-500 ml-1">(Filtered by subject)</span>
        )}
      </label>
      <select
        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
        value={selectedTeacherId}
        {...register("teacherId", {
          onChange: (e) => setSelectedTeacherId(e.target.value),
        })}
      >
        <option value="">
          {selectedSubjectId
            ? "Select teacher for this subject"
            : "Select subject first"}
        </option>
        {filteredTeachers?.map((teacher) => (
          <option value={teacher.id} key={teacher.id}>
            {teacher.name} {teacher.surname}
          </option>
        ))}
      </select>
      {checkingAvailability && (
        <p className="text-xs text-blue-500">Checking teacher availability...</p>
      )}
      {errors.teacherId?.message && (
        <p className="text-xs text-red-400">
          {errors.teacherId.message.toString()}
        </p>
      )}
      {selectedSubjectId && filteredTeachers?.length === 0 && (
        <p className="text-xs text-orange-500">
          This subject has no available teachers.
        </p>
      )}
    </div>

    {/* Subject */}
    <div className="flex flex-col gap-2">
      <label className="text-xs text-gray-400 font-medium">Subject</label>
      <select
        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
        value={selectedSubjectId}
        {...register("subjectId", {
          onChange: handleSubjectChange,
        })}
      >
        <option value="">Select subject</option>
        {subjects?.map((subject) => (
          <option value={subject.id} key={subject.id}>
            {subject.name}
          </option>
        ))}
      </select>
      {errors.subjectId?.message && (
        <p className="text-xs text-red-400">
          {errors.subjectId.message.toString()}
        </p>
      )}
    </div>
  </div>
<div className="grid grid-cols-2 gap-4">
   <div className="flex flex-col gap-2 w-full ">
                    <label className="text-xs text-gray-400">Class</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        defaultValue={data?.classId || data?.class?.id || ""}
                        {...register("classId")}
                    >
                        <option value="">Select class</option>
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
                 {type === "create" && (
               <div className=" mt-1 flex flex-col gap-4 p-4 border rounded-md bg-gray-50 w-full h-full">
  


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
                                <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                                    <p><strong>Selected Module:</strong> {availableModules.find(m => m.id === selectedModuleId)?.name}</p>
                                    <p><strong>Period:</strong> {availableModules.find(m => m.id === selectedModuleId)?.startDate} - {availableModules.find(m => m.id === selectedModuleId)?.endDate}</p>
                                    <p><strong>Note:</strong> Lessons will be created for each selected day within this period, excluding holidays.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {state.error && (
                <span className="text-red-500">
                    {state.message || "Something went wrong!"}
                </span>
            )}
            </div>
  <div className="flex justify-center mt-6">
    <button className="bg-blue-500 text-white px-8 py-2 rounded-md text-sm w-max">
      {type === "create" ? "Create" : "Update"}
    </button>
  </div>
</form>

    );
};

export default LessonForm;