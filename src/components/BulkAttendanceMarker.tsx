"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useTransition } from "react";
import dynamic from "next/dynamic";
import ReactDOM from "react-dom";
const LoadingPopup = dynamic(() => import("@/components/LoadingPopup"), { ssr: false });

type Student = {
    id: string;
    name: string;
    surname: string;
    username: string;
};

type Lesson = {
    id: number;
    name: string;
    startTime: Date,
    subject: { name: string };
    class: { name: string; id: number };
};

type AttendanceStatus = {
    present: boolean;
    excused: boolean;
};

const BulkAttendanceMarker = ({
    lessons,
    onClose
}: {
    lessons: Lesson[];
    onClose: () => void;
}) => {
    const [filteredLessons, setFilteredLessons] = useState<Lesson[]>(lessons.filter(lesson => lesson.startTime.toDateString() === new Date().toDateString()));
    const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceStatus>>({});
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (selectedLesson) {
            fetchClassStudents(selectedLesson);
        }
    }, [selectedLesson]);

    const fetchClassStudents = async (lessonId: number) => {
        try {
            startTransition(async () => {
                const lesson = lessons.find(l => l.id === lessonId);
                if (!lesson) return;

                const response = await fetch(`/api/students/by-class/${lesson.class.id}`);
                const studentsData = await response.json();
                setStudents(studentsData);

                const initialAttendance: Record<string, AttendanceStatus> = {};
                studentsData.forEach((student: Student) => {
                    initialAttendance[student.id] = { present: true, excused: true };
                });
                setAttendanceData(initialAttendance);
            });
        } catch (error) {
            console.error('A apărut o eroare în preluarea datelor despre elevi!', error);
            toast.error('A apărut o eroare în preluarea datelor despre elevi!');
        }
    };

    const toggleAttendance = (studentId: string) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                present: !prev[studentId]?.present,
                excused: true
            }
        }));
    };

    const markAllPresent = () => {
        const allPresent: Record<string, AttendanceStatus> = {};
        students.forEach(student => {
            allPresent[student.id] = { present: true, excused: true };
        });
        setAttendanceData(allPresent);
    };

    const markAllAbsent = () => {
        const allAbsent: Record<string, AttendanceStatus> = {};
        students.forEach(student => {
            allAbsent[student.id] = { present: false, excused: false };
        });
        setAttendanceData(allAbsent);
    };

    const submitAttendance = async () => {

        if (!selectedLesson || students.length === 0) return;

        setLoading(true);
        try {
            const attendanceRecords = students.map(student => ({
                date: new Date(selectedDate),
                present: attendanceData[student.id]?.present ?? false,
                excused: attendanceData[student.id]?.excused ?? false,
                studentId: student.id,
                lessonId: selectedLesson
            }));

            const response = await fetch('/api/attendance/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ attendanceRecords }),
            });

            if (response.ok) {
                toast.success('Statusul prezenței a fost marcat cu succes!');
                onClose();
                startTransition(() => {
                    router.refresh();
                });
            } else {
                throw new Error('A apărut o eroare la trimiterea prezenței!');
            }
        } catch (error) {
            console.error('A apărut o eroare la trimiterea prezenței!', error);
            toast.error('A apărut o eroare la trimiterea prezenței');
        } finally {
            setLoading(false);
        }
    };

    const presentCount = Object.values(attendanceData).filter(s => s.present).length;
    const absentCount = students.length - presentCount;

    const markExcused = (studentId: string) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                excused: !prev[studentId]?.excused
            }
        }));
    };

    const updateFilteredLessons = (dateToFilter: string) => {
        setFilteredLessons(lessons.filter(lesson => lesson.startTime.toDateString() === new Date(dateToFilter).toDateString()));
        setStudents([]);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Marchează prezența pentru o clasă</h1>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full"
                >
                    <img src="/close.svg" alt="Close" width={16} height={16} />
                </button>
            </div>

            <div className="flex gap-4 flex-wrap">
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-400">Data</label>
                    <input
                        type="date"
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                        value={selectedDate}
                        onChange={(e) => {
                            setSelectedDate(e.target.value);
                            updateFilteredLessons(e.target.value);
                            setSelectedLesson(null);
                        }}
                    />
                </div>
                <div className="flex flex-col gap-2 min-w-[200px]">
                    <label className="text-xs text-gray-400">Selectează ora</label>
                    <select
                        name="oraSelectata"
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                        value={selectedLesson || ""}
                        onChange={(e) => setSelectedLesson(Number(e.target.value))}
                    >
                        <option value="">Alege o oră</option>
                        {filteredLessons?.map((lesson) => (
                            <option key={lesson.id} value={lesson.id}>
                                {lesson.name} - {lesson.class.name} ({new Date(lesson.startTime).toLocaleDateString("ro-RO")})
                            </option>
                        ))}
                    </select>
                    {isPending &&
                        typeof window !== "undefined" &&
                        ReactDOM.createPortal(<LoadingPopup />, document.getElementById("global-loading-root")!)
                    }
                </div>
            </div>

            {students.length > 0 && (
                <>
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            <span className="text-green-600 font-medium">{presentCount} Prezenți</span>
                            {" • "}
                            <span className="text-red-600 font-medium">{absentCount} Absenți</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { markAllPresent() }}
                                className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200"
                            >
                                Marchează toți elevii „Prezent”
                            </button>
                            <button
                                onClick={() => { markAllAbsent() }}
                                className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
                            >
                                Marchează toți elevii „Absent”
                            </button>
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto border rounded-lg">
                        <div className="grid gap-2 p-4">
                            {students.map((student) => (
                                <div
                                    key={student.id}
                                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${attendanceData[student.id].present
                                        ? "bg-green-50 border-green-200"
                                        : "bg-red-50 border-red-200"
                                        }`}
                                >
                                    <div className="flex items-center gap-3" onClick={() => toggleAttendance(student.id)}>
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${attendanceData[student.id].present
                                            ? "bg-green-500 border-green-500"
                                            : "border-red-300"
                                            }`}>
                                            {attendanceData[student.id] && (
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">
                                                {student.name} {student.surname}
                                            </p>
                                            <p className="text-xs text-gray-500">{student.username}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <button className={`px-2 py-1 rounded text-xs font-medium mr-5 ${attendanceData[student.id].present
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                            }`} onClick={() => toggleAttendance(student.id)}>
                                            {attendanceData[student.id]?.present ? "Present" : "Absent"}
                                        </button>
                                        <button className={`px-2 py-1 rounded text-xs font-medium ${attendanceData[student.id].excused
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                            }`} onClick={() => { markExcused(student.id) }}
                                            disabled={attendanceData[student.id].present}
                                        >
                                            {attendanceData[student.id]?.excused ? "Motivat" : "Nemotivat"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={submitAttendance}
                        disabled={loading || !selectedLesson}
                        className="bg-blue-500 text-white py-3 px-6 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
                    >
                        {loading ? "Se marchează..." : "Marchează prezența"}
                    </button>
                </>
            )}
        </div>
    );
};

export default BulkAttendanceMarker;