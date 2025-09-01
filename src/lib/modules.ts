export type ModuleType = {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
};

export const availableModules: ModuleType[] = [
    {
        id: 1,
        name: "Modulul 1",
        startDate: "2025-09-08",
        endDate: "2025-10-24"
    },
    {
        id: 2,
        name: "Modulul 2",
        startDate: "2025-11-03",
        endDate: "2025-12-19"
    },
    {
        id: 3,
        name: "Modulul 3",
        startDate: "2026-01-08",
        endDate: "2026-02-06"
    },
    {
        id: 4,
        name: "Modulul 4",
        startDate: "2026-02-09",
        endDate: "2026-04-03"
    },
    {
        id: 5,
        name: "Modulul 5",
        startDate: "2026-04-15",
        endDate: "2026-06-19"
    }
];