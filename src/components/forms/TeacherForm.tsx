"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { teacherSchema, TeacherSchema } from "@/lib/formValidationSchemas";
import { createTeacher, updateTeacher } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useFormState } from "react-dom";
import { CldUploadWidget } from 'next-cloudinary';

const TeacherForm = ({
    type,
    data,
    setOpen,
    relatedData
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
    } = useForm<TeacherSchema>({
        resolver: zodResolver(teacherSchema),
        defaultValues: {
            id: data?.id,
            username: data?.username,
            name: data?.name,
            surname: data?.surname,
            email: data?.email,
            phone: data?.phone,
            address: data?.address,
            bloodType: data?.bloodType,
            gender: data?.gender,
            birthday: data?.birthday,
            subjects: data?.subjects?.map((subject: any) => subject.id.toString()) || [],
        }
    });

    const [img, setImg] = useState<any>()

    const [state, formAction] = useFormState(type === "create"
        ? createTeacher : updateTeacher, { success: false, error: false })

    const onSubmit = handleSubmit(data => {
        formAction({ ...data, img: img?.secure_url });
    })

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            toast(`Teacher has been ${type === "create" ? "created" : "updated"} successfully!`);
            setOpen(false);
            router.refresh();
        }
        if (state.error) {
            const errorMessage = state.message || "Something went wrong!";
        }
    }, [state, router, type, setOpen]);

    const { subjects } = relatedData;

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-cl font-semibold">{type === "create" ? "Create a new teacher" : "Update the teacher"}</h1>
            <span className="text-xs text-gray-400 font-medium">Authentication Information</span>
            <div className="flex justify-between gap-4">
                <InputField
                    label="Username"
                    name="username"
                    defaultValue={data?.username}
                    register={register}
                    error={errors?.username}
                />
                <InputField
                    label="Email"
                    name="email"
                    type="email"
                    defaultValue={data?.email}
                    register={register}
                    error={errors?.email}
                />
                <InputField
                    label="Password"
                    name="password"
                    type="password"
                    defaultValue={data?.password}
                    register={register}
                    error={errors?.password}
                />
            </div>
            <span className="text-xs text-gray-400 font-medium">Personal Information</span>
            <div className="flex justify-between flex-wrap gap-4">
                <InputField
                    label="First Name"
                    name="name"
                    defaultValue={data?.name}
                    register={register}
                    error={errors?.name}
                />
                <InputField
                    label="Last Name"
                    name="surname"
                    defaultValue={data?.surname}
                    register={register}
                    error={errors?.surname}
                />
                <InputField
                    label="Phone"
                    name="phone"
                    defaultValue={data?.phone}
                    register={register}
                    error={errors?.phone}
                />
                <InputField
                    label="Address"
                    name="address"
                    defaultValue={data?.address}
                    register={register}
                    error={errors?.address}
                />
                <div className="flex flex-col gap-2 w-full md:w-1/4">
                <InputField
                    label="Blood Type"
                    name="bloodType"
                    defaultValue={data?.bloodType}
                    register={register}
                    error={errors?.bloodType}
                />
                </div>
                <div className="flex flex-col gap-2 w-full md:w-1/4">
                <InputField
                    label="Birthday"
                    name="birthday"
                    type="date"
                    defaultValue={data?.birthday.toISOString().split("T")[0]}
                    register={register}
                    error={errors?.birthday}
                />
                </div>
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
                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-400">Gender</label>
                    <select className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full" {...register("gender")}>
                        <option value="FEMALE">Female</option>
                        <option value="MALE">Male</option>
                        <option value="OTHER">Other</option>
                    </select>
                    {errors.gender?.message && <p className="text-xs text-red-400">{errors.gender.message.toString()}</p>}
                </div>
                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-400">Subjects</label>
                    <select
                        multiple
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("subjects")}
                    >
                        {subjects.map((subject: { id: number; name: string }) => (
                            <option value={subject.id} key={subject.id}>
                                {subject.name}
                            </option>
                        ))}
                    </select>
                    {errors.subjects?.message && <p className="text-xs text-red-400">{errors.subjects.message.toString()}</p>}
                </div>
                <div className="flex flex-col">
                    <CldUploadWidget uploadPreset="school-mgmt" onSuccess={(result, { widget }) => {
                        setImg(result.info)
                        widget.close();
                    }}>
                        {({ open }) => {
                            return (
                                <div
                                    className="text-xs text-gray-400 flex items-center gap-2 cursor-pointer"
                                    onClick={() => open()}
                                >
                                    <Image src="/upload.png" alt="" width={28} height={28} />
                                    <span>Upload a Photo</span>
                                </div>
                            );
                        }}
                    </CldUploadWidget>
                    {img && (
                        <div className="mt-2 flex items-center gap-2">
                            <Image
                                src={img.secure_url}
                                alt="Uploaded preview"
                                width={100}
                                height={100}
                                className="rounded-full object-cover"
                            />
                            <span className="text-xs text-green-500">Uploaded successfully!</span>
                        </div>
                    )}
                </div>
            </div>
           {state.error && (
                <span className="text-red-500">
                    {state.message || "Something went wrong!"}
                </span>
            )}
            <button className="bg-blue-500 text-white p-2 rounded-md">{type === "create" ? "Create" : "Update"}</button>
        </form>
    )
};

export default TeacherForm