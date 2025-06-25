import prisma from "@/lib/prisma";
import FinanceChart from "./FinanceChart";

const FinanceChartContainer = async () => {
    const [studentCount, teacherCount, adminCount] = await Promise.all([
        prisma.student.count(),
        prisma.teacher.count(), 
        prisma.admin.count()
    ]);

    const financeData = generateFinanceData(studentCount, teacherCount, adminCount);

    return <FinanceChart data={financeData} />;
};

/**
 * SCHOOL FINANCE CALCULATION ALGORITHMS
 * 
 * INCOME ALGORITHM:
 * Monthly Income = (Students × Tuition) + (Students × Additional Fees)
 * - Base tuition: €450/student/month
 * - School supplies: €60/student/month 
 * - Activities & events: €40/student/month
 * - Other fees: €50/student/month
 * Total: €600 per student per month
 * 
 * EXPENSE ALGORITHM:
 * Monthly Expenses = Staff Costs + Utilities + Maintenance + Operations
 * 
 * Staff Costs (65% of expenses):
 * - Teachers: €2,000/month each
 * - Admins: €1,600/month each  
 * - Support staff: 1 per 40 students at €1,300/month
 * 
 * Utilities (20% - seasonal variation):
 * - Base: €12/student/month
 * - Winter heating (Dec,Jan,Feb): +€18/student
 * - Transition (Oct,Nov,Mar): +€8/student
 * - Summer cooling (Jun,Jul,Aug): +€6/student
 * - Spring/Fall (Apr,May,Sep): base rate
 * 
 * Maintenance & Operations (15%):
 * - Facility maintenance: €25/student/month
 * - Educational materials: €300/teacher/month
 * - Administrative costs: €200/admin/month
 */
function generateFinanceData(studentCount: number, teacherCount: number, adminCount: number) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); 
    const currentYear = currentDate.getFullYear();

    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const seasonalMultipliers: Record<number, number> = {
        0: 1.5,   // Jan - Winter heating
        1: 1.5,   // Feb - Winter heating  
        2: 1.2,   // Mar - Transition
        3: 1.0,   // Apr - Spring
        4: 1.0,   // May - Spring
        5: 1.15,  // Jun - Summer cooling
        6: 1.15,  // Jul - Summer cooling
        7: 1.15,  // Aug - Summer cooling
        8: 1.0,   // Sep - Fall
        9: 1.2,   // Oct - Transition
        10: 1.2,  // Nov - Transition
        11: 1.5   // Dec - Winter heating
    };

    return months.map((month, index) => {
        if (index > currentMonth) {
            return {
                name: month,
                income: 0,
                expense: 0
            };
        }

        let prorationFactor = 1; 
        
        if (index === currentMonth) {
            const currentDay = currentDate.getDate();
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            prorationFactor = currentDay / daysInMonth;
        }

        const monthlyTuitionPerStudent = 450;
        const additionalFeesPerStudent = 150; 
        const totalIncomePerStudent = monthlyTuitionPerStudent + additionalFeesPerStudent; 
        
        const monthlyIncome = studentCount * totalIncomePerStudent;
        
        const teacherSalaries = teacherCount * 2000;
        const adminSalaries = adminCount * 1600;
        const supportStaffCount = Math.ceil(studentCount / 40);
        const supportStaffSalaries = supportStaffCount * 1300;
        const totalStaffCosts = teacherSalaries + adminSalaries + supportStaffSalaries;

        const baseUtilitiesPerStudent = 12;
        const seasonalMultiplier = seasonalMultipliers[index];
        const monthlyUtilities = studentCount * baseUtilitiesPerStudent * seasonalMultiplier;

        const facilityMaintenancePerStudent = 25;
        const educationalMaterialsPerTeacher = 300;
        const adminOperationsPerAdmin = 200;
        
        const facilityMaintenance = studentCount * facilityMaintenancePerStudent;
        const educationalMaterials = teacherCount * educationalMaterialsPerTeacher;
        const adminOperations = adminCount * adminOperationsPerAdmin;
        const totalMaintenanceOps = facilityMaintenance + educationalMaterials + adminOperations;

        const monthlyExpenses = totalStaffCosts + monthlyUtilities + totalMaintenanceOps;

        const incomeVariation = 1 + (Math.random() - 0.5) * 0.1;
        const expenseVariation = 1 + (Math.random() - 0.5) * 0.1;

        const finalIncome = monthlyIncome * prorationFactor * incomeVariation;
        const finalExpenses = monthlyExpenses * prorationFactor * expenseVariation;

        return {
            name: month,
            income: Math.round(finalIncome),
            expense: Math.round(finalExpenses)
        };
    });
}

export default FinanceChartContainer;