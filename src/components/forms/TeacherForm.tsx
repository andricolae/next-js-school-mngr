"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState, useRef } from "react";
import { teacherSchema, TeacherSchema } from "@/lib/formValidationSchemas";
import { createTeacher, updateTeacher } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useFormState } from "react-dom";
import { CldUploadWidget } from "next-cloudinary";
import LoadingPopup from "@/components/LoadingPopup";
import { useTransition } from "react";

interface FilterOption {
    id: string;
    name: string;
}

interface MultiSelectProps {
    id: string;
    label: string;
    options: FilterOption[];
    placeholder: string;
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
}

const MultiSelect = ({
    id,
    label,
    options,
    placeholder,
    selectedIds,
    onSelectionChange,
}: MultiSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [filteredOptions, setFilteredOptions] = useState<FilterOption[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (searchText.length > 0) {
            const filtered = options.filter(
                (option) =>
                    option.name.toLowerCase().includes(searchText.toLowerCase()) &&
                    !selectedIds.includes(option.id)
            );
            setFilteredOptions(filtered);
        } else {
            setFilteredOptions(options.filter((option) => !selectedIds.includes(option.id)));
        }
    }, [searchText, options, selectedIds]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        setIsOpen(true);
    };

    const handleOptionClick = (option: FilterOption) => {
        onSelectionChange([...selectedIds, option.id]);
        setSearchText("");
        setIsOpen(false);
    };

    const handleRemoveSelected = (idToRemove: string) => {
        onSelectionChange(selectedIds.filter((id) => id !== idToRemove));
    };

    const handleInputFocus = () => setIsOpen(true);

    const getSelectedOptions = () => options.filter((option) => selectedIds.includes(option.id));

    const handleClearAll = () => {
        onSelectionChange([]);
        setSearchText("");
        setIsOpen(false);
    };

    return (
        <div className="filter-field relative">
            <label htmlFor={id} className="text-xs text-gray-400 mb-1 block">
                {label}
            </label>


            {selectedIds.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                    {getSelectedOptions().map((option) => (
                        <span
                            key={option.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                            {option.name}
                            <button
                                type="button"
                                onClick={() => handleRemoveSelected(option.id)}
                                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                                aria-label={`Remove ${option.name}`}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    id={id}
                    value={searchText}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    placeholder={selectedIds.length > 0 ? "Add another..." : placeholder}
                    className="block w-full px-3 py-2 pr-20 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    {selectedIds.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClearAll}
                            className="text-gray-400 hover:text-gray-600 text-sm"
                            title="Clear all"
                        >
                            ⌫
                        </button>
                    )}
                    <span className="text-gray-400 select-none">▼</span>
                </div>
            </div>

            {isOpen && filteredOptions.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"
                >
                    {filteredOptions.map((option) => (
                        <div
                            key={option.id}
                            onClick={() => handleOptionClick(option)}
                            className="px-3 py-2 cursor-pointer hover:bg-blue-50 flex items-center justify-between"
                        >
                            <span>{option.name}</span>
                            <span className="text-blue-600">+</span>
                        </div>
                    ))}
                </div>
            )}

            {isOpen && filteredOptions.length === 0 && searchText && (
                <div
                    ref={dropdownRef}
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg"
                >
                    <div className="px-3 py-2 text-gray-500">No results found for </div>
                </div>
            )}
        </div>
    );
};

const TeacherForm = ({
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
        control,
        formState: { errors },
        setValue,
        watch,
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
        },
    });

    const [img, setImg] = useState<any>();
    const [state, formAction] = useFormState(
        type === "create" ? createTeacher : updateTeacher,
        { success: false, error: false }
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const subjects: FilterOption[] = relatedData?.subjects?.map((sub: any) => ({
        id: sub.id.toString(),
        name: sub.name,
    })) || [];

    const [isPending, startTransition] = useTransition();

    const selectedSubjects = watch("subjects") || [];

    useEffect(() => {
        if (state.success) {
            toast(
                `Teacher has been ${type === "create" ? "created" : "updated"} successfully!`
            );
            setOpen(false);
            router.refresh();
        }
        if (state.error) {
            const errorMessage = state.message || "Something went wrong!";
            toast.error(errorMessage);
            setIsSubmitting(false);
        }
    }, [state, router, type, setOpen]);

    const onSubmit = handleSubmit((formData) => {
        startTransition(() => {
            formAction({ ...formData, img: img?.secure_url });
            setIsSubmitting(true);
        });
    });

    let openUploadWidget: () => void = () => { };


    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Create a new teacher" : "Update the teacher"}
            </h1>

            {/* Authentication Information */}
            <span className="text-xs text-gray-400 font-medium -mb-4 mt-2">
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
                    className="flex flex-col gap-1 cursor-pointer justify-center items-start  mt-6 ml-24"
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

            {/* Personal Information */}
            <span className="text-xs text-gray-400 font-medium -mb-4 mt-2">
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
                    label="Address"
                    name="address"
                    defaultValue={data?.address}
                    register={register}
                    error={errors?.address}
                />
                <InputField
                    label="Blood Type"
                    name="bloodType"
                    defaultValue={data?.bloodType}
                    register={register}
                    error={errors?.bloodType}
                />
                <InputField
                    label="Birthday"
                    name="birthday"
                    type="date"
                    defaultValue={data?.birthday}
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

                <div className="mt-3 ">
                    {/* Subjects MultiSelect */}
                    <Controller
                        name="subjects"
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                id="subjects"
                                label="Subjects"
                                options={subjects}
                                placeholder="Select subjects..."
                                selectedIds={field.value}
                                onSelectionChange={(ids) => field.onChange(ids)}
                            />
                        )}
                    />
                </div>
            </div>

            <div className="flex justify-center mt-2">
                <button
                    type="submit"
                    className={`bg-blue-500 transition ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""} text-white px-8 py-2 rounded-md text-sm w-max`}
                    disabled={isSubmitting}
                >
                    {type === "create" ? "Create" : "Update"}
                </button>
            </div>

            {isPending && <LoadingPopup />}
            
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

export default TeacherForm;
