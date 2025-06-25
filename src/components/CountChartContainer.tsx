import prisma from "@/lib/prisma";
import CountChart from "./CountChart"
import Image from "next/image";

const CountChartContainer = async () => {

    const data = await prisma.student.groupBy({
        by: ["gender"],
        _count: true,
    });

    const girls = data.find(d => d.gender === "FEMALE")?._count || 0;
    const boys = data.find(d => d.gender === "MALE")?._count || 0;
    const others = data.find(d => d.gender === "OTHER")?._count || 0;

    return (
        <div className="bg-white rounded-xl w-full h-full p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-lg font-semibold">Students</h1>
                {/* <Image src="/moreDark.png" alt="" width={20} height={20} /> */}
            </div>
            <CountChart girls={girls} others={others} boys={boys} />
            <div className="flex justify-center gap-16">
                <div className="flex flex-col gap-1">
                    <div className="w-5 h-5 bg-skyLight rounded-full" />
                    <h1 className="font-bold">{girls}</h1>
                    <h2 className="text-xs text-gray-300">
                        Girls ({Math.round((girls / (girls + boys + others)) * 100)}%)
                    </h2>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="w-5 h-5 bg-yellowLight rounded-full" />
                    <h1 className="font-bold">{boys}</h1>
                    <h2 className="text-xs text-gray-300">
                        Boys ({Math.round((boys / (girls + boys + others)) * 100)}%)
                    </h2>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="w-5 h-5 bg-orangeLight rounded-full" />
                    <h1 className="font-bold">{others}</h1>
                    <h2 className="text-xs text-gray-300">
                        Others ({Math.round((others / (girls + boys + others)) * 100)}%)
                    </h2>
                </div>
            </div>
        </div>
    )
}

export default CountChartContainer