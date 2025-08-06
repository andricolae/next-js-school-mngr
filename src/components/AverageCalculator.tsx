import React from 'react';

interface ScoreData {
    score: number | null | undefined;
    [key: string]: any;
}


interface AverageCalculatorProps<T extends ScoreData> {
    data: T[];
    className?: string;
    title?: string;
    precision?: number;
    showCount?: boolean;
    emptyMessage?: string;
    containerStyle?: 'default' | 'success' | 'info' | 'warning' | 'error';
}


const useAverageCalculation = <T extends ScoreData>(
    data: T[],
    precision: number = 2
) => {
    return React.useMemo(() => {
        if (data.length === 0) {
            return { average: 0, totalWithScores: 0, hasValidData: false };
        }

        const validScores = data.filter(item =>
            item.score !== null &&
            item.score !== undefined &&
            !isNaN(item.score)
        );

        if (validScores.length === 0) {
            return { average: 0, totalWithScores: 0, hasValidData: false };
        }

        const sum = validScores.reduce((acc, item) => acc + item.score!, 0);
        const average = Math.round((sum / validScores.length) * Math.pow(10, precision)) / Math.pow(10, precision);

        return {
            average,
            totalWithScores: validScores.length,
            hasValidData: true,
            sum,
            validScores
        };
    }, [data, precision]);
};


const getContainerStyles = (style: string) => {
    const styles = {
        default: "bg-blue-50 border-blue-200 text-blue-800",
        success: "bg-green-50 border-green-200 text-green-800",
        info: "bg-cyan-50 border-cyan-200 text-cyan-800",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
        error: "bg-red-50 border-red-200 text-red-800"
    };
    return styles[style as keyof typeof styles] || styles.default;
};


const AverageCalculator = <T extends ScoreData>({
    data,
    className = "",
    title = "General average",
    precision = 2,
    showCount = true,
    emptyMessage = "There are no grades for calculating the average.",
    containerStyle = 'default'
}: AverageCalculatorProps<T>) => {
    const { average, totalWithScores, hasValidData } = useAverageCalculation(data, precision);


    if (!hasValidData) {
        return (
            <div className={`bg-gray-50 p-3 rounded-md mt-4 text-center text-gray-600 ${className}`}>
                {emptyMessage}
            </div>
        );
    }


    return (
        <div className={`${getContainerStyles(containerStyle)} p-3 rounded-md mt-4 text-center border ${className}`}>
            <span className="text-lg font-semibold">
                {title}: {average.toFixed(precision)}
            </span>
            {showCount && (
                <span className="text-sm opacity-75 ml-2">
                    (from {totalWithScores} {totalWithScores === 1 ? 'result' : 'results'})
                </span>
            )}
        </div>
    );
};


export const GradeAverageCalculator = <T extends ScoreData>(props: Omit<AverageCalculatorProps<T>, 'containerStyle'>) => (
    <AverageCalculator {...props} containerStyle="info" />
);

export const ExamAverageCalculator = <T extends ScoreData>(props: Omit<AverageCalculatorProps<T>, 'containerStyle'>) => (
    <AverageCalculator {...props} containerStyle="warning" title="Exam average" />
);

export const AssignmentAverageCalculator = <T extends ScoreData>(props: Omit<AverageCalculatorProps<T>, 'containerStyle'>) => (
    <AverageCalculator {...props} containerStyle="success" title="Assignment average" />
);


export { useAverageCalculation };
export default AverageCalculator;