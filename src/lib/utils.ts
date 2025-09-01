const currentWorkWeek = () => {
    const today = new Date();

    const dayOfWeek = today.getDay();

    let daysToSubtract = dayOfWeek - 1;
    if (dayOfWeek === 0) daysToSubtract = 6;

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - daysToSubtract);
    startOfWeek.setHours(0, 0, 0, 0);

    return startOfWeek;
};

export const adjustScheduleToCurrentWeek = (
    lessons: { title: string; start: Date; end: Date }[]
): { title: string; start: Date; end: Date }[] => {
    const startOfWeek = currentWorkWeek();

    return lessons.map(lesson => {
        const lessonStart = new Date(lesson.start);
        const lessonEnd = new Date(lesson.end);

        const lessonDayOfWeek = lessonStart.getDay();

        const daysFromMonday = lessonDayOfWeek === 0 ? 6 : lessonDayOfWeek - 1;

        const adjustedStartDate = new Date(startOfWeek);
        adjustedStartDate.setDate(startOfWeek.getDate() + daysFromMonday);

        const correctedHours = lessonStart.getHours();
        const originalMinutes = lessonStart.getMinutes();

        adjustedStartDate.setHours(correctedHours, originalMinutes, 0, 0);

        const durationMs = lessonEnd.getTime() - lessonStart.getTime();

        const adjustedEndDate = new Date(adjustedStartDate.getTime() + durationMs);

        return {
            title: lesson.title,
            start: adjustedStartDate,
            end: adjustedEndDate
        };
    });
};

export type TokenData = {
    userPblcMtdt: {
        role: string;
        name: string;
    };
    azp: string;
    exp: number;
    fva: number[];
    iat: number;
    iss: string;
    jti: string;
    nbf: number;
    sid: string;
    sub: string;
    v: number
};