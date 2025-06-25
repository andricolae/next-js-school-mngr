import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { userId, sessionClaims } = auth();
        const role = (sessionClaims?.metadata as { role?: string })?.role;

        if (!userId || (role !== "admin" && role !== "teacher")) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { attendanceRecords } = body;

        if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
            return NextResponse.json(
                { error: "Invalid attendance records" },
                { status: 400 }
            );
        }

        const firstRecord = attendanceRecords[0];
        const lesson = await prisma.lesson.findUnique({
            where: { id: firstRecord.lessonId },
            include: { class: true }
        });

        if (!lesson) {
            return NextResponse.json(
                { error: "Lesson not found" },
                { status: 404 }
            );
        }

        if (role === "teacher" && lesson.teacherId !== userId) {
            return NextResponse.json(
                { error: "Access denied to this lesson" },
                { status: 403 }
            );
        }

        const existingRecords = await prisma.attendance.findMany({
            where: {
                lessonId: firstRecord.lessonId,
                date: {
                    gte: new Date(new Date(firstRecord.date).setHours(0, 0, 0, 0)),
                    lte: new Date(new Date(firstRecord.date).setHours(23, 59, 59, 999))
                }
            }
        });

        if (existingRecords.length > 0) {
            await prisma.attendance.deleteMany({
                where: {
                    lessonId: firstRecord.lessonId,
                    date: {
                        gte: new Date(new Date(firstRecord.date).setHours(0, 0, 0, 0)),
                        lte: new Date(new Date(firstRecord.date).setHours(23, 59, 59, 999))
                    }
                }
            });
        }

        const formattedRecords = attendanceRecords.map(record => ({
            date: new Date(record.date),
            present: Boolean(record.present),
            studentId: record.studentId,
            lessonId: record.lessonId
        }));

        await prisma.attendance.createMany({
            data: formattedRecords
        });

        return NextResponse.json({ 
            message: "Attendance recorded successfully",
            recordsCreated: formattedRecords.length 
        });

    } catch (error) {
        console.error("Error creating bulk attendance:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}