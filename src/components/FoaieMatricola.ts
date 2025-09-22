import jsPDF from "jspdf";
import { schoolData } from "@/lib/schoolData";

export const generateTranscriptPDF = (nume: string, cnp: string,
    nationalitate: string, dataLocNastere: string, numeTata: string, numeMama: string,
    domiciliuParinti: string, domiciliuElev: string, materiiSiNote: string[]
) => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "A4",
    });
    const width = doc.internal.pageSize.getWidth();
    const marginLeft = 20;

    let y = 40;
    doc.setFont("Times", "Normal");
    doc.setFontSize(11);
    doc.text("Nr_____ din_________", width - marginLeft, 30, { align: "right" });
    doc.setFont("Times", "Bold");
    doc.setFontSize(14);
    doc.text("ROMANIA", width / 2, y, { align: "center" });

    y += 14;
    doc.text("MINISTERUL EDUCATIEI NATIONALE", width / 2, y, { align: "center" });

    y += 35;
    doc.setFont("Times", "Normal");
    doc.setFontSize(11);
    doc.text(schoolData[0].name, width / 2, y, { align: "center" });
    doc.text(schoolData[0].mainAddress, width / 2, y + 15, { align: "center" });

    y += 33;
    doc.setFontSize(12);
    const boxWidth = 20;
    const boxHeight = 18;
    const numBoxes = 10;
    const totalWidth = boxWidth * numBoxes;
    const label = "CIF:";
    const labelWidth = doc.getTextWidth(label) + 10;
    const totalRowWidth = labelWidth + totalWidth;
    const startX = (width - totalRowWidth) / 2;
    const startY = y - boxHeight / 2;
    doc.text(label, startX, y + 4);
    for (let i = 0; i < numBoxes; i++) {
        const x = startX + labelWidth + i * boxWidth;
        doc.rect(x, startY, boxWidth, boxHeight);
        if (schoolData[0].CIF[i]) {
            doc.text(
                schoolData[0].CIF[i],
                x + boxWidth / 2,
                startY + boxHeight / 2 + 4,
                { align: "center" }
            );
        }
    }

    y += 34;
    doc.setFont("Times", "Bold");
    doc.setFontSize(16);
    doc.text("FOAIE MATRICOLA", width / 2, y, { align: "center" });

    y += 16;
    doc.setFontSize(13);
    doc.text("pentru clasele V - VIII", width / 2, y, { align: "center" });

    y += 40;
    doc.rect(marginLeft, y - 12, width - 2 * marginLeft, 18);
    doc.text(nume, width / 2, y + 2, { align: "center" });

    y += 16;
    doc.setFont("Times", "Normal");
    doc.setFontSize(11);
    doc.text("(Numele si prenumele)", width / 2, y, { align: "center" });

    y += 40;
    doc.setFont("Times", "Normal");
    doc.setFontSize(11);
    doc.text("Codul numeric personal:", marginLeft, y + 3);
    const cnpBoxWidth = 18;
    const cnpBoxHeight = 16;
    const numCnpBoxes = 13;
    const startCnpX = marginLeft + 130;
    const startCnpY = y - cnpBoxHeight / 2;

    for (let i = 0; i < numCnpBoxes; i++) {
        const x = startCnpX + i * cnpBoxWidth;
        doc.rect(x, startCnpY, cnpBoxWidth, cnpBoxHeight);

        if (cnp[i]) {
            doc.text(
                cnp[i],
                x + cnpBoxWidth / 2,
                startCnpY + cnpBoxHeight / 2 + 4,
                { align: "center" }
            );
        }
    }

    y += 30;
    const fullWidth = width - 2 * marginLeft - 20;
    const nationalitateWidth = (fullWidth / 2) / 2;
    const dataLocNastereWidth = fullWidth - nationalitateWidth;
    doc.rect(marginLeft, y, dataLocNastereWidth, 16);
    doc.text(dataLocNastere, marginLeft + 150, y + 10);
    doc.rect(marginLeft + dataLocNastereWidth + 10, y, nationalitateWidth + 10, 16);
    doc.text(nationalitate, width - 140, y + 12);

    y += 28;
    doc.text("(Data si locul nasterii)", marginLeft + 150, y);
    doc.text("(Nationalitatea)", width - 140, y);

    y += 29;
    const blockHeight = 40;
    const blockWidth = width - 2 * marginLeft;
    doc.rect(marginLeft, y, blockWidth, blockHeight);
    const labelColWidth = 150;
    doc.line(marginLeft, y + blockHeight / 2, marginLeft + blockWidth, y + blockHeight / 2);
    doc.line(marginLeft + labelColWidth, y, marginLeft + labelColWidth, y + blockHeight);
    doc.text("Numele si prenumele", marginLeft + 2, y - 5);
    doc.text("tatalui", marginLeft + 5, y + 14);
    doc.text("mamei", marginLeft + 5, y + blockHeight / 2 + 14);
    doc.text(numeTata, marginLeft + labelColWidth + 5, y + 14);
    doc.text(numeMama, marginLeft + labelColWidth + 5, y + blockHeight / 2 + 14);

    y += blockHeight + 20;
    const domBlockHeight = 40;
    doc.rect(marginLeft, y + 9, blockWidth, domBlockHeight);
    doc.line(marginLeft + labelColWidth, y + 9, marginLeft + labelColWidth, y + domBlockHeight + 9);
    doc.line(marginLeft, y + domBlockHeight / 2 + 9, marginLeft + blockWidth, y + domBlockHeight / 2 + 9);
    doc.text("Domiciliul", marginLeft + 2, y + 4);
    doc.text("parintilor", marginLeft + 5, y + 23);
    doc.text("elevului", marginLeft + 5, y + domBlockHeight / 2 + 23);
    doc.text(domiciliuParinti, marginLeft + labelColWidth + 5, y + 23);
    doc.text(domiciliuElev, marginLeft + labelColWidth + 5, y + domBlockHeight / 2 + 23);

    y += 78;
    let colWidths = [110, 40, 60, 50, 95, 80, 120];
    let colX = [marginLeft];
    for (let i = 0; i < colWidths.length - 1; i++) {
        colX.push(colX[i] + colWidths[i]);
    }
    doc.setFont("Times", "Bold");
    doc.setFontSize(12);
    doc.text("a) Situatia scolara generala", marginLeft, y);

    y += 10;
    let headerHeight = 12;
    let subHeaderHeight = 12;
    doc.setFontSize(10);
    doc.setFont("Times", "Bold");
    doc.rect(colX[0], y, colWidths[0], headerHeight + subHeaderHeight);
    doc.text("Unitatea de invatamant", colX[0] + 4, y + 15);
    doc.rect(colX[1], y, colWidths[1] + colWidths[2] + colWidths[3], headerHeight);
    doc.text("Volum matricol", colX[1] + 35, y + 9);
    doc.rect(colX[4], y, colWidths[4], headerHeight + subHeaderHeight);
    doc.text(["Anul si forma", "de invatamant"], colX[4] + 15, y + 9);
    doc.rect(colX[5], y, colWidths[5], headerHeight + subHeaderHeight);
    doc.text("Anul scolar", colX[5] + 15, y + 15);
    doc.rect(colX[6], y, colWidths[6], headerHeight + subHeaderHeight);
    doc.text("Observatii *", colX[6] + 19, y + 15);
    doc.setFont("Times", "Normal");
    doc.rect(colX[1], y + headerHeight, colWidths[1], subHeaderHeight);
    doc.text("Nr. pag", colX[1] + 3, y + headerHeight + 9);
    doc.rect(colX[2], y + headerHeight, colWidths[2], subHeaderHeight);
    doc.text("Nr. matricol", colX[2] + 3, y + headerHeight + 9);
    doc.rect(colX[3], y + headerHeight, colWidths[3], subHeaderHeight);
    doc.text("Nr. volum", colX[3] + 3, y + headerHeight + 9);

    let dataRowHeight = 20;
    let rows = 4;
    colWidths = [110, 40, 60, 50, 47, 48, 80, 120];
    colX = [marginLeft];
    for (let i = 0; i < colWidths.length - 1; i++) {
        colX.push(colX[i] + colWidths[i]);
    }
    for (let r = 0; r < rows; r++) {
        for (let i = 0; i < colWidths.length; i++) {
            doc.rect(colX[i], y + headerHeight + subHeaderHeight + r * dataRowHeight, colWidths[i], dataRowHeight);
            doc.text(``, colX[i] + 5, (y + headerHeight + subHeaderHeight + r * dataRowHeight + (dataRowHeight - 10) / 2) + 7);
        }
    }

    const footerText = '* Se va mentiona, daca este cazul, tipul de clasa absolvita (invatamant de arta, sportiv, special, in cadrul programului "A doua sansa" etc.)';
    doc.setFont("Times", "Normal");
    doc.setFontSize(10);
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.text(footerText, width / 2, pageHeight - 20, { align: "center" });
    doc.addPage();

    y = 40;
    doc.setFont("Times", "Bold");
    doc.setFontSize(12);
    doc.text("b) Situatia scolara pe discipline de invatamant", marginLeft, y);

    y += 15;
    colWidths = [315, 60, 60, 60, 60];
    colX = [marginLeft];
    for (let i = 0; i < colWidths.length - 1; i++) {
        colX.push(colX[i] + colWidths[i]);
    }
    headerHeight = 54;
    subHeaderHeight = 18;
    doc.rect(colX[0], y, colWidths[0], headerHeight);
    doc.setFontSize(13);
    doc.setFont("Times", "Bold");
    doc.text("Disciplinele de invatamant", colX[0] + 20, y + 30);

    doc.rect(colX[1], y, colWidths[1] * 4, subHeaderHeight);
    doc.text("Media pe ani de studii", colX[1] + 75, y + 12);

    doc.setFontSize(10);
    doc.rect(colX[1], y + subHeaderHeight, colWidths[1], subHeaderHeight);
    doc.text("1", colX[1] + 4, y + subHeaderHeight + 12);
    doc.rect(colX[2], y + subHeaderHeight, colWidths[2], subHeaderHeight);
    doc.text("2", colX[2] + 4, y + subHeaderHeight + 12);
    doc.rect(colX[3], y + subHeaderHeight, colWidths[3], subHeaderHeight);
    doc.text("3", colX[3] + 4, y + subHeaderHeight + 12);
    doc.rect(colX[4], y + subHeaderHeight, colWidths[4], subHeaderHeight);
    doc.text("4", colX[4] + 4, y + subHeaderHeight + 12);

    doc.rect(colX[1], y + subHeaderHeight, colWidths[1], subHeaderHeight + subHeaderHeight);
    doc.text("V", colX[1] + 4, y + subHeaderHeight + subHeaderHeight + 12);
    doc.rect(colX[2], y + subHeaderHeight, colWidths[2], subHeaderHeight + subHeaderHeight);
    doc.text("VI", colX[2] + 4, y + subHeaderHeight + subHeaderHeight + 12);
    doc.rect(colX[3], y + subHeaderHeight, colWidths[3], subHeaderHeight + subHeaderHeight);
    doc.text("VII", colX[3] + 4, y + subHeaderHeight + subHeaderHeight + 12);
    doc.rect(colX[4], y + subHeaderHeight, colWidths[4], subHeaderHeight + subHeaderHeight);
    doc.text("VIII", colX[4] + 4, y + subHeaderHeight + subHeaderHeight + 12);
    doc.setFont("Times", "Normal");

    dataRowHeight = 18;
    rows = 25;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < colWidths.length; j++) {
            doc.rect(colX[j], y + headerHeight + i * dataRowHeight, colWidths[j], dataRowHeight);
            doc.text(``, colX[j] + 5, (y + headerHeight + i * dataRowHeight + (dataRowHeight - 10) / 2) + 9);
        }
    }

    y += (dataRowHeight * rows) + 70;
    doc.setFontSize(12);
    doc.setFont("Times", "Bold");
    doc.text("c) Mentiuni privind performantele obtinute, anii de repetentie, amanare medicala, respingere la examenul", marginLeft, y);
    doc.text("de absolvire etc.", marginLeft, y + 15);

    y += 20;
    doc.rect(marginLeft, y, 555, 80);
    y += 110;
    doc.setFontSize(12);
    doc.setFont("Times", "Normal");
    doc.text("Se certifica exactitatea datelor din prezenta foaie matricola.", marginLeft, y);
    doc.text("DIRECTOR", marginLeft + 110, y + 25);
    doc.text("SECRETAR SEF", marginLeft + 410, y + 25);
    doc.text("L. S.", marginLeft, y + 65);


    doc.save(`${nume}foaie_matricola.pdf`);
};
