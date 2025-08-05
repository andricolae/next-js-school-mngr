import jsPDF from "jspdf";

export const generateCertificatePDF = (unitateInvatamant: any, nr: any, data: any, elev: any, clasa: any, nrMatricol: any, anuScolarIncep: any, anuScolarSfrst: any, serversteLa: any) => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "A4",
    });

    const marginLeft = 40;
    let y = 50;

    doc.setFont("Times", "Normal");
    doc.setFontSize(12);
    doc.text("Unitatea de invatamant", marginLeft, y);
    doc.text(`Nr. ${nr}`, 380, y);
    y += 20;
    doc.text(`${unitateInvatamant}`, marginLeft, y);
    doc.text(`Data ${data}`, 380, y);

    y += 50;
    doc.setFontSize(20);
    doc.setFont("Times", "Bold");
    doc.text("ADEVERINTA", doc.internal.pageSize.getWidth() / 2, y, { align: "center" });

    y += 40;
    doc.setFontSize(12);
    doc.setFont("Times", "Normal");

    doc.text(`        Elev ${elev} este inscris în clasa (anul) ${clasa} numar matricol ${nrMatricol}`, marginLeft, y);
    y += 20;
    doc.text(`in anul scolar 20${anuScolarIncep} - 20${anuScolarSfrst} . Adeverinta se elibereaza de unitatea de invatamant pentru a-i servi la:`, marginLeft, y);

    y += 30;
    doc.text(`${serversteLa}`, marginLeft, y);

    y += 60;
    doc.text("DIRECTOR,", marginLeft, y);
    doc.text("Secretar,", doc.internal.pageSize.getWidth() - marginLeft - 60, y); // Right aligned

    doc.save("adeverinta.pdf");
};
