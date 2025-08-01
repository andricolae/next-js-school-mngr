"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { studentSchema, StudentSchema } from "@/lib/formValidationSchemas";
import { createStudent, updateStudent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useFormState } from "react-dom";
import { CldUploadWidget } from "next-cloudinary";

const StudentForm = ({
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
  } = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema),
  });

  const [img, setImg] = useState<any>();

  const [state, formAction] = useFormState(
    type === "create" ? createStudent : updateStudent,
    { success: false, error: false }
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = handleSubmit((data) => {
    formAction({ ...data, img: img?.secure_url });
    setIsSubmitting(true);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(
        `Student has been ${type === "create" ? "created" : "updated"} successfully!`
      );
      setOpen(false);
      router.refresh();
    }
    else setIsSubmitting(false);
  }, [state, router, type, setOpen]);

  const { grades, classes, parents } = relatedData || {
    grades: [],
    classes: [],
    parents: [],
  };

  let openUploadWidget: () => void = () => {};

  return (
    <form className="flex flex-col gap-1" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new student" : "Update the student"}
      </h1>

      {/* --- Authentication Information --- */}
      <span className="text-xs text-gray-400 font-medium mb-3 mt-5">
        Authentication Information
      </span>

      <div className="grid grid-cols-2 gap-4">
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
        <div
          className="flex flex-col gap-1 cursor-pointer justify-center items-start  mt-4 ml-32"
          onClick={() => openUploadWidget()}
        >
          <label className="text-sm font-medium text-gray-700 cursor-pointer select-none">
            Upload a Photo
          </label>
          <div className="flex items-center gap-2">
            <Image
              src="/upload.png"
              alt="upload icon"
              width={20}
              height={20}
              className="relative top-[2px]"
            />
            {img ? (
              <Image
                src={img.secure_url}
                alt="Uploaded preview"
                width={75}
                height={60}
                className="rounded-full object-cover relative top-[2px]"
              />
            ) : (
              <span className="text-xs text-gray-500">Click to upload</span>
            )}
          </div>
        </div>
      </div>

      {/* --- Personal Information --- */}
      <span className="text-xs text-gray-400 font-medium mb-3 mt-5">
        Personal Information
      </span>

      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="First Name"
          name="name"
          defaultValue={data?.name || ""}
          register={register}
          error={errors?.name}
        />
        <InputField
          label="Last Name"
          name="surname"
          defaultValue={data?.surname || ""}
          register={register}
          error={errors?.surname}
        />
        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone || ""}
          register={register}
          error={errors?.phone}
        />
           <InputField
                    label="Blood Type"
                    name="bloodType"
                    defaultValue={data?.bloodType}
                    register={register}
                    error={errors?.bloodType}
                />
        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address || ""}
          register={register}
          error={errors?.address}
        />
        <InputField
          label="Birthday"
          name="birthday"
          type="date"
          defaultValue={
            data?.birthday ? data.birthday.toISOString().split("T")[0] : ""
          }
          register={register}
          error={errors?.birthday}
      
        />
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-400 font-medium">Gender</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gender")}
            defaultValue={data?.gender || ""}
          >
            <option value="">Select gender</option>
            <option value="FEMALE">Female</option>
            <option value="MALE">Male</option>
            <option value="OTHER">Other</option>
          </select>
          {errors.gender?.message && (
            <p className="text-xs text-red-400">
              {errors.gender.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-400 font-medium">Grade</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gradeId")}
            defaultValue={data?.gradeId || ""}
          >
            <option value="">Select grade</option>
            {grades.map((grade: { id: number; level: number }) => (
              <option value={grade.id} key={grade.id}>
                {grade.level}
              </option>
            ))}
          </select>
          {errors.gradeId?.message && (
            <p className="text-xs text-red-400">
              {errors.gradeId.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-400 font-medium">Parent</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("parentId")}
            defaultValue={data?.parentId || ""}
          >
            <option value="">Select a parent</option>
            {parents.map((parent: { id: string; name: string; surname: string }) => (
              <option value={parent.id} key={parent.id}>
                {parent.name} {parent.surname}
              </option>
            ))}
          </select>
          {errors.parentId?.message && (
            <p className="text-xs text-red-400">
              {errors.parentId.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-400 font-medium">Class</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId")}
            defaultValue={data?.classId || ""}
          >
            <option value="">Select class</option>
            {classes.map((c: any) => (
              <option key={c.id} value={c.id}>
                ({c.name} - {c._count.students}/{c.capacity} places filled)
              </option>
            ))}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">
              {errors.classId.message.toString()}
            </p>
          )}
        </div>
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

      {state.error && (
        <span className="text-red-500">
          {state.message || "Something went wrong!"}
        </span>
      )}

      <div className="flex justify-center mt-6">
        <button
        className={`bg-blue-500 text-white px-8 py-2 rounded-md text-sm w-max ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={isSubmitting}
        >
          {type === "create" ? "Create" : "Update"}
        </button>
      </div>

      <CldUploadWidget
        uploadPreset="school-mgmt"
        onSuccess={(result, { widget }) => {
          setImg(result.info);
          widget.close();
        }}
      >
        {({ open }) => {
          openUploadWidget = open;
          return <></>;
        }}
      </CldUploadWidget>
    </form>
  );
};

export default StudentForm;
