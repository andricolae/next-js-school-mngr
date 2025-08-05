import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { TokenData } from "@/lib/utils";

export async function GET(
    request: NextRequest,
    { params }: { params: { classId: string } }
) {
    try {
        const { userId, sessionClaims } = await auth();
        let tokenData;
        if (sessionClaims !== null) {
            tokenData = sessionClaims as unknown as TokenData;
        }
        let role = tokenData?.userPblcMtdt?.role;

        if (!userId || (role !== "admin" && role !== "teacher")) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const classId = parseInt(params.classId);

        if (role === "teacher") {
            const teacherClass = await prisma.class.findFirst({
                where: {
                    id: classId,
                    lessons: {
                        some: {
                            teacherId: userId
                        }
                    }
                }
            });

            if (!teacherClass) {
                return NextResponse.json(
                    { error: "Access denied to this class" },
                    { status: 403 }
                );
            }
        }

        const students = await prisma.student.findMany({
            where: {
                classId: classId
            },
            select: {
                id: true,
                name: true,
                surname: true,
                username: true
            },
            orderBy: [
                { surname: "asc" },
                { name: "asc" }
            ]
        });

        return NextResponse.json(students);

    } catch (error) {
        console.error("Error fetching students:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}