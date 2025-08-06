"use client";
import Image from "next/image";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";



const CountChart = ({ boys, girls, others }: { boys: number, girls: number, others: number }) => {
    const data = [
        {
            name: "Total",
            count: boys + girls + others,
            fill: "white",
        },
        {
            name: "Girls",
            count: girls,
            fill: "#FCE877",
        },
        {
            name: "Boys",
            count: boys,
            fill: "#D1F2FF",
        },
        {
            name: "Others",
            count: others,
            fill: "#FCA868",
        },
    ];

    return (
        <div className="relative w-full h-[75%]">
            <ResponsiveContainer>
                <RadialBarChart cx="50%" cy="50%"
                    innerRadius="40%"
                    outerRadius="100%"
                    barSize={32}
                    data={data}
                >
                    <RadialBar background dataKey="count" />
                </RadialBarChart>
            </ResponsiveContainer>
            <Image src="/maleFemale.png" alt=""
                width={50} height={50}
                className="absolute top-1/2 left-1/2 
                -translate-x-1/2 -translate-y-1/2"
            />
        </div >
    );
};

export default CountChart;