import jsPDF from "jspdf";

export const generateRaportAbsentePDF = (
    unitateInvatamant: string,
    data: string,
    nume: string,
    prenume: string,
    lunaAn: string,
    absente: any,
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
    doc.text(`- ${new Date(lunaAn + "-01").toLocaleString("ro-RO", { month: "long", year: "numeric" })} -`,
        doc.internal.pageSize.getWidth() / 2, y + 16, { align: "center" });

    // Nume și prenume
    y += 50;
    doc.setFont("Times", "Normal");
    doc.setFontSize(12);
    doc.text(`Nume: ${nume}`, marginLeft, y);
    doc.text(`Prenume: ${prenume}`, marginLeft, y + 18);

    y += 30;

    // Linii tabel
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);

    y += 30;
    const dataRowHeight = 20;
    const colWidths = [310, 190]; // lățimile celor două coloane
    const colX = [marginLeft, marginLeft + colWidths[0]];

    let absenteMotivate = 0;
    for (let i = 0; i < absente.length; i++) {
        if (absente[i].status === "motivata") {
            ++absenteMotivate;
        }
        doc.rect(colX[0], y + i * dataRowHeight, colWidths[0], dataRowHeight);
        doc.rect(colX[1], y + i * dataRowHeight, colWidths[1], dataRowHeight);
        doc.text(absente[i].data, colX[0] + 5, y + i * dataRowHeight + 14);
        doc.text(absente[i].status, colX[1] + 5, y + i * dataRowHeight + 14);
    }

    // Totaluri
    y += absente.length * dataRowHeight + 20;
    doc.setFontSize(12);
    doc.text("Total absente motivate:", marginLeft, y);
    doc.text(`${absenteMotivate}`, marginLeft + 120, y);
    doc.text("Total absente nemotivate:", marginLeft, y + 18);
    doc.text(`${absente.length - absenteMotivate}`, marginLeft + 130, y + 18);
    doc.text("Total absente:", marginLeft, y + 36);
    doc.text(`${absente.length}`, marginLeft + 75, y + 36);

    doc.save("raport_absente.pdf");
};
