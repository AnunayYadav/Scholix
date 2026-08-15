import jsPDF from 'jspdf';
import JSZip from 'jszip';

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function dataUrlToBlob(dataUrl: string): Blob {
  if (!dataUrl || !dataUrl.includes(',')) {
    return new Blob([], { type: 'application/pdf' });
  }
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
  try {
    const bstr = window.atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    return new Blob([], { type: 'application/pdf' });
  }
}

function pathBasename(pathStr: string): string {
  const parts = pathStr.split(/[/\\]/);
  return parts[parts.length - 1] || pathStr;
}

interface SlideContent {
  slideNumber: number;
  title: string;
  texts: string[];
}

export async function convertPptToPdf(file: File): Promise<File> {
  const isPpt = /\.(ppt|pptx)$/i.test(file.name);
  if (!file || !isPpt || file.size === 0) {
    return file;
  }

  const pdfName = file.name.replace(/\.(ppt|pptx)$/i, '') + '.pdf';

  // 1. Try Serverless / Cloud LibreOffice Engine API Route (100% exact visual layout)
  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = arrayBufferToBase64(arrayBuffer);

    const response = await fetch('/api/convert-ppt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileData: base64Data,
        fileName: file.name
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.fileData) {
        const pdfBlob = dataUrlToBlob(data.fileData);
        if (pdfBlob.size > 2000) {
          return new File([pdfBlob], pdfName, { type: 'application/pdf', lastModified: Date.now() });
        }
      }
    }
  } catch (err) {
    console.warn('Server PPT converter endpoint unavailable, using client-side PPTX parser:', err);
  }

  // 2. Client-side PPTX ZIP parser & PDF generator
  try {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Extract slide media images from ppt/media/
    const mediaImages: Record<string, { base64: string; format: string }> = {};
    const mediaFiles = zip.file(/^ppt\/media\/.+/i);
    for (const imgFile of mediaFiles) {
      const imgName = pathBasename(imgFile.name);
      const ext = imgName.split('.').pop()?.toLowerCase() || '';
      let format = 'JPEG';
      let mime = 'image/jpeg';
      if (ext === 'png') { format = 'PNG'; mime = 'image/png'; }
      else if (ext === 'gif') { format = 'GIF'; mime = 'image/gif'; }
      else if (ext === 'webp') { format = 'WEBP'; mime = 'image/webp'; }

      try {
        const imgBuffer = await imgFile.async('arraybuffer');
        if (imgBuffer.byteLength > 100) {
          const imgBase64 = arrayBufferToBase64(imgBuffer);
          mediaImages[imgName] = {
            base64: `data:${mime};base64,${imgBase64}`,
            format
          };
        }
      } catch (e) {}
    }

    const slideFiles: { name: string; num: number; file: JSZip.JSZipObject }[] = [];
    zip.forEach((relativePath, fileObj) => {
      const match = relativePath.match(/^ppt\/slides\/slide(\d+)\.xml$/i);
      if (match) {
        slideFiles.push({
          name: relativePath,
          num: parseInt(match[1], 10),
          file: fileObj
        });
      }
    });

    slideFiles.sort((a, b) => a.num - b.num);

    const slides: SlideContent[] = [];

    for (const slideItem of slideFiles) {
      try {
        const xmlText = await slideItem.file.async('text');
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlText, 'text/xml');
        
        const paragraphs = Array.from(doc.getElementsByTagName('a:p'));
        const slideTexts: string[] = [];

        for (const p of paragraphs) {
          const textNodes = Array.from(p.getElementsByTagName('a:t'));
          const lineStr = textNodes.map(t => t.textContent || '').join(' ').trim();
          if (lineStr && !lineStr.startsWith('<') && !lineStr.includes('a:') && !lineStr.includes('p:')) {
            slideTexts.push(lineStr);
          }
        }

        const title = slideTexts.length > 0 ? slideTexts[0] : `Slide ${slideItem.num}`;
        const bodyTexts = slideTexts.length > 0 ? slideTexts.slice(1) : [];

        slides.push({
          slideNumber: slideItem.num,
          title,
          texts: bodyTexts
        });
      } catch (slideErr) {
        console.warn(`Failed to parse slide ${slideItem.num}:`, slideErr);
      }
    }

    if (slides.length > 0) {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: [960, 540]
      });

      const allMediaImages = Object.values(mediaImages);

      for (let idx = 0; idx < slides.length; idx++) {
        if (idx > 0) {
          pdf.addPage([960, 540], 'landscape');
        }

        const slide = slides[idx];

        // Dark Slide Background
        pdf.setFillColor(15, 15, 18);
        pdf.rect(0, 0, 960, 540, 'F');

        // Top Header Accent Bar
        pdf.setFillColor(255, 122, 0);
        pdf.rect(40, 36, 6, 32, 'F');

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');

        const titleText = slide.title.length > 65 ? slide.title.substring(0, 62) + '...' : slide.title;
        pdf.text(titleText, 56, 58);

        pdf.setDrawColor(40, 40, 48);
        pdf.setLineWidth(1);
        pdf.line(40, 80, 920, 80);

        const slideImg = allMediaImages[idx % Math.max(1, allMediaImages.length)];
        const hasImg = !!slideImg && allMediaImages.length > 0;
        const textWidth = hasImg ? 500 : 830;

        let currentY = 115;
        pdf.setTextColor(220, 220, 230);
        pdf.setFontSize(13);
        pdf.setFont('helvetica', 'normal');

        if (slide.texts.length === 0) {
          pdf.setTextColor(140, 140, 150);
          pdf.setFontSize(12);
          pdf.text('• [Slide visual content / diagram]', 56, currentY);
        } else {
          for (const lineText of slide.texts) {
            if (currentY > 460) break;

            pdf.setFillColor(255, 122, 0);
            pdf.circle(60, currentY - 4, 3, 'F');

            const wrapped = pdf.splitTextToSize(lineText, textWidth);
            pdf.text(wrapped, 72, currentY);
            currentY += (wrapped.length * 18) + 10;
          }
        }

        if (hasImg) {
          try {
            pdf.addImage(slideImg.base64, slideImg.format, 580, 110, 320, 240, undefined, 'FAST');
          } catch (e) {}
        }

        // Slide Footer
        pdf.setTextColor(100, 100, 110);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Scholix Presentation Reader • Slide ${idx + 1} of ${slides.length}`, 56, 515);
        pdf.text(file.name.substring(0, 50), 904, 515, { align: 'right' });
      }

      const pdfBlob = pdf.output('blob');
      if (pdfBlob && pdfBlob.size > 2000) {
        return new File([pdfBlob], pdfName, { type: 'application/pdf', lastModified: Date.now() });
      }
    }
  } catch (err: any) {
    console.error('Client PPTX ZIP Parser error:', err);
  }

  // Safety Fallback: Return original file if conversion failed or produced corrupted file
  return file;
}
