import jsPDF from "jspdf";

export const generateTranscriptPDF = (cif: string, nume: string, cnp: string,
	nationalitate: string, dataLocNastere: string, numeTata: string, numeMama: string,
	domiciliuParinti: string, domiciliuElev: string, materiiSiNote: string[]
) => {
	console.log(materiiSiNote);
	const doc = new jsPDF({
		orientation: "portrait",
		unit: "pt",
		format: "A4",
	});

	const width = doc.internal.pageSize.getWidth();
	const marginLeft = 20;
	let y = 40;

	doc.setFont("Times", "Bold");
	doc.setFontSize(14);
	doc.text("ROMANIA", width / 2, y, { align: "center" });
	y += 14;
	doc.text("MINISTERUL EDUCATIEI NATIONALE*", width / 2, y, { align: "center" });

	y += 20;
	doc.setFont("Times", "Normal");
	doc.setFontSize(11);
	doc.text("(Unitatea de invatamant)", width / 2, y, { align: "center" });

	y += 24;
	doc.setFontSize(12);
	doc.text("Codul CIF", marginLeft, y);
	doc.rect(marginLeft + 60, y - 12, 20 * 10, 16);
	doc.text(cif, marginLeft + 65, y);

	y += 34;
	doc.setFont("Times", "Bold");
	doc.setFontSize(16);
	doc.text("FOAIE MATRICOLA", width / 2, y, { align: "center" });

	y += 16;
	doc.setFontSize(13);
	doc.text("pentru clasele IX - XII (XIII)", width / 2, y, { align: "center" });

	y += 26;
	doc.setFont("Times", "Normal");
	doc.setFontSize(11);
	doc.text("(numele si prenumele)", width / 2, y, { align: "center" });
	y += 16;
	doc.rect(marginLeft, y - 12, width - 2 * marginLeft, 18);
	doc.text(nume, marginLeft + 5, y + 2);

	y += 26;
	doc.text("Cod Numeric Personal", marginLeft, y);
	doc.rect(marginLeft + 120, y - 12, 14 * 12, 16);
	doc.text(cnp, marginLeft + 125, y);

	y += 23;
	doc.text("(Data si locul nasterii)", marginLeft, y);
	doc.text("(Nationalitatea)", width - 285, y);
	y += 5;
	doc.rect(marginLeft, y, width / 2 - marginLeft - 20, 16);
	doc.text(dataLocNastere, marginLeft + 290, y + 10);
	doc.rect(width / 2 + 10, y, width / 2 - marginLeft - 20, 16);
	doc.text(nationalitate, marginLeft + 5, y + 10);

	y += 29;
	doc.text("Numele si prenumele tatalui", marginLeft, y);
	y += 5;
	doc.rect(marginLeft, y, width - 2 * marginLeft, 16);
	doc.text(numeTata, marginLeft + 5, y + 10);

	y += 29;
	doc.text("Numele si prenumele mamei", marginLeft, y);
	y += 5;
	doc.rect(marginLeft, y, width - 2 * marginLeft, 16);
	doc.text(numeMama, marginLeft + 5, y + 10);

	y += 29;
	doc.text("Domiciliul parintilor", marginLeft, y);
	y += 5;
	doc.rect(marginLeft, y, width - 2 * marginLeft, 16);
	doc.text(domiciliuParinti, marginLeft + 5, y + 10);

	y += 29;
	doc.text("Domiciliul elevului", marginLeft, y);
	y += 5;
	doc.rect(marginLeft, y, width - 2 * marginLeft, 16);
	doc.text(domiciliuElev, marginLeft + 5, y + 10);

	y += 36;
	doc.setFont("Times", "Bold");
	doc.setFontSize(12);
	doc.text(" Situatia scolara generala", marginLeft, y);

	y += 15;

	const colWidths = [110, 40, 60, 50, 95, 80, 120];
	const colX = [marginLeft];
	for (let i = 0; i < colWidths.length - 1; i++) {
		colX.push(colX[i] + colWidths[i]);
	}

	const headerHeight = 12;
	const subHeaderHeight = 12;

	doc.setFontSize(10);
	doc.setFont("Times", "Bold");

	doc.rect(colX[0], y, colWidths[0], headerHeight + subHeaderHeight);
	doc.text("Unitatea de invatamant", colX[0] + 2, y + 9);

	doc.rect(colX[1], y, colWidths[1] + colWidths[2] + colWidths[3], headerHeight);
	doc.text("Volum matricol", colX[1] + 35, y + 9);

	doc.rect(colX[4], y, colWidths[4], headerHeight + subHeaderHeight);
	doc.text(["Anul si forma", "de invatamant"], colX[4] + 15, y + 9);

	doc.rect(colX[5], y, colWidths[5], headerHeight + subHeaderHeight);
	doc.text("Anul scolar", colX[5] + 15, y + 9);

	doc.rect(colX[6], y, colWidths[6], headerHeight + subHeaderHeight);
	doc.text(["Filiera/Profil/Specializare/", "Calificare profesionala"], colX[6] + 2, y + 9);

	doc.setFont("Times", "Normal");
	doc.rect(colX[1], y + headerHeight, colWidths[1], subHeaderHeight);
	doc.text("Nr. pag", colX[1] + 3, y + headerHeight + 8);

	doc.rect(colX[2], y + headerHeight, colWidths[2], subHeaderHeight);
	doc.text("Nr. matricol", colX[2] + 3, y + headerHeight + 8);

	doc.rect(colX[3], y + headerHeight, colWidths[3], subHeaderHeight);
	doc.text("Nr. volum", colX[3] + 3, y + headerHeight + 8);

	const dataRowHeight = 20;
	const rows = 18;
	for (let r = 0; r < rows; r++) {
		for (let i = 0; i < colWidths.length; i++) {
			doc.rect(colX[i], y + headerHeight + subHeaderHeight + r * dataRowHeight, colWidths[i], dataRowHeight);
			doc.text(`${r}-${i}`, colX[i] + 5, (y + headerHeight + subHeaderHeight + r * dataRowHeight + (dataRowHeight - 10) / 2) + 7);
		}
	}

	y = y + headerHeight + subHeaderHeight + rows * dataRowHeight + 20;
	doc.setFontSize(10);
	doc.setFont("Times", "Italic");
	doc.text("* denumirea curenta a ministerului", marginLeft, y);

	doc.save("foaie_matricola.pdf");
};
