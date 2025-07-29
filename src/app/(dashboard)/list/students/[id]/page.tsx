import Announcements from '@/components/Announcements'
import BigCalendar from '@/components/BigCalendar'
import BigCalendarContainer from '@/components/BigCalendarContainer'
import FormContainer from '@/components/FormContainer'
import FormModal from '@/components/FormModal'
import Performance from '@/components/Performance'
import StudentAttendanceCard from '@/components/StudentAttendanceCard'
import prisma from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { Class, Prisma, Student } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import { TokenData } from "@/lib/utils";
import FormModalCustom from '@/components/FormModalCustom'

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
						<div className="w-2/3 flex flex-col justify-between gap-4">
							<div className='flex items-center gap-4'>
								<h1 className='text-xl font-semibold'>{student.name + " " + student.surname}</h1>
								{role === "admin" && (
									<FormContainer table="student" type="update" data={student} />
								)}
							</div>
							<p className='text-sm text-gray-500'>Lorem ipsum, dolor sit amet consectetur adipisicing elit.</p>
							<div className='flex items-center justify-between gap-2 flex-wrap text-xs font-medium'>
								<div className='w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2'>
									<Image src='/blood.png' alt='' width={14} height={14} />
									<span>{student.bloodType}</span>
								</div>
								<div className='w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2'>
									<Image src='/date.png' alt='' width={14} height={14} />
									<span>{new Intl.DateTimeFormat("en-UK").format(student.birthday)}</span>
								</div>
								<div className='w-full md:w-1/3 lg:w-full  flex items-center gap-2'>
									<Image src='/mail.png' alt='' width={14} height={14} />
									<span>{student.email || "-"}</span>
								</div>
								<div className='w-full md:w-1/3 lg:w-full  flex items-center gap-2'>
									<Image src='/phone.png' alt='' width={14} height={14} />
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
								<h1 className='text-xl font-semibold'>{student.class.name.charAt(0)}th</h1>
								<span className='text-sm text-gray-400'>Grade</span>
							</div>
						</div>
						<div className='bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]'>
							<Image src='/singleLesson.png' alt='' width={24} height={24} className='w-6 h-6' />
							<div className=''>
								<h1 className='text-xl font-semibold'>{student.class._count.lessons}</h1>
								<span className='text-sm text-gray-400'>Lessons</span>
							</div>
						</div>
						<div className='bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]'>
							<Image src='/singleClass.png' alt='' width={24} height={24} className='w-6 h-6' />
							<div className=''>
								<h1 className='text-xl font-semibold'>{student.class.name}</h1>
								<span className='text-sm text-gray-400'>Class</span>
							</div>
						</div>
					</div>
				</div>

				<div className="mt-4 bg-white rounded-md p-4 h-[500px]">
					<h1>Student&apos;s Schedule</h1>
					<BigCalendarContainer type="classId" id={student.class.id} />
				</div>
			</div>

			<div className="w-full xl:w-1/3 flex flex-col gap-4">
				<div className='bg-white p-4 rounded-md'>
					<h1 className='text-xl font-semibold'>Shortcuts</h1>
					<div className='mt-4 flex gap-4 flex-wrap text-xs text-gray-500'>
						<Link className='p-3 rounded-md bg-skyLight' href={`/list/lessons?classId=${2}`}>Student&apos;s Lessons</Link>
						<Link className='p-3 rounded-md bg-orangeLight' href={`/list/teachers?classId=${2}`}>Student&apos;s Teachers</Link>
						<Link className='p-3 rounded-md bg-yellowLight' href={`/list/results?studentId=${"student2"}`}>Student&apos;s Results</Link>
						<Link className='p-3 rounded-md bg-green-300' href={`/list/exams?classId=${2}`}>Student&apos;s Exams</Link>
						<Link className='p-3 rounded-md bg-purple-200' href={`/list/assignments?classId=${2}`}>Student&apos;s Assignments</Link>
						{(role === "admin" || role === "teacher") && (
							<>
								<div className=''><FormModalCustom table="teacher" type="create" title="Adeverinta elev" student={student} /></div>
								<div className=''><FormModalCustom table="parent" type="create" title="Foaie matricola" student={student} results={results} /></div>
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