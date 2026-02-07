import fs from "fs/promises"; import { PDFDocument } from "pdf-lib";
export async function brandPdf({inputPath,logoPath,outputPath}){
  const pdf=await PDFDocument.load(await fs.readFile(inputPath));
  const logo=await pdf.embedPng(await fs.readFile(logoPath));
  for(const p of pdf.getPages()){ const {height}=p.getSize(); p.drawImage(logo,{x:20,y:height-100,width:80,height:40}); }
  await fs.writeFile(outputPath, await pdf.save());
}