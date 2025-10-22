"use client";
import React from 'react';
import { GenerateResultsPDF } from "@/components/ExportPDF";
import { ResultItemForPdf } from '@/lib/sharedInterfaces';

interface PdfHeaderDetails {
    companyName?: string;
    companyAddress?: string;
    moduleName?: string;
    isSingleStudentSelected?: boolean;
}

interface DownloadButtonProps {
    dataToExport: ResultItemForPdf[];
    headerDetails?: PdfHeaderDetails;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
    dataToExport,
    headerDetails,
}) => {
    const handleDownloadPdf = () => {

        GenerateResultsPDF(dataToExport, headerDetails);
    };

    return (
        <button
            className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow"
            onClick={handleDownloadPdf}
            title="Descarcă"
        >
            <img src="/download.svg" alt="Download PDF" width={19} height={19} />
        </button>
    );
};

export default DownloadButton;