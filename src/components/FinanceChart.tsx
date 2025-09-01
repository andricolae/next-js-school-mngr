"use client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface FinanceData {
    name: string;
    income: number;
    expense: number;
}

interface FinanceChartProps {
    data: FinanceData[];
}

const FinanceChart = ({ data }: FinanceChartProps) => {
    return (
        <div className="bg-white rounded-xl w-full h-full p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-lg font-semibold">Finance</h1>
            </div>
            <ResponsiveContainer width="100%" height="90%">
                <LineChart
                    width={500}
                    height={300}
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" axisLine={false} tick={{ fill: "#D1D5DB" }} tickLine={false} tickMargin={10} />
                    <YAxis axisLine={false} tick={{ fill: "#D1D5DB" }} tickLine={false} tickMargin={20} />
                    <Tooltip
                        formatter={(value: number) => [`€${value.toLocaleString()}`]}
                        labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend align="center" verticalAlign="top" wrapperStyle={{ paddingTop: "10px", paddingBottom: "30px" }} />
                    <Line type="monotone" dataKey="income" stroke="#FCE149" strokeWidth={3} name="Income" />
                    <Line type="monotone" dataKey="expense" stroke="#ABE7FF" strokeWidth={3} name="Expenses" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default FinanceChart