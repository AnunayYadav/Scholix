import { PDFDocument } from 'pdf-lib';

/**
 * Merges multiple PDF File objects into a single PDF File.
 * 
 * @param files Array of PDF File objects to merge in sequence
 * @param outputFileName Desired name for the merged PDF (e.g. "Unit 1.pdf")
 * @returns Promise resolving to the merged File object
 */
export async function mergePDFFiles(files: File[], outputFileName: string): Promise<File> {
  if (!files || files.length === 0) {
    throw new Error('No PDF files provided for merging.');
  }

  if (files.length === 1) {
    return files[0];
  }

  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    } catch (err) {
      console.error(`Failed to load or copy pages from file ${file.name}:`, err);
      throw new Error(`Unable to read "${file.name}". Please ensure it is a valid PDF.`);
    }
  }

  const pdfBytes = await mergedPdf.save();
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  
  let cleanName = outputFileName.trim() || 'Merged_Document';
  if (!cleanName.toLowerCase().endsWith('.pdf')) {
    cleanName += '.pdf';
  }

  return new File([blob], cleanName, { type: 'application/pdf', lastModified: Date.now() });
}
