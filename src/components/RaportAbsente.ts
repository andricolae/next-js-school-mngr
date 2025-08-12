import jsPDF from "jspdf";

export const generateRaportAbsentePDF = (
    unitateInvatamant: string,
    scoala: string,
    data: string,
    nume: string,
    prenume: string,
    lunaAn: string
) => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "A4",
    });

    const marginLeft = 40;
    let y = 40;

    // Antet stânga și dreapta
    doc.setFont("Times", "Normal");
    doc.setFontSize(10);
    doc.text("Unitatea de invatamant", marginLeft, y);
    doc.text(`${unitateInvatamant}`, marginLeft, y + 12);
    doc.text(`Data: ${data}`, 400, y);

    // Titlu
    y += 50;
    doc.setFontSize(14);
    doc.setFont("Times", "Bold");
    doc.text("Raport absente", doc.internal.pageSize.getWidth() / 2, y, { align: "center" });
    doc.setFontSize(12);
    doc.text(`-${lunaAn}-`, doc.internal.pageSize.getWidth() / 2, y + 16, { align: "center" });

    // Nume și prenume
    y += 50;
    doc.setFont("Times", "Normal");
    doc.setFontSize(12);
    doc.text(`Nume: ${nume}`, marginLeft, y);
    doc.text(`Prenume: ${prenume}`, marginLeft, y + 18);

    // Tabel
    y += 30;
    const startTableY = y;
    const col1X = marginLeft;
    const col2X = 350;
    const tableWidth = 500;
    const rowHeight = 20;
    const numRows = 15;

    // Linii tabel
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);

    // Linii orizontale
    for (let i = 0; i <= numRows; i++) {
        doc.line(col1X, startTableY + i * rowHeight, col1X + tableWidth, startTableY + i * rowHeight);
    }

    // Linii verticale
    doc.line(col1X, startTableY, col1X, startTableY + numRows * rowHeight);
    doc.line(col2X, startTableY, col2X, startTableY + numRows * rowHeight);
    doc.line(col1X + tableWidth, startTableY, col1X + tableWidth, startTableY + numRows * rowHeight);

    // Totaluri
    y = startTableY + numRows * rowHeight + 30;
    doc.setFontSize(12);
    doc.text("Total absente motivate:", marginLeft, y);
    doc.text("Total absente nemotivate:", marginLeft, y + 18);
    doc.text("Total absente:", marginLeft, y + 36);

    doc.save("raport_absente.pdf");
};
