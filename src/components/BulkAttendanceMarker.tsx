"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";

type Student = {
    id: string;
    name: string;
    surname: string;
    username: string;
};

type Lesson = {
    id: number;
    name: string;
    subject: { name: string };
    class: { name: string; id: number };
};

const BulkAttendanceMarker = ({ 
    lessons, 
    onClose 
}: { 
    lessons: Lesson[]; 
    onClose: () => void;
}) => {
    const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({});
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (selectedLesson) {
            fetchClassStudents(selectedLesson);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLesson]);

    const fetchClassStudents = async (lessonId: number) => {
        try {
            const lesson = lessons.find(l => l.id === lessonId);
            if (!lesson) return;

            const response = await fetch(`/api/students/by-class/${lesson.class.id}`);
            const studentsData = await response.json();
            setStudents(studentsData);
            
            const initialAttendance: Record<string, boolean> = {};
            studentsData.forEach((student: Student) => {
                initialAttendance[student.id] = true;
            });
            setAttendanceData(initialAttendance);
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Failed to fetch students');
        }
    };

    const toggleAttendance = (studentId: string) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: !prev[studentId]
        }));
    };

    const markAllPresent = () => {
        const allPresent: Record<string, boolean> = {};
        students.forEach(student => {
            allPresent[student.id] = true;
        });
        setAttendanceData(allPresent);
    };

    const markAllAbsent = () => {
        const allAbsent: Record<string, boolean> = {};
        students.forEach(student => {
            allAbsent[student.id] = false;
        });
        setAttendanceData(allAbsent);
    };

    const submitAttendance = async () => {
        if (!selectedLesson || students.length === 0) return;

        setLoading(true);
        try {
            const attendanceRecords = students.map(student => ({
                date: new Date(selectedDate),
                present: attendanceData[student.id],
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
                toast.success('Attendance marked successfully!');
                onClose();
                router.refresh();
            } else {
                throw new Error('Failed to submit attendance');
            }
        } catch (error) {
            console.error('Error submitting attendance:', error);
            toast.error('Failed to submit attendance');
        } finally {
            setLoading(false);
        }
    };

    const presentCount = Object.values(attendanceData).filter(Boolean).length;
    const absentCount = students.length - presentCount;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Mark Class Attendance</h1>
                <button 
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full"
                >
                    <Image src="/close.png" alt="Close" width={16} height={16} />
                </button>
            </div>

            <div className="flex gap-4 flex-wrap">
                <div className="flex flex-col gap-2 min-w-[200px]">
                    <label className="text-xs text-gray-400">Select Lesson</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                        value={selectedLesson || ""}
                        onChange={(e) => setSelectedLesson(Number(e.target.value))}
                    >
                        <option value="">Choose a lesson</option>
                        {lessons.map((lesson) => (
                            <option key={lesson.id} value={lesson.id}>
                                {lesson.subject.name} - {lesson.class.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-400">Date</label>
                    <input
                        type="date"
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                </div>
            </div>

            {students.length > 0 && (
                <>
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            <span className="text-green-600 font-medium">{presentCount} Present</span>
                            {" • "}
                            <span className="text-red-600 font-medium">{absentCount} Absent</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={markAllPresent}
                                className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200"
                            >
                                Mark All Present
                            </button>
                            <button
                                onClick={markAllAbsent}
                                className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
                            >
                                Mark All Absent
                            </button>
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto border rounded-lg">
                        <div className="grid gap-2 p-4">
                            {students.map((student) => (
                                <div
                                    key={student.id}
                                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                                        attendanceData[student.id]
                                            ? "bg-green-50 border-green-200"
                                            : "bg-red-50 border-red-200"
                                    }`}
                                    onClick={() => toggleAttendance(student.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                            attendanceData[student.id]
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
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        attendanceData[student.id]
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                    }`}>
                                        {attendanceData[student.id] ? "Present" : "Absent"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={submitAttendance}
                        disabled={loading || !selectedLesson}
                        className="bg-blue-500 text-white py-3 px-6 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
                    >
                        {loading ? "Submitting..." : "Submit Attendance"}
                    </button>
                </>
            )}
        </div>
    );
};

export default BulkAttendanceMarker;