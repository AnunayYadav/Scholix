import { PDFDocument } from 'pdf-lib';
import imageCompression from 'browser-image-compression';

/**
 * Optimizes a file (PDF or Image) before upload to save storage space.
 */
export async function optimizeFile(inputFile: File): Promise<{ file: File; originalSize: number; newSize: number; saved: number }> {
    const originalSize = inputFile.size;

    // Handle Images
    if (inputFile.type.startsWith('image/')) {
        try {
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true
            };
            const compressedBlob = await imageCompression(inputFile, options);
            // Create new file from compressed blob
            const newFile = new File([compressedBlob], inputFile.name, { type: inputFile.type });

            const saved = originalSize - newFile.size;
            return { file: saved > 0 ? newFile : inputFile, originalSize, newSize: newFile.size, saved: Math.max(0, saved) };
        } catch (error) {
            console.warn('Image Compression failed:', error);
            return { file: inputFile, originalSize, newSize: originalSize, saved: 0 };
        }
    }

    // Handle PDFs
    if (inputFile.type === 'application/pdf') {
        try {
            const arrayBuffer = await inputFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer, {
                ignoreEncryption: true,
                throwOnInvalidObject: false
            });

            // Basic structure optimization
            const optimizedBytes = await pdfDoc.save({
                useObjectStreams: true,
                addDefaultPage: false,
            });

            const newSize = optimizedBytes.length;
            const saved = originalSize - newSize;

            if (saved > 0) {
                // Use Blob as intermediate for better TS compatibility in some environments
                const optimizedBlob = new Blob([optimizedBytes], { type: 'application/pdf' });
                const optimizedFile = new File([optimizedBlob], inputFile.name, { type: 'application/pdf' });
                return { file: optimizedFile, originalSize, newSize, saved };
            }
        } catch (error) {
            console.warn('PDF Optimization bypassed:', error);
        }
    }

    return { file: inputFile, originalSize, newSize: originalSize, saved: 0 };
}
