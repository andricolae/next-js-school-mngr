"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { assignmentSchema, AssignmentSchema } from "@/lib/formValidationSchemas";
import { createAssignment, updateAssignment } from "@/lib/actions";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { generateTranscriptPDF } from "@/components/FoaieMatricola";
import { FilterOption, MultiSelect } from "@/components/forms/FilterForm";

type ResultItem = {
    score: number;
    exam: {
        lesson: {
            subject: {
                id: number;
                name: string;
            };
        };
        startTime: Date;
    } | null;
    assignment: {
        lesson: {
            subject: {
                id: number;
                name: string;
            };
        };
        startDate: Date;
    } | null;
};

const AdeverintaElevForm = ({
    type,
    data,
    setOpen,
    relatedData,
    student,
    results,
}: {
    type: "create" | "update";
    data?: any;
    setOpen: Dispatch<SetStateAction<boolean>>;
    relatedData?: any;
    student: any;
    results: any;
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AssignmentSchema>({
        resolver: zodResolver(assignmentSchema),
    });

    const [state, formAction] = useFormState(type === "create"
        ? createAssignment : updateAssignment, { success: false, error: false });

    const [allSubjectAverages, setAllSubjectsAverages] = useState<[string, number][]>();
    const [allSubjects, setAllSubjects] = useState<FilterOption[]>([]);
    const [subjectFilters, setSubjectFilters] = useState<string[]>([]);


    function filterAndGroupBySubjectAverage(
        results: ResultItem[],
        filters?: {
            subjectNames?: string[];
            fromDate?: Date;
            toDate?: Date;
        }
    ): [string, number][] {
        const subjectScores: Record<string, number[]> = {};

        results.forEach((result) => {
            const source = result.exam ?? result.assignment;
            const lesson = source?.lesson;
            const subject = lesson?.subject;
            const date = result.exam?.startTime ?? result.assignment?.startDate;

            if (!subject || !date) return;

            if (filters?.subjectNames && !filters.subjectNames.includes(subject.name)) return;

            if (filters?.fromDate && date < filters.fromDate) return;
            if (filters?.toDate && date > filters.toDate) return;

            const subjectName = subject.name;
            if (!subjectScores[subjectName]) {
                subjectScores[subjectName] = [];
            }
            subjectScores[subjectName].push(result.score);
        });

        const resultArray: [string, number][] = Object.entries(subjectScores).map(
            ([subjectName, scores]) => {
                const average =
                    scores.reduce((sum, score) => sum + score, 0) / scores.length;
                return [subjectName, Math.round(average * 100) / 100];
            }
        );

        let x: FilterOption[] = [];
        for (let i = 0; i < resultArray.length; ++i) {
            x.push({ id: `${i + 1}`, name: resultArray[i][0] });
        }
        setAllSubjects(x);

        return resultArray;
    }

    const onSubmit = (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const startDate = formData.get("startDate") as string;
        const endDate = formData.get("endDate") as string;

        let aux: any = [];
        for (let i = 0; i < subjectFilters.length; ++i) {
            for (let j = 0; j < allSubjects.length; ++j) {
                if (subjectFilters[i] === allSubjects[j].id) {
                    aux[i] = allSubjects[j].name;
                }
            }
        }

        let materiiSiNote: any;

        if ((startDate !== "" && endDate !== "") || subjectFilters.length !== 0) {
            materiiSiNote = filterAndGroupBySubjectAverage(results, {
                subjectNames: aux,
                fromDate: new Date(startDate),
                toDate: new Date(endDate),
            });
        }

        generateTranscriptPDF("10101010", `${student.surname} ${student.name}`, "cnp 5010526388915",
            `loc nastere damaroaia ${new Date(student.birthday).toLocaleDateString('en-GB').replace(/\//g, '.')}`,
            "nationalitate ungur", "numeTata Ion", "numeMame Ioana", "domiciliuParinti Ungaria", `${student.address}`, materiiSiNote);
    };

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            toast(`Assignment has been ${type === "create" ? "created" : "updated"} successfully!`);
            setOpen(false);
            router.refresh();
        }

        if (state.error) {
            const errorMessage = state.message || "Something went wrong!";
        }
    }, [state, router, type, setOpen]);

    useEffect(() => {
        setAllSubjectsAverages(filterAndGroupBySubjectAverage(results));
    }, []);

    return (
        <form className="flex flex-col gap-8 items-center" onSubmit={onSubmit}>
            <div className="flex flex-col gap-4 w-full">
                <h1 className="text-cl font-semibold">{type === "create" ? "Create a new assignment" : "Update the assignment"}</h1>
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-400">Start Date</label>
                    <input
                        type="date"
                        name="startDate"
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        defaultValue="undefined"
                    />
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-400">End Date</label>
                    <input
                        type="date"
                        name="endDate"
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        defaultValue="undefined"
                    />
                </div>
                <MultiSelect id="foaieMatricola" label="Subjects" options={allSubjects} placeholder="Add another..."
                    selectedIds={subjectFilters} onSelectionChange={setSubjectFilters} />
            </div>
            <button type="submit" className="bg-blue-500 text-white p-2 rounded-md w-fit">{type === "create" ? "Create" : "Update"}</button>
        </form>
    )
};

export default AdeverintaElevForm;
