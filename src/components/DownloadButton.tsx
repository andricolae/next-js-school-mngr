"use client"; 
import React from 'react';
import Image from "next/image"; 
import { GenerateResultsPDF } from "@/components/ExportPDF";

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
           
        >
            <Image src="/download.png" alt="Download PDF" width={19} height={19} />
        </button>
    );
};

export default DownloadButton;