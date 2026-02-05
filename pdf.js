import fs from "fs/promises";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function brandPdf({ inputPath, logoPath, outputPath, contactText }) {
  const pdfBytes = await fs.readFile(inputPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const logoBytes = await fs.readFile(logoPath);
  const logo = await pdfDoc.embedPng(logoBytes);

  const pages = pdfDoc.getPages();
  for (const page of pages) {
    const { width, height } = page.getSize();

    const logoW = 80;
    const logoH = (logo.height / logo.width) * logoW;
    page.drawImage(logo, { x: 20, y: height - logoH - 20, width: logoW, height: logoH });

    page.drawText(contactText, {
      x: 20,
      y: 20,
      size: 10,
      font,
      color: rgb(0, 0, 0)
    });
  }

  const out = await pdfDoc.save();
  await fs.writeFile(outputPath, out);
}
