/**
 * Extracts text from a PDF file using the PDF.js library loaded via CDN in index.html.
 * Includes a guard to wait for PDF.js to be available (loaded asynchronously as ES module).
 */

const getPdfJs = async (): Promise<any> => {
  if (window.pdfjsLib) return window.pdfjsLib;
  return new Promise((resolve, reject) => {
    const onReady = () => resolve(window.pdfjsLib);
    window.addEventListener('pdfjsReady', onReady, { once: true });
    setTimeout(() => {
      window.removeEventListener('pdfjsReady', onReady);
      if (window.pdfjsLib) {
        resolve(window.pdfjsLib);
      } else {
        reject(new Error('PDF.js is not available. Please refresh the page.'));
      }
    }, 15000);
  });
};

export const extractTextFromPdf = async (file: File): Promise<string> => {
  if (file.type === "text/plain") {
    return await file.text();
  }

  if (file.type !== "application/pdf") {
    throw new Error("Unsupported file type. Please upload a PDF or TXT file.");
  }

  try {
    const pdfjsLib = await getPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    return fullText;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Failed to extract text from PDF. Ensure the file is not corrupted.");
  }
};