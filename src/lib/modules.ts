
export type ModuleType = {
    id: number;
    name: string;
    startDate: string; 
    endDate: string;   
};

export const availableModules: ModuleType[] = [
    {
        id: 1,
        name: "Semester 1",
        startDate: "2025-06-01",
        endDate: "2025-06-30" 
    },
    {
        id: 2,
        name: "Semester 2",
        startDate: "2025-07-01",
        endDate: "2025-07-31"
    },
    {
        id: 3,
        name: "Semester 3",
        startDate: "2025-08-01",
        endDate: "2025-08-31" 
    }
];