import { PDFDocument } from 'pdf-lib';
import jsPDF from 'jspdf';

/**
 * Checks if a file is an image based on name extension or MIME type.
 */
export function isImageFile(fileName: string, mimeType?: string): boolean {
  if (mimeType && mimeType.startsWith('image/')) return true;
  return /\.(jpg|jpeg|png|webp|gif|bmp|heic|tiff|svg)$/i.test(fileName);
}

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

/**
 * Converts single or multiple Image File objects (JPG, PNG, WEBP, GIF, BMP, etc.)
 * into a single multi-page PDF File.
 * 
 * @param files Array of image File objects to convert
 * @param outputFileName Desired name for output PDF file
 * @returns Promise resolving to the converted PDF File object
 */
export async function convertImagesToPdf(files: File[], outputFileName: string): Promise<File> {
  if (!files || files.length === 0) {
    throw new Error('No image files provided for PDF conversion.');
  }

  const doc = new jsPDF({
    unit: 'mm',
    compress: true
  });

  let isFirstPage = true;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const imgDataUrl = await readImageAsDataUrl(file);
    const dimensions = await getImageDimensions(imgDataUrl);

    // Calculate dimensions in mm (standard width 210mm for A4 scale)
    const aspect = dimensions.width / dimensions.height;
    const pageWidth = 210;
    const pageHeight = 210 / aspect;
    const orientation = dimensions.width >= dimensions.height ? 'landscape' : 'portrait';

    if (isFirstPage) {
      doc.deletePage(1); // remove default initial blank page
      doc.addPage([pageWidth, pageHeight], orientation);
      isFirstPage = false;
    } else {
      doc.addPage([pageWidth, pageHeight], orientation);
    }

    doc.addImage(imgDataUrl, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
  }

  const pdfArrayBuffer = doc.output('arraybuffer');
  const blob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });

  let cleanName = outputFileName.trim() || 'Converted_Document';
  if (!cleanName.toLowerCase().endsWith('.pdf')) {
    cleanName += '.pdf';
  }

  return new File([blob], cleanName, { type: 'application/pdf', lastModified: Date.now() });
}

/**
 * Helper to read image File, render onto canvas with white background, and return JPEG DataURL
 */
function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const rawResult = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 800;
        canvas.height = img.naturalHeight || img.height || 600;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawResult);
          return;
        }
        // Fill white background (handles transparent PNGs nicely)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      };
      img.onerror = () => resolve(rawResult);
      img.src = rawResult;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Helper to get natural dimensions of image DataURL
 */
function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth || 800,
        height: img.naturalHeight || 600
      });
    };
    img.onerror = () => {
      resolve({ width: 800, height: 600 });
    };
    img.src = dataUrl;
  });
}

