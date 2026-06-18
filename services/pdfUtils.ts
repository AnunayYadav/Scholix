const ensurePdfJs = async (): Promise<any> => {
  const pdfjsLib = (window as any).pdfjsLib;
  if (pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    return pdfjsLib;
  }
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src="/pdf.min.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        const lib = (window as any).pdfjsLib;
        lib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
        resolve(lib);
      });
      existingScript.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = '/pdf.min.js';
    script.onload = () => {
      const lib = (window as any).pdfjsLib;
      lib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      resolve(lib);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

/**
 * Extracts text from a PDF file using the PDF.js library loaded in index.html.
 */
export const extractTextFromPdf = async (file: File): Promise<string> => {
  if (file.type === "text/plain") {
    return await file.text();
  }

  if (file.type !== "application/pdf") {
    throw new Error("Unsupported file type. Please upload a PDF or TXT file.");
  }

  try {
    const pdfjsLib = await ensurePdfJs();
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