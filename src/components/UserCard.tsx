import prisma from "@/lib/prisma"

const UserCard = async ({ type }: { type: "admin" | "teacher" | "student" | "parent" }) => {

    const modelMap: Record<typeof type, any> = {
        admin: prisma.admin,
        teacher: prisma.teacher,
        student: prisma.student,
        parent: prisma.parent,
    }

    const data = await modelMap[type].count()

    const labelMap: Record<typeof type, string> = {
        admin: "Administratori",
        teacher: "Profesori",
        student: "Elevi",
        parent: "Părinți",
    }

    const now = new Date()
    const currentYear = now.getFullYear()
    const month = now.getMonth() + 1

    let academicYear: string
    if (month >= 9 && month <= 12) {
        academicYear = `${currentYear}/${currentYear + 1}`
    } else {
        academicYear = `${currentYear - 1}/${currentYear}`
    }

    return (
        <div className="rounded-2xl odd:bg-orange even:bg-yellow p-4 flex-1 min-w-[130px]">
            <div className="flex justify-between items-center">
                <span className="text-10px bg-white px-2 py-1 rounded-full text-green-500">{academicYear}</span>
                {/* <img src="/more.svg" alt="" width={20} height={20} /> */}
            </div>
            <h1 className="text-2xl font-semibold my-4">{data}</h1>
            <h2 className="capitalize text-sm font-medium text-gray-500">{labelMap[type]}</h2>
        </div>
    )
}

export default UserCard