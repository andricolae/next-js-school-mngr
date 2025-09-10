import Announcements from '@/components/Announcements'
import BigCalendarContainer from '@/components/BigCalendarContainer'
import FormContainer from '@/components/FormContainer'
import prisma from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { Teacher } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TokenData } from "@/lib/utils";

const SingleTeacherPage = async ({
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

    const teacher: (Teacher & { _count: { subjects: number; lessons: number; classes: number } }) | null = await prisma.teacher.findUnique({
        where: { id },
        include: {
            subjects: true,
            _count: {
                select: {
                    subjects: true,
                    lessons: true,
                    classes: true,
                }
            }
        }
    });

    if (!teacher) {
        return notFound();
    }

    return (
        <div className='flex-1 p-4 flex flex-col gap-4 xl:flex-row'>
            <div className="w-full xl:w-2/3">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="bg-sky py-6 px-4 rounded-md flex-1 flex gap-4">
                        <div className="w-1/3">
                            <Image
                                src={teacher.img || "/noAvatar.png"}
                                alt=""
                                width={152}
                                height={144}
                                className="w-36 h-36 rounded-full object-cover"
                            />
                        </div>

                        <div className="w-2/3 flex flex-col gap-6 p-6 bg-white rounded-lg shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between gap-4">
                                <h1 className="text-2xl font-bold text-gray-800">{teacher.name + " " + teacher.surname}</h1>
                                {role === "admin" && (
                                    <div className="[&>button]:bg-gray-700 [&>button]:text-white [&>button]:px-4 [&>button]:py-2 [&>button]:rounded-md [&>button]:hover:bg-gray-800 [&>button]:transition-colors">
                                        <FormContainer table="teacher" type="update" data={teacher} />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col items-start gap-2 text-sm font-medium text-gray-600">
                                <div className="flex items-center gap-3 w-full rounded-md hover:bg-gray-50 transition-colors">
                                    <Image src="/date.png" alt="Date of birth" width={16} height={16} />
                                    <span>{new Intl.DateTimeFormat("ro-RO").format(teacher.birthday)}</span>
                                </div>
                                <div className="flex items-center gap-3 w-full rounded-md hover:bg-gray-50 transition-colors">
                                    <Image src="/mail.png" alt="Email" width={16} height={16} />
                                    <span>{teacher.email || "-"}</span>
                                </div>
                                <div className="flex items-center gap-3 w-full rounded-md hover:bg-gray-50 transition-colors">
                                    <Image src="/phone.png" alt="Phone" width={16} height={16} />
                                    <span>{teacher.phone || "-"}</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="flex-1 flex gap-4 justify-between flex-wrap">
                        {/* <div className='bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]'>
                            <Image src='/singleAttendance.png' alt='' width={24} height={24} className='w-6 h-6' />
                            <div className=''>
                                <h1 className='text-xl font-semibold'>90%</h1>
                                <span className='text-sm text-gray-400'>Attendance</span>
                            </div>
                        </div> */}
                        <div className='bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]'>
                            <Image src='/singleBranch.png' alt='' width={24} height={24} className='w-6 h-6' />
                            <div className=''>
                                <h1 className='text-xl font-semibold'>{teacher._count.subjects}</h1>
                                <span className='text-sm text-gray-400'>Materii</span>
                            </div>
                        </div>
                        <div className='bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]'>
                            <Image src='/singleLesson.png' alt='' width={24} height={24} className='w-6 h-6' />
                            <div className=''>
                                <h1 className='text-xl font-semibold'>{teacher._count.lessons}</h1>
                                <span className='text-sm text-gray-400'>Ore</span>
                            </div>
                        </div>
                        <div className='bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]'>
                            <Image src='/singleClass.png' alt='' width={24} height={24} className='w-6 h-6' />
                            <div className=''>
                                <h1 className='text-xl font-semibold'>{teacher._count.classes}</h1>
                                <span className='text-sm text-gray-400'>Clase</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 bg-white rounded-md p-4 h-[fit]">
                    <h1>Orarul profesorului</h1>
                    <BigCalendarContainer type="teacherId" id={teacher.id} />
                </div>
            </div>

            <div className="w-full xl:w-1/3 flex flex-col gap-4">
                <div className='bg-white p-4 rounded-md'>
                    <h1 className='text-xl font-semibold'>Acces rapid</h1>
                    <div className='mt-4 flex gap-4 flex-wrap text-xs text-gray-500'>
                        <Link className='p-3 rounded-md bg-skyLight' href={`/list/classes?supervisorId=${id}`}>Clasele profesorului</Link>
                        <Link className='p-3 rounded-md bg-orangeLight' href={`/list/students?teacherId=${id}`}>Elevii Profesorului</Link>
                        <Link className='p-3 rounded-md bg-yellowLight' href={`/list/lessons?teacherId=${id}`}>Orele profesorului</Link>
                        <Link className='p-3 rounded-md bg-green-300' href={`/list/exams?teacherId=${id}`}>Testele profesorului</Link>
                        <Link className='p-3 rounded-md bg-purple-200' href={`/list/assignments?teacherId=${id}`}>Temele profesorului</Link>
                    </div>
                </div>
                {/* <Performance /> */}
                <Announcements />
            </div>
        </div>
    )
}

export default SingleTeacherPage