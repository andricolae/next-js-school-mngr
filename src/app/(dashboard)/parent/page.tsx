import Announcements from "@/components/Announcements"
import BigCalendar from "@/components/BigCalendar"
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

const ParentPage = async ({
  searchParams
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  const { userId } = await auth()
  
  const studentsWithClasses = await prisma.student.findMany({
    where: {
      parentId: userId!
    },
    include: {
      class: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  const selectedStudentId = searchParams.studentId || studentsWithClasses[0]?.id;
  const selectedStudent = studentsWithClasses.find(s => s.id === selectedStudentId) || studentsWithClasses[0];

  return (
    <div className='flex-1 p-4 flex gap-4 flex-col xl:flex-row'>
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <div className="flex items-center gap-2 mb-4">
            <h1 className="text-xl font-semibold">Schedule</h1>
            <div className="flex gap-2 ml-4">
              {studentsWithClasses.map((student, index) => (
                <Link
                  key={student.id}
                  href={`/parent?studentId=${student.id}`}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    selectedStudent?.id === student.id
                      ? 'bg-orange text-white'
                      : 'bg-orangeLight text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {student.name}
                </Link>
              ))}
            </div>
          </div>
          {selectedStudent?.class?.id ? (
            <BigCalendarContainer type="classId" id={selectedStudent.class.id} />
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-500">
              No student or class found
            </div>
          )}
        </div>
      </div>
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <EventCalendarContainer searchParams={searchParams} />
        <Announcements />
      </div>
    </div>
  )
}

export default ParentPage