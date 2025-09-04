import Announcements from '@/components/Announcements'
import BigCalendarContainer from '@/components/BigCalendarContainer'
import FormContainer from '@/components/FormContainer'
import StudentAttendanceCard from '@/components/StudentAttendanceCard'
import prisma from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { Class, Prisma, Student } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { TokenData } from "@/lib/utils";
import FormModal from '@/components/FormModal'

const SingleStudentPage = async ({
    params: { id },
}: {
    params: { id: string };
}) => {

    const { sessionClaims } = await auth();
    let tokenData;
    if (sessionClaims !== null) {
        tokenData = sessionClaims as unknown as TokenData;
    }
    let role = tokenData?.userPblcMtdt?.role;

    const student: | (Student & {
        class: (Class & { _count: { lessons: number } })
    }) | null = await prisma.student.findUnique({
        where: { id },
        include: {
            class: { include: { _count: { select: { lessons: true } } } }
        }
    });

    if (!student) {
        return notFound();
    }

    const resultQuery = Prisma.validator<Prisma.ResultDefaultArgs>()({
        include: {
            exam: {
                include: {
                    lesson: {
                        include: {
                            subject: true,
                        },
                    },
                },
            },
            assignment: {
                include: {
                    lesson: {
                        include: {
                            subject: true,
                        },
                    },
                },
            },
        },
    });

    type ResultWithAllRelations = Prisma.ResultGetPayload<typeof resultQuery>;

    const results: ResultWithAllRelations[] = await prisma.result.findMany({
        where: { studentId: id },
        include: resultQuery.include,
    });

    return (
        <div className='flex-1 p-4 flex flex-col gap-4 xl:flex-row'>
            <div className="w-full xl:w-2/3">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="bg-sky py-6 px-4 rounded-md flex-1 flex gap-4">
                        <div className="w-1/3">
                            <Image
                                src={student.img || "/noAvatar.png"}
                                alt=""
                                width={144}
                                height={144}
                                className="w-36 h-36 rounded-full object-cover"
                            />
                        </div>
                        <div className="w-2/3 flex flex-col gap-6 p-6 bg-white rounded-lg shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between gap-4">
                                <h1 className="text-2xl font-bold text-gray-800">{student.name + " " + student.surname}</h1>
                                {role === "admin" && (
                                    <div className="[&>button]:bg-gray-700 [&>button]:text-white [&>button]:px-4 [&>button]:py-2 [&>button]:rounded-md [&>button]:hover:bg-gray-800 [&>button]:transition-colors">
                                        <FormContainer table="student" type="update" data={student} />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col items-start gap-2 text-sm font-medium text-gray-600">
                                <div className="flex items-center gap-3 w-full rounded-md hover:bg-gray-50 transition-colors">
                                    <Image src="/date.png" alt="Date of birth" width={16} height={16} />
                                    <span>{new Intl.DateTimeFormat("ro-RO").format(student.birthday)}</span>
                                </div>
                                <div className="flex items-center gap-3 w-full rounded-md hover:bg-gray-50 transition-colors">
                                    <Image src="/mail.png" alt="Email" width={16} height={16} />
                                    <span>{student.email || "-"}</span>
                                </div>
                                <div className="flex items-center gap-3 w-full rounded-md hover:bg-gray-50 transition-colors">
                                    <Image src="/phone.png" alt="Phone" width={16} height={16} />
                                    <span>{student.phone || "-"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex gap-4 justify-between flex-wrap">
                        <div className='bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]'>
                            <Image src='/singleAttendance.png' alt='' width={24} height={24} className='w-6 h-6' />
                            <Suspense fallback="loading...">
                                <StudentAttendanceCard id={student.id} />
                            </Suspense>
                        </div>
                        <div className='bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]'>
                            <Image src='/singleBranch.png' alt='' width={24} height={24} className='w-6 h-6' />
                            <div className=''>
                                <h1 className='text-xl font-semibold'>a {student.class.name.charAt(0)}-a</h1>
                                <span className='text-sm text-gray-400'>Nivelul</span>
                            </div>
                        </div>
                        <div className='bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]'>
                            <Image src='/singleLesson.png' alt='' width={24} height={24} className='w-6 h-6' />
                            <div className=''>
                                <h1 className='text-xl font-semibold'>{student.class._count.lessons}</h1>
                                <span className='text-sm text-gray-400'>Ore</span>
                            </div>
                        </div>
                        <div className='bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]'>
                            <Image src='/singleClass.png' alt='' width={24} height={24} className='w-6 h-6' />
                            <div className=''>
                                <h1 className='text-xl font-semibold'>{student.class.name}</h1>
                                <span className='text-sm text-gray-400'>Clasa</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 bg-white rounded-md p-4 h-[535px]">
                    <h1>Orarul elevului</h1>
                    <BigCalendarContainer type="classId" id={student.class.id} />
                </div>
            </div>

            <div className="w-full xl:w-1/3 flex flex-col gap-4">
                <div className='bg-white p-4 rounded-md'>
                    <h1 className='text-xl font-semibold'>Acces rapid</h1>
                    <div className='mt-4 flex gap-4 flex-wrap text-xs text-gray-500'>
                        <Link className='p-3 rounded-md bg-skyLight' href={`/list/lessons?classId=${2}`}>Orele elevului</Link>
                        <Link className='p-3 rounded-md bg-orangeLight' href={`/list/teachers?classId=${2}`}>Profesorii elevului</Link>
                        <Link className='p-3 rounded-md bg-yellowLight' href={`/list/results?studentId=${"student2"}`}>Rezultatele elevului</Link>
                        <Link className='p-3 rounded-md bg-green-300' href={`/list/exams?classId=${2}`}>Testele elevului</Link>
                        <Link className='p-3 rounded-md bg-purple-200' href={`/list/assignments?classId=${2}`}>Temele elevului</Link>
                        {(role === "admin" || role === "teacher") && (
                            <>
                                <div className=''><FormModal table="adeverinta" type="create" title="Adeverință elev" student={student} /></div>
                                <div className=''><FormModal table="matricola" type="create" title="Foaie matricolă" student={student} results={results} /></div>
                                <div className=''><FormModal table="absente" type="create" title="Raport absențe" student={student} results={results} /></div>
                            </>
                        )}
                    </div>
                </div>
                {/* <Performance /> */}
                <Announcements />
            </div>
        </div>
    )
}

export default SingleStudentPage