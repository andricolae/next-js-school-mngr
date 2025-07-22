"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { set, useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchemas";
import { createSubject, updateSubject } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const SubjectForm = ({
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
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue
    } = useForm<SubjectSchema>({
        resolver: zodResolver(subjectSchema),
        defaultValues: type === "update" ? {
            id: data?.id,
            name: data?.name
        } : {}
    
    });

    
    const [state, formAction] = useFormState(type === "create"
        ? createSubject : updateSubject, { success: false, error: false })

    const onSubmit = handleSubmit(data => {
        formAction(data);
    })

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            toast(`Subject has been ${type === "create" ? "created" : "updated"} successfully!`);
            setOpen(false);
            router.refresh();
        }

         if (state.error) {
            const errorMessage = state.message || "Something went wrong!";
        }
        
    }, [state, router, type, setOpen]);

    const { teachers } = relatedData;

    return (
      <form className="flex flex-col gap-8 mx-auto" onSubmit={onSubmit}>
            <h1 className="text-cl font-semibold text-left mb-6">
                {type === "create" ? "Create a new subject" : "Update the subject"}
            </h1>

            <div className="flex flex-col gap-6 w-full">
                <InputField
                    label="Subject Name"
                    name="name"
                    defaultValue={data?.name}
                    register={register}
                    error={errors?.name}
                />
                {data && (
                    <InputField
                        label="Id"
                        name="id"
                        defaultValue={data?.id}
                        register={register}
                        error={errors?.id}
                        hidden
                    />
                )}

                {/* Teachers multi-select */}
                <div className="flex flex-col gap-1 w-full">
                    <label className="text-xs text-gray-400">Teachers</label>
                    <select
                        multiple
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full h-20"
                        {...register("teachers")}
                        defaultValue={data?.teachers || []}
                    >
                        {teachers?.map(
                            (teacher: { id: string; name: string; surname: string }) => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.name} {teacher.surname}
                                </option>
                            )
                        )}
                    </select>
                    {errors.teachers?.message && (
                        <p className="text-xs text-red-400">{errors.teachers.message.toString()}</p>
                    )}
                </div>
            </div>

            {state.error && (
                <span className="text-red-500 text-center">
                    {state.message || "Something went wrong!"}
                </span>
            )}

            <div className="flex justify-center mt-6">
                <button className="bg-blue-500 text-white px-8 py-2 rounded-md text-sm w-max">
                    {type === "create" ? "Create" : "Update"}
                </button>
            </div>
        </form>

    )
};

export default SubjectForm