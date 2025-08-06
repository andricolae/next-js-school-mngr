import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";

declare module "jspdf" {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
        lastAutoTable?: { finalY: number };
    }
}

interface ResultItemForPdf {
    id: number;
    title: string;
    studentName: string;
    studentSurname: string;
    teacherName: string;
    teacherSurname: string;
    score: number;
    className: string;
    startTime: Date;
    subject: string;
}

interface PdfHeaderDetails {
    companyName?: string;
    companyAddress?: string;
    moduleName?: string;
    isSingleStudentSelected?: boolean;
}


interface FetchAllDataParams {
    filters?: any;
    searchTerm?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
}

const COLORS = {
    primary: {
        navy: [20, 43, 94],
        blue: [37, 99, 235],
        lightBlue: [59, 130, 246],
        accent: [147, 197, 253]
    },
    neutral: {
        darkGray: [55, 65, 81],
        gray: [107, 114, 128],
        lightGray: [243, 244, 246],
        white: [255, 255, 255]
    },
    semantic: {
        success: [16, 185, 129],
        warning: [245, 158, 11],
        error: [239, 68, 68]
    }
};

function calculateAverageForPdf(results: ResultItemForPdf[]): {
    average: number;
    totalWithScores: number;
    hasValidData: boolean;
    maxScore: number;
    minScore: number;
    passRate: number;
} {
    if (results.length === 0) {
        return {
            average: 0,
            totalWithScores: 0,
            hasValidData: false,
            maxScore: 0,
            minScore: 0,
            passRate: 0
        };
    }

    const validScores = results.filter(item =>
        item.score !== null &&
        item.score !== undefined &&
        !isNaN(item.score)
    );

    if (validScores.length === 0) {
        return {
            average: 0,
            totalWithScores: 0,
            hasValidData: false,
            maxScore: 0,
            minScore: 0,
            passRate: 0
        };
    }

    const scores = validScores.map(item => item.score);
    const sum = scores.reduce((acc, score) => acc + score, 0);
    const average = Math.round((sum / validScores.length) * 100) / 100;
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const passRate = Math.round((scores.filter(score => score >= 60).length / scores.length) * 100);

    return {
        average,
        totalWithScores: validScores.length,
        hasValidData: true,
        maxScore,
        minScore,
        passRate
    };
}

