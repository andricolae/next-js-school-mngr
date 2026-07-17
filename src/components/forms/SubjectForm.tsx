"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchemas";
import { createSubject, updateSubject } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import ReactDOM from "react-dom";
import { CldUploadWidget } from "next-cloudinary";
import dynamic from "next/dynamic";
const LoadingPopup = dynamic(() => import("@/components/LoadingPopup"), {
  ssr: false,
});
const InputField = dynamic(() => import("@/components/InputField"), {
  ssr: false,
});

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
          !selectedIds.includes(option.id),
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(
        options.filter((option) => !selectedIds.includes(option.id)),
      );
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

  const getSelectedOptions = () =>
    options.filter((option) => selectedIds.includes(option.id));

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
          placeholder={selectedIds.length > 0 ? "Adaugă..." : placeholder}
          className="block w-full px-3 py-2 pr-20 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          readOnly={false}
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
          <div className="px-3 py-2 text-gray-500">
            Niciun rezultat gasit pentru {searchText}
          </div>
        </div>
      )}
    </div>
  );
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

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
    control,
    formState: { errors },
    setValue,
  } = useForm<SubjectSchema>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      id: data?.id,
      name: data?.name,
      teachers: data?.teachers?.map((t: any) => t.id.toString()) || [],
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createSubject : updateSubject,
    { success: false, error: false },
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "materials">(
    "details",
  );

  type PackedMaterial = { title: string; url: string; sizeBytes: number };
  type PendingMaterial = {
    tempId: string;
    title: string;
    url: string;
    sizeBytes: number;
  };
  const FIELD_SEP = "^^";
  const RECORD_SEP = "||";
  const MAX_MATERIALS = 5;

  const parseMaterials = (raw: string | null | undefined): PackedMaterial[] => {
    if (!raw) return [];
    return raw
      .split(RECORD_SEP)
      .filter(Boolean)
      .map((entry) => {
        const [title, url, sizeBytesStr] = entry.split(FIELD_SEP);
        return {
          title: title ?? "",
          url: url ?? "",
          sizeBytes: Number(sizeBytesStr) || 0,
        };
      });
  };
  const serializeMaterials = (materials: PackedMaterial[]) =>
    materials
      .map((m) => [m.title, m.url, String(m.sizeBytes)].join(FIELD_SEP))
      .join(RECORD_SEP);

  const [existingMaterials, setExistingMaterials] = useState<PackedMaterial[]>(
    parseMaterials(data?.file),
  );
  const [pendingMaterials, setPendingMaterials] = useState<PendingMaterial[]>(
    [],
  );
  const totalMaterialsCount =
    existingMaterials.length + pendingMaterials.length;

  const removeExisting = (i: number) =>
    setExistingMaterials((prev) => prev.filter((_, idx) => idx !== i));
  const removePending = (tempId: string) =>
    setPendingMaterials((prev) => prev.filter((m) => m.tempId !== tempId));
  const router = useRouter();

  const teachers: FilterOption[] =
    relatedData?.teachers?.map((teacher: any) => ({
      id: teacher.id.toString(),
      name: teacher.name + " " + teacher.surname,
    })) || [];

  const [isPending, startTransition] = useTransition();
  let openUploadWidget: () => void = () => {};

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast(
        `Materie ${type === "create" ? "creată" : "actualizată"} cu succes!`,
      );
      setOpen(false);
      startTransition(() => {
        router.refresh();
      });
    }
    if (state.error) {
      toast.error(
        state.message || "Ceva nu a funcționat. Încearcă mai târziu.",
      );
      setIsSubmitting(false);
    }
  }, [state, router, type, setOpen]);

  const onSubmit = handleSubmit((formData) => {
    const allMaterials: PackedMaterial[] = [
      ...existingMaterials,
      ...pendingMaterials.map((m) => ({
        title: m.title,
        url: m.url,
        sizeBytes: m.sizeBytes,
      })),
    ];
    const packed =
      allMaterials.length > 0 ? serializeMaterials(allMaterials) : "";
    const finalData = {
      ...formData,
      name: packed ? `${formData.name}|${packed}` : formData.name,
    };
    startTransition(() => {
      setIsSubmitting(true);
      formAction(finalData);
    });
  });

  return (
    <form
      className="flex flex-col gap-8 mx-auto w-full max-w-lg"
      onSubmit={onSubmit}
    >
      <h1 className="text-xl font-semibold text-left mb-6">
        {type === "create" ? "Adaugă o nouă materie" : "Actualizează materia"}
      </h1>

      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("details")}
          className={`px-4 py-2 text-sm ${activeTab === "details" ? "border-b-2 border-blue-500 text-blue-600 font-medium" : "text-gray-500"}`}
        >
          Detalii
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("materials")}
          className={`px-4 py-2 text-sm ${activeTab === "materials" ? "border-b-2 border-blue-500 text-blue-600 font-medium" : "text-gray-500"}`}
        >
          Materiale ({totalMaterialsCount}/{MAX_MATERIALS})
        </button>
      </div>

      <div
        className={activeTab === "details" ? "flex flex-col gap-8" : "hidden"}
      >
        <InputField
          label="Denumire materie"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />

        <Controller
          name="teachers"
          control={control}
          render={({ field }) => (
            <MultiSelect
              id="teachers"
              label="Profesori"
              options={teachers}
              placeholder="Alege profesori..."
              selectedIds={field.value}
              onSelectionChange={field.onChange}
            />
          )}
        />
        {errors.teachers && (
          <p className="text-red-500 text-sm mt-1">
            {errors.teachers.message as string}
          </p>
        )}
      </div>

      <div
        className={activeTab === "materials" ? "flex flex-col gap-3" : "hidden"}
      >
        <div
          className="flex flex-col gap-1 cursor-pointer justify-center items-start"
          onClick={() =>
            totalMaterialsCount < MAX_MATERIALS && openUploadWidget()
          }
        >
          <label className="text-sm font-medium text-gray-700 cursor-pointer select-none">
            Încarcă document (max. 10MB)
          </label>
          <div className="flex items-center gap-2">
            <img
              src="/upload.svg"
              alt="upload icon"
              width={20}
              height={20}
              className="relative top-[2px]"
            />
            <span className="text-sm text-gray-500">
              {totalMaterialsCount >= MAX_MATERIALS
                ? "Ai atins limita de 5 materiale"
                : "Click pentru a încărca"}
            </span>
          </div>
        </div>

        {existingMaterials.map((m, i) => (
          <div
            key={i}
            className="flex items-center justify-between text-xs text-gray-600 max-w-[280px]"
          >
            <span className="truncate">{m.title}</span>
            <button
              type="button"
              onClick={() => removeExisting(i)}
              className="text-red-500 ml-2"
              aria-label="Elimină documentul"
            >
              ✕
            </button>
          </div>
        ))}
        {pendingMaterials.map((m) => (
          <div
            key={m.tempId}
            className="flex items-center justify-between text-xs text-blue-600 max-w-[280px]"
          >
            <span className="truncate">{m.title} (nou)</span>
            <button
              type="button"
              onClick={() => removePending(m.tempId)}
              className="text-red-500 ml-2"
              aria-label="Elimină documentul"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <CldUploadWidget
        uploadPreset="school-mgmt" ///ml_default ; trebuie sa se schimbe o setare in cloudinary pentru a permite preview-ul pdf-urilor, momentan nu se poate face preview la pdf-uri
        options={{
          resourceType: "image",
          multiple: false,
          maxFiles: 1,
          maxFileSize: MAX_FILE_SIZE,
          clientAllowedFormats: ["pdf"],
        }}
        onSuccess={(result) => {
          const info = result.info as any;
          if (totalMaterialsCount >= MAX_MATERIALS) {
            toast.error(`Poți avea maxim ${MAX_MATERIALS} materiale!`);
            return;
          }
          setPendingMaterials((prev) => [
            ...prev,
            {
              tempId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
              title: info.original_filename || "Document",
              url: info.secure_url,
              sizeBytes: info.bytes ?? 0,
            },
          ]);
        }}
      >
        {({ open }) => {
          openUploadWidget = open;
          return <></>;
        }}
      </CldUploadWidget>

      {state.error && (
        <span className="text-red-500 text-center">
          {state.message || "Ceva nu a funcționat. Încearcă mai târziu."}
        </span>
      )}

      <div className="flex justify-center mt-2 mb-8">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`bg-blue-500 text-white px-8 py-2 rounded-md text-sm w-max ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {type === "create" ? "Adaugă" : "Actualizează"} materia
        </button>
      </div>
      {isPending &&
        typeof window !== "undefined" &&
        ReactDOM.createPortal(
          <LoadingPopup />,
          document.getElementById("global-loading-root")!,
        )}
    </form>
  );
};

export default SubjectForm;
