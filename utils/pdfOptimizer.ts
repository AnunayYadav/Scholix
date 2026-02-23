import { PDFDocument } from 'pdf-lib';
import imageCompression from 'browser-image-compression';

/**
 * Optimizes a file (PDF or Image) before upload to save storage space.
 */
export async function optimizeFile(inputFile: File): Promise<{ file: File; originalSize: number; newSize: number; saved: number }> {
    const originalSize = inputFile.size;

    // Handle Images (JPEG, PNG, WebP)
    if (inputFile.type.startsWith('image/')) {
        try {
            const options = {
                maxSizeMB: 0.8, // Slightly more aggressive
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                initialQuality: 0.8
            };
            const compressedBlob = await imageCompression(inputFile, options);
            const newFile = new File([compressedBlob], inputFile.name, { type: inputFile.type });

            const saved = originalSize - newFile.size;
            return { file: saved > 0 ? newFile : inputFile, originalSize, newSize: newFile.size, saved: Math.max(0, saved) };
        } catch (error) {
            console.warn('Image Compression failed:', error);
            return { file: inputFile, originalSize, newSize: originalSize, saved: 0 };
        }
    }

    // Handle PDFs (Aggressive Rebuild Strategy)
    if (inputFile.type === 'application/pdf') {
        try {
            const arrayBuffer = await inputFile.arrayBuffer();

            // Load the original PDF
            const pdfDoc = await PDFDocument.load(arrayBuffer, {
                ignoreEncryption: true,
                throwOnInvalidObject: false
            });

            // Create a fresh PDF document
            const optimizedDoc = await PDFDocument.create();

            // Copy pages to the new document (This strips unused objects and redundant metadata)
            const contentPages = await optimizedDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
            contentPages.forEach((page) => optimizedDoc.addPage(page));

            // Save with object streams and compression
            const optimizedBytes = await optimizedDoc.save({
                useObjectStreams: true,
                addDefaultPage: false,
            });

            const newSize = optimizedBytes.length;
            const saved = originalSize - newSize;

            // Only swap if we saved more than 1% of the file size (to avoid negligible changes)
            if (saved > (originalSize * 0.01)) {
                const optimizedBlob = new Blob([optimizedBytes], { type: 'application/pdf' });
                const optimizedFile = new File([optimizedBlob], inputFile.name, { type: 'application/pdf' });
                return { file: optimizedFile, originalSize, newSize, saved };
            }
        } catch (error) {
            console.warn('PDF Rebuild bypassed:', error);
        }
    }

    return { file: inputFile, originalSize, newSize: originalSize, saved: 0 };
}