function addProfessionalHeader(doc: jsPDF, headerDetails?: PdfHeaderDetails) {
    doc.setFillColor(...[20, 43, 94]);
    doc.rect(0, 0, doc.internal.pageSize.width, 35, 'F');

    doc.setFillColor(...[137, 207, 240]);
    doc.circle(25, 17.5, 8, 'F');
    doc.setTextColor(...[255, 255, 255]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('SC', 25, 20, { align: 'center' });

    doc.setTextColor(...[255, 255, 255]);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('STUDENT RESULTS REPORT', 45, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Academic Performance Analysis', 45, 28);

    if (headerDetails?.companyName) {
        doc.setTextColor(...[255, 255, 255]);
        doc.setFontSize(8);
        doc.text(`${headerDetails.companyName}`, doc.internal.pageSize.width - 20, 15, { align: 'right' });
    }

    if (headerDetails?.companyAddress) {
        doc.setTextColor(...[147, 197, 253]);
        doc.setFontSize(7);
        doc.text(`${headerDetails.companyAddress}`, doc.internal.pageSize.width - 20, 22, { align: 'right' });
    }
}

function addModuleInfo(doc: jsPDF, startY: number, moduleName?: string): number {
    if (!moduleName) return startY;

    doc.setFillColor(...[147, 197, 253]);
    doc.rect(15, startY, 180, 15, 'F');

    doc.setDrawColor(...[37, 99, 235]);
    doc.setLineWidth(0.5);
    doc.rect(15, startY, 180, 15);

    doc.setFillColor(...[37, 99, 235]);
    doc.circle(25, startY + 7.5, 4, 'F');
    doc.setTextColor(...[255, 255, 255]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('M', 25, startY + 9, { align: 'center' });

    doc.setTextColor(...[20, 43, 94]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('FILTERED BY MODULE:', 35, startY + 6);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(moduleName, 35, startY + 11);

    return startY + 20;
}

function addEnhancedStatistics(doc: jsPDF, startY: number, stats: any) {
    doc.setFillColor(...[243, 244, 246]);
    doc.rect(15, startY, 180, 45, 'F');

    doc.setFillColor(...[137, 207, 240]);
    doc.rect(15, startY, 180, 12, 'F');

    doc.setTextColor(...[255, 255, 255]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PERFORMANCE STATISTICS', 20, startY + 8);

    const contentY = startY + 20;

    doc.setTextColor(...[20, 43, 94]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Average Score:', 20, contentY);


    const avgColor = stats.average >= 80 ? [16, 185, 129] :
        stats.average >= 60 ? [245, 158, 11] :
            [239, 68, 68];
    // doc.setTextColor(...avgColor);
    doc.setFontSize(14);
    doc.text(`${stats.average.toFixed(1)}`, 65, contentY);

    doc.setTextColor(...[55, 65, 81]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Highest: ${stats.maxScore}`, 20, contentY + 8);
    doc.text(`Lowest: ${stats.minScore}`, 20, contentY + 14);
    doc.text(`Pass Rate: ${stats.passRate}%`, 20, contentY + 20);

    doc.setTextColor(...[37, 99, 235]);
    doc.setFontSize(10);
    doc.text(`Based on ${stats.totalWithScores} result${stats.totalWithScores === 1 ? '' : 's'}`, 100, contentY + 8);

    doc.setTextColor(...[107, 114, 128]);
    doc.setFontSize(8);
    doc.text(`Report generated: ${new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}`, 100, contentY + 14);

    return startY + 50;
}

function addProfessionalFooter(doc: jsPDF, pageNum: number, totalPages: number) {
    const footerY = doc.internal.pageSize.height - 15;

    doc.setDrawColor(...[37, 99, 235]);
    doc.setLineWidth(0.5);
    doc.line(20, footerY - 5, doc.internal.pageSize.width - 20, footerY - 5);

    doc.setTextColor(...[107, 114, 128]);
    doc.setFontSize(8);
    doc.text('Generated by SmartClass © 2024', 20, footerY);
    doc.text(`Page ${pageNum} of ${totalPages}`, doc.internal.pageSize.width - 20, footerY, { align: 'right' });
}


async function fetchAllResults(
    fetchFunction: (params: FetchAllDataParams & { page?: number; limit?: number }) => Promise<{
        results: ResultItemForPdf[];
        totalCount: number;
        totalPages: number;
    }>,
    params: FetchAllDataParams = {}
): Promise<ResultItemForPdf[]> {
    const allResults: ResultItemForPdf[] = [];
    let currentPage = 1;
    let totalPages = 1;

    do {
        try {
            const response = await fetchFunction({
                ...params,
                page: currentPage,
                limit: 100
            });

            allResults.push(...response.results);
            totalPages = response.totalPages;
            currentPage++;
        } catch (error) {
            console.error(`Error fetching page ${currentPage}:`, error);
            break;
        }
    } while (currentPage <= totalPages);

    return allResults;
}


export async function GenerateCompleteResultsPDF(
    fetchFunction: (params: FetchAllDataParams & { page?: number; limit?: number }) => Promise<{
        results: ResultItemForPdf[];
        totalCount: number;
        totalPages: number;
    }>,
    headerDetails?: PdfHeaderDetails,
    fetchParams?: FetchAllDataParams
): Promise<Blob> {

    const loadingIndicator = document.createElement('div');
    loadingIndicator.innerHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 20px;
      border-radius: 8px;
      z-index: 10000;
      text-align: center;
    ">
      <div>Preparing PDF...</div>
      <div style="margin-top: 10px;">
        <div style="
          width: 200px;
          height: 4px;
          background: #333;
          border-radius: 2px;
          overflow: hidden;
        ">
          <div id="progress-bar" style="
            width: 0%;
            height: 100%;
            background: #4CAF50;
            transition: width 0.3s ease;
          "></div>
        </div>
      </div>
    </div>
  `;
    document.body.appendChild(loadingIndicator);

    try {

        const progressBar = loadingIndicator.querySelector('#progress-bar') as HTMLElement;
        if (progressBar) progressBar.style.width = '30%';


        const allResults = await fetchAllResults(fetchFunction, fetchParams);

        if (progressBar) progressBar.style.width = '70%';


        const pdfBlob = GenerateResultsPDF(allResults, headerDetails);

        if (progressBar) progressBar.style.width = '100%';


        setTimeout(() => {
            document.body.removeChild(loadingIndicator);
        }, 500);

        return pdfBlob;
    } catch (error) {
        document.body.removeChild(loadingIndicator);
        throw error;
    }
}


export function GenerateResultsPDF(
    results: ResultItemForPdf[],
    headerDetails?: PdfHeaderDetails
): Blob {
    const doc = new jsPDF();

    const stats = calculateAverageForPdf(results);

    addProfessionalHeader(doc, headerDetails);

    let currentY = 55;

    if (headerDetails?.moduleName) {
        currentY = addModuleInfo(doc, currentY, headerDetails.moduleName);
    }

    const tableHeaders = [
        "Assessment Title",
        "Subject",
        "Student Name",
        "Instructor",
        "Class",
        "Score",
        "Date"
    ];

    const tableBody = results.map((item) => [
        item.title,
        item.subject,
        `${item.studentName} ${item.studentSurname}`,
        `${item.teacherName} ${item.teacherSurname}`,
        item.className,
        item.score.toString(),
        new Intl.DateTimeFormat("en-US", {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(item.startTime))
    ]);

    autoTable(doc, {
        startY: currentY,
        head: [tableHeaders],
        body: tableBody,
        styles: {
            fontSize: 8,
            cellPadding: 3,
            overflow: 'linebreak' as const,
            textColor: [55, 65, 81]
        },
        headStyles: {
            fillColor: [137, 207, 240],
            textColor: [255, 255, 255],
            fontStyle: 'bold' as const,
            fontSize: 9
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252]
        },
        theme: "striped" as const,
        tableLineColor: [59, 130, 246],
        tableLineWidth: 0.2,
        didDrawPage: function (data: any) {
            addProfessionalFooter(doc, data.pageNumber, doc.getNumberOfPages());
        }
    });

    const finalY = doc.lastAutoTable?.finalY || 200;

    if (stats.hasValidData && headerDetails?.isSingleStudentSelected) {
        const statsY = finalY + 15;

        if (statsY > doc.internal.pageSize.height - 80) {
            doc.addPage();
            addProfessionalHeader(doc, headerDetails);
            addEnhancedStatistics(doc, 55, stats);
        } else {
            addEnhancedStatistics(doc, statsY, stats);
        }
    }

    const now = new Date();
    const timestamp = now.toISOString()
        .replace(/[:.]/g, '-')
        .split('T')[0] + '_' +
        now.toTimeString().split(' ')[0].replace(/:/g, '-');

    const modulePrefix = headerDetails?.moduleName ?
        `${headerDetails.moduleName.replace(/\s+/g, '_')}_` : '';

    const filename = `SmartClass_Report_${modulePrefix}${timestamp}.pdf`;

    doc.save(filename);

    return doc.output("blob");
}

export { calculateAverageForPdf };