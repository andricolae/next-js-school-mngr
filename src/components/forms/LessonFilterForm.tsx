// components/forms/LessonFilterForm.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ModuleType } from "@/lib/modules"; // Asigură-te că acest import este corect și că fișierul lib/modules.ts există

interface FilterOption {
    id: string;
    name: string;
}

interface LessonFilterFormProps {
    currentFilters: { [key: string]: string | undefined };
    subjects: FilterOption[];
    classes: FilterOption[];
    teachers: FilterOption[];
    modules: ModuleType[]; // <--- Props-ul nou pentru module
}

interface MultiSelectProps {
    id: string;
    label: string;
    options: FilterOption[];
    placeholder: string;
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
    id,
    label,
    options,
    placeholder,
    selectedIds,
    onSelectionChange,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [filteredOptions, setFilteredOptions] = useState<FilterOption[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (searchText.length > 0) {
            const filtered = options.filter(option =>
                option.name.toLowerCase().includes(searchText.toLowerCase()) &&
                !selectedIds.includes(option.id)
            );
            setFilteredOptions(filtered);
        } else {
            setFilteredOptions(options.filter(option => !selectedIds.includes(option.id)));
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
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        setIsOpen(true);
    };

    const handleOptionClick = (option: FilterOption) => {
        const newSelection = [...selectedIds, option.id];
        onSelectionChange(newSelection);
        setSearchText("");
        setIsOpen(false);
    };

    const handleRemoveSelected = (idToRemove: string) => {
        const newSelection = selectedIds.filter(id => id !== idToRemove);
        onSelectionChange(newSelection);
    };

    const handleInputFocus = () => {
        setIsOpen(true);
    };

    const getSelectedOptions = () => {
        return options.filter(option => selectedIds.includes(option.id));
    };

    const handleClearAll = () => {
        onSelectionChange([]);
        setSearchText("");
        setIsOpen(false);
    };

    return (
        <div className="filter-field relative">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
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
                    <span className="text-gray-400">▼</span>
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
                        No results found for "{searchText}"
                    </div>
                </div>
            )}
        </div>
    );
};

const LessonFilterForm: React.FC<LessonFilterFormProps> = ({
    currentFilters,
    subjects,
    classes,
    teachers,
    modules, // <--- Destructurează props-ul modules
}) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [isOpen, setIsOpen] = useState(false);

    const [subjectFilters, setSubjectFilters] = useState<string[]>([]);
    const [teacherFilters, setTeacherFilters] = useState<string[]>([]);
    const [classFilters, setClassFilters] = useState<string[]>([]);
    const [moduleFilter, setModuleFilter] = useState<string>(""); // <--- Stare nouă pentru modul

    useEffect(() => {
        setSubjectFilters(currentFilters.subjectId ? currentFilters.subjectId.split(',') : []);
        setTeacherFilters(currentFilters.teacherId ? currentFilters.teacherId.split(',') : []);
        setClassFilters(currentFilters.classId ? currentFilters.classId.split(',') : []);
        setModuleFilter(currentFilters.moduleId || ""); // <--- Inițializează starea modulului
    }, [currentFilters]);

    // Funcție helper pentru a seta un singur filtru (folosită pentru modul)
    const handleSingleFilterChange = (key: string, value: string) => {
        if (key === "moduleId") {
            setModuleFilter(value);
        }
        // Poți extinde dacă ai și alte filtre single-select
    };

    const handleApplyFilters = () => {
        const newSearchParams = new URLSearchParams();
        
        // Păstrează parametrii 'search' și 'sort' existenți
        const existingSearchParam = searchParams.get("search");
        if (existingSearchParam) {
            newSearchParams.set("search", existingSearchParam);
        }

        const existingSortParam = searchParams.get("sort");
        if (existingSortParam) {
            newSearchParams.set("sort", existingSortParam);
        }

        if (subjectFilters.length > 0) newSearchParams.set("subjectId", subjectFilters.join(','));
        if (teacherFilters.length > 0) newSearchParams.set("teacherId", teacherFilters.join(','));
        if (classFilters.length > 0) newSearchParams.set("classId", classFilters.join(','));
        if (moduleFilter) newSearchParams.set("moduleId", moduleFilter); // <--- Adaugă filtrul de modul

        newSearchParams.set("page", "1"); // Resetează pagina la aplicarea filtrelor

        router.push(`?${newSearchParams.toString()}`);
        setIsOpen(false);
    };

    const handleClearFilters = () => {
        const newSearchParams = new URLSearchParams();
        
        // Păstrează parametrii 'search' și 'sort' existenți
        const existingSearchParam = searchParams.get("search");
        if (existingSearchParam) {
            newSearchParams.set("search", existingSearchParam);
        }
        
        const existingSortParam = searchParams.get("sort");
        if (existingSortParam) {
            newSearchParams.set("sort", existingSortParam);
        }
        
        router.push(`${window.location.pathname}?${newSearchParams.toString()}`);

        setSubjectFilters([]);
        setTeacherFilters([]);
        setClassFilters([]);
        setModuleFilter(""); // <--- Resetează filtrul de modul
        setIsOpen(false);
    };

    const activeFiltersCount = 
        subjectFilters.length +
        teacherFilters.length +
        classFilters.length +
        (moduleFilter ? 1 : 0); // <--- Include filtrul de modul în count

    return (
        <>
            <button
                className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow relative"
                onClick={() => setIsOpen(true)}
            >
                <Image src="/filter.png" alt="Filter" width={14} height={14} />
                {activeFiltersCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {activeFiltersCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="filter-modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="filter-modal-content bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl mx-auto relative max-h-[90vh] overflow-y-auto">
                        <div className="filter-modal-header flex justify-between items-center border-b pb-3 mb-4">
                            <h2 className="text-xl font-semibold">
                                Filter Lessons
                                {activeFiltersCount > 0 && (
                                    <span className="ml-2 text-sm text-gray-500">
                                        ({activeFiltersCount} active {activeFiltersCount === 1 ? 'filter' : 'filters'})
                                    </span>
                                )}
                            </h2>
                            <button
                                className="filter-modal-close-button text-gray-500 hover:text-gray-700"
                                onClick={() => setIsOpen(false)}
                            >
                                <Image src="/close.png" alt="Close" width={16} height={16} />
                            </button>
                        </div>

                        <p className="text-gray-600 mb-4">
                            You can select multiple options for each filter. Filters will be applied cumulatively.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <MultiSelect
                                id="subjects"
                                label="Subjects"
                                options={subjects}
                                placeholder="Select subjects..."
                                selectedIds={subjectFilters}
                                onSelectionChange={setSubjectFilters}
                            />

                            <MultiSelect
                                id="teachers"
                                label="Teachers"
                                options={teachers}
                                placeholder="Search teachers..."
                                selectedIds={teacherFilters}
                                onSelectionChange={setTeacherFilters}
                            />

                            <MultiSelect
                                id="classes"
                                label="Classes"
                                options={classes}
                                placeholder="Select classes..."
                                selectedIds={classFilters}
                                onSelectionChange={setClassFilters}
                            />

                            {/* NOU: Filtru pentru Modul */}
                            <div className="filter-field">
                                <label htmlFor="moduleId" className="block text-sm font-medium text-gray-700 mb-1">
                                    Module
                                </label>
                                <select
                                    id="moduleId"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={moduleFilter} // Folosește valoarea din stare
                                    onChange={(e) => handleSingleFilterChange("moduleId", e.target.value)} // Folosește funcția nouă
                                >
                                    <option value="">All Modules</option>
                                    {modules.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.name} ({m.startDate} - {m.endDate})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* END NOU: Filtru pentru Modul */}
                        </div>

                        <div className="filter-modal-footer flex justify-end gap-2 pt-4 border-t mt-4">
                            <button
                                className="filter-button-clear px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                                onClick={handleClearFilters}
                            >
                                Clear All Filters
                            </button>
                            <button
                                className="filter-button-apply px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
                                onClick={handleApplyFilters}
                            >
                                Apply Filters ({activeFiltersCount})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LessonFilterForm;