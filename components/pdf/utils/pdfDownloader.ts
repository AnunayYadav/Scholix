import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { LibraryFile, UserProfile } from '../../../types.ts';
import NexusServer from '../../../services/nexusServer.ts';
import { showToast } from '../../Toast.tsx';

/**
 * Sanitizes PDF bytes by finding the first occurrence of %PDF- header
 * (0x25, 0x50, 0x44, 0x46, 0x2D) and trimming any BOM or preamble bytes.
 */
export const sanitizePdfBytes = (bytes: Uint8Array): Uint8Array => {
    if (!bytes || bytes.length < 5) return bytes;
    if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2D) {
        return bytes;
    }
    const pdfHeaderPattern = [0x25, 0x50, 0x44, 0x46, 0x2D];
    const searchLimit = Math.min(bytes.length - 4, 4096);
    for (let i = 0; i < searchLimit; i++) {
        if (
            bytes[i] === pdfHeaderPattern[0] &&
            bytes[i + 1] === pdfHeaderPattern[1] &&
            bytes[i + 2] === pdfHeaderPattern[2] &&
            bytes[i + 3] === pdfHeaderPattern[3] &&
            bytes[i + 4] === pdfHeaderPattern[4]
        ) {
            return bytes.subarray(i);
        }
    }
    return bytes;
};

export interface DownloadOptions {
    url?: string;
    fileId?: string;
    file?: LibraryFile;
    displayFileName: string;
    fileName: string;
    userProfile?: UserProfile | null;
    isAdmin: boolean;
    isDocx: boolean;
    isLegacyDoc: boolean;
    isImage: boolean;
    pdfBytes?: Uint8Array | null;
}

export const executeSecureDownload = async (options: DownloadOptions): Promise<void> => {
    const {
        url,
        fileId,
        file,
        displayFileName,
        fileName,
        userProfile,
        isAdmin,
        isDocx,
        isLegacyDoc,
        isImage,
        pdfBytes
    } = options;

    if (!url && !file && !pdfBytes) return;

    const STORAGE_KEY = 'nexus_pdf_downloads';
    const today = new Date().toISOString().split('T')[0];

    // Check daily download quota
    if (!isAdmin) {
        try {
            const records = await NexusServer.fetchRecords(userProfile ? userProfile.id : null, 'pdf_download');
            const todayStr = new Date().toDateString();
            const todayDownloads = records.filter(r => {
                if (!r.created_at) return false;
                return new Date(r.created_at).toDateString() === todayStr;
            });

            if (todayDownloads.length >= 3) {
                showToast('Daily limit (3 downloads) reached. Please try again tomorrow.', 'error');
                return;
            }
        } catch (e) {
            console.warn("Could not check download history from registry, falling back to local cache", e);
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.date === today && parsed.count >= 3) {
                    showToast('Daily limit (3 downloads) reached. Please try again tomorrow.', 'error');
                    return;
                }
            }
        }
    }

    try {
        showToast('Preparing Secure Download...', 'info');

        let originalPdfBytes: Uint8Array | null = pdfBytes || null;

        if (!originalPdfBytes || originalPdfBytes.length === 0) {
            if (file) {
                const client = NexusServer.getClient();
                if (client) {
                    try {
                        const { data, error } = await client.storage.from('nexus-documents').download(file.storage_path);
                        if (!error && data) {
                            const buffer = await data.arrayBuffer();
                            originalPdfBytes = new Uint8Array(buffer);
                        }
                    } catch (e) {
                        console.warn("Direct download failed in download handler, trying proxy...", e);
                    }
                }
                if (!originalPdfBytes) {
                    const sessionRes = await NexusServer.getSession();
                    const token = sessionRes?.data?.session?.access_token;
                    const resolvedUrl = NexusServer.getFileUrl(file.storage_path, token);
                    if (resolvedUrl) {
                        const resp = await fetch(resolvedUrl, {
                            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                        });
                        if (resp.ok) {
                            const buffer = await resp.arrayBuffer();
                            originalPdfBytes = new Uint8Array(buffer);
                        }
                    }
                }
            } else if (url) {
                const sessionRes = await NexusServer.getSession();
                const token = sessionRes?.data?.session?.access_token;
                const fetchOptions: RequestInit = {};
                if (!url.startsWith('blob:') && token) {
                    fetchOptions.headers = { 'Authorization': `Bearer ${token}` };
                }
                const pdfResponse = await fetch(url, fetchOptions);
                if (pdfResponse.ok) {
                    const fetchedArrayBuffer = await pdfResponse.arrayBuffer();
                    originalPdfBytes = new Uint8Array(fetchedArrayBuffer);
                } else {
                    let errorMsg = "Vault re-verification failed.";
                    try {
                        const errJson = await pdfResponse.json();
                        if (errJson && (errJson.error || errJson.message)) {
                            errorMsg = `Vault error: ${errJson.error || errJson.message}`;
                        }
                    } catch (_) {}
                    throw new Error(errorMsg);
                }
            }
        }

        if (!originalPdfBytes || originalPdfBytes.length === 0) {
            throw new Error("Unable to retrieve document source file.");
        }

        // Direct download for Word Docs, Images, or non-PDF files
        if (isDocx || isLegacyDoc || isImage || !displayFileName.toLowerCase().endsWith('.pdf')) {
            const downloadBlob = new Blob([originalPdfBytes as any]);
            const blobUrl = URL.createObjectURL(downloadBlob);
            const link = document.createElement('a');
            link.href = blobUrl;
            const downloadName = displayFileName || fileName || 'document';
            link.setAttribute('download', downloadName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

            if (!isAdmin) {
                try {
                    await NexusServer.saveRecord(
                        userProfile ? userProfile.id : null,
                        'pdf_download',
                        `Downloaded ${downloadName}`,
                        { fileId: fileId || (file ? file.id : undefined), fileName: downloadName }
                    );
                } catch (dbErr) {
                    console.error("Failed to save download record to registry:", dbErr);
                }
            }

            showToast('Download Verified & Complete.', 'success');
            return;
        }

        // Sanitize PDF bytes
        originalPdfBytes = sanitizePdfBytes(originalPdfBytes);

        const isPdfHeaderPresent = (
            originalPdfBytes.length >= 5 &&
            originalPdfBytes[0] === 0x25 &&
            originalPdfBytes[1] === 0x50 &&
            originalPdfBytes[2] === 0x44 &&
            originalPdfBytes[3] === 0x46 &&
            originalPdfBytes[4] === 0x2D
        );

        if (!isPdfHeaderPresent) {
            const textPreview = new TextDecoder().decode(originalPdfBytes.subarray(0, 300)).trim();
            if (textPreview.startsWith('{') || textPreview.startsWith('[')) {
                try {
                    const errJson = JSON.parse(textPreview);
                    throw new Error(errJson.error || errJson.message || "Server returned an error response.");
                } catch (e: any) {
                    if (e.message && !e.message.startsWith("JSON")) throw e;
                }
            } else if (textPreview.toLowerCase().includes('<html') || textPreview.toLowerCase().includes('<!doctype')) {
                throw new Error("Document session expired or invalid server response.");
            }
            throw new Error("Invalid document format: No PDF header found.");
        }

        let downloadBlob: Blob;

        try {
            let coverImageBytes: ArrayBuffer | null = null;
            try {
                const coverResponse = await fetch('/pdfcover.png');
                if (coverResponse.ok) {
                    coverImageBytes = await coverResponse.arrayBuffer();
                }
            } catch (coverErr) {
                console.warn("Cover image fetch skipped:", coverErr);
            }

            const originalPdf = await PDFDocument.load(originalPdfBytes, { ignoreEncryption: true });
            const finalPdf = await PDFDocument.create();

            const [firstPage] = await finalPdf.copyPages(originalPdf, [0]);
            finalPdf.addPage(firstPage);

            if (coverImageBytes) {
                const origFirstPage = originalPdf.getPage(0);
                const { width: pageWidth, height: pageHeight } = origFirstPage.getSize();
                const coverImage = await finalPdf.embedPng(coverImageBytes);
                const coverPage = finalPdf.addPage([pageWidth, pageHeight]);
                coverPage.drawImage(coverImage, {
                    x: 0,
                    y: 0,
                    width: pageWidth,
                    height: pageHeight,
                });
            }

            const pageIndicesToCopy: number[] = [];
            for (let i = 1; i < originalPdf.getPageCount(); i++) {
                pageIndicesToCopy.push(i);
            }
            if (pageIndicesToCopy.length > 0) {
                const remainingPages = await finalPdf.copyPages(originalPdf, pageIndicesToCopy);
                for (const page of remainingPages) {
                    finalPdf.addPage(page);
                }
            }

            const helveticaBoldFont = await finalPdf.embedFont(StandardFonts.HelveticaBold);
            const helveticaFont = await finalPdf.embedFont(StandardFonts.Helvetica);
            const watermarkText = 'SCHOLIX.APP';
            const watermarkSize = 36;
            const textWidth = helveticaBoldFont.widthOfTextAtSize(watermarkText, watermarkSize);
            const textHeight = helveticaBoldFont.heightAtSize(watermarkSize);

            for (let i = 0; i < finalPdf.getPageCount(); i++) {
                const page = finalPdf.getPage(i);
                const { width, height } = page.getSize();
                const rad45 = (45 * Math.PI) / 180;
                const cxRel = (textWidth / 2) * Math.cos(rad45) - (textHeight / 2) * Math.sin(rad45);
                const cyRel = (textWidth / 2) * Math.sin(rad45) + (textHeight / 2) * Math.cos(rad45);
                const x0 = (width / 2) - cxRel;
                const y0 = (height / 2) - cyRel;

                page.drawText(watermarkText, {
                    x: x0,
                    y: y0,
                    size: watermarkSize,
                    font: helveticaBoldFont,
                    color: rgb(0.7, 0.7, 0.7),
                    opacity: 0.12,
                    rotate: degrees(45),
                });

                const footerText = 'Downloaded from scholix.app | Secure Learning Platform';
                const footerSize = 8;
                const footerWidth = helveticaFont.widthOfTextAtSize(footerText, footerSize);

                page.drawText(footerText, {
                    x: (width - footerWidth) / 2,
                    y: 20,
                    size: footerSize,
                    font: helveticaFont,
                    color: rgb(0.5, 0.5, 0.5),
                    opacity: 0.4,
                });
            }

            const finalPdfBytes = await finalPdf.save();
            downloadBlob = new Blob([finalPdfBytes as any], { type: 'application/pdf' });
        } catch (pdfLibErr) {
            console.warn("pdf-lib enhancement failed, falling back to raw PDF bytes download:", pdfLibErr);
            downloadBlob = new Blob([originalPdfBytes as any], { type: 'application/pdf' });
        }

        const blobUrl = URL.createObjectURL(downloadBlob);
        const link = document.createElement('a');
        link.href = blobUrl;
        const baseName = (displayFileName || fileName || 'document.pdf').replace(/\.pdf$/i, '');
        const downloadName = `(scholix.app) ${baseName}.pdf`;
        link.setAttribute('download', downloadName);
        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

        if (!isAdmin) {
            try {
                await NexusServer.saveRecord(
                    userProfile ? userProfile.id : null,
                    'pdf_download',
                    `Downloaded ${fileName}`,
                    { fileId: fileId || (file ? file.id : undefined), fileName: fileName }
                );
            } catch (dbErr) {
                console.error("Failed to save download record to registry:", dbErr);
            }

            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                let count = 0;
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed.date === today) count = parsed.count;
                }
                localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: count + 1 }));
            } catch (e) {
                console.warn("Could not update download history", e);
            }
        }

        showToast('Download Verified & Complete.', 'success');
    } catch (err: any) {
        console.error("Download failure:", err);
        showToast(err?.message || 'Download Blocked: Protocol Fault.', 'error');
    }
};
