import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileData, fileName } = req.body || {};

    if (!fileData) {
      return res.status(400).json({ error: 'No PPT/PPTX file data provided.' });
    }

    const base64Content = fileData.includes(',') ? fileData.split(',')[1] : fileData;
    const inputBuffer = Buffer.from(base64Content, 'base64');

    const tmpDir = os.tmpdir();
    const uniqueId = Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const ext = path.extname(fileName || 'presentation.pptx') || '.pptx';
    const inputPath = path.join(tmpDir, `input_${uniqueId}${ext}`);

    await fs.promises.writeFile(inputPath, inputBuffer);

    let pdfBuffer: Buffer | null = null;

    // 1. Try local LibreOffice CLI executables
    const sofficeExecs = [
      'soffice',
      'libreoffice',
      'unoconv',
      'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
      'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe'
    ];

    for (const execName of sofficeExecs) {
      try {
        const cmd = `"${execName}" --headless --convert-to pdf "${inputPath}" --outdir "${tmpDir}"`;
        await execAsync(cmd);
        const expectedPdfPath = path.join(tmpDir, `input_${uniqueId}.pdf`);
        if (fs.existsSync(expectedPdfPath)) {
          pdfBuffer = await fs.promises.readFile(expectedPdfPath);
          try { await fs.promises.unlink(expectedPdfPath); } catch (e) {}
          if (pdfBuffer && pdfBuffer.length > 0) break;
        }
      } catch (e) {}
    }

    // 2. Try Cloud LibreOffice conversion engine if local CLI absent
    if (!pdfBuffer || pdfBuffer.length === 0) {
      try {
        const formData = new FormData();
        const blob = new Blob([inputBuffer], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
        formData.append('files', blob, fileName || 'presentation.pptx');

        const cloudRes = await fetch('https://demo.gotenberg.dev/forms/libreoffice/convert', {
          method: 'POST',
          body: formData
        });

        if (cloudRes.ok) {
          const resArrayBuf = await cloudRes.arrayBuffer();
          if (resArrayBuf.byteLength > 1000) {
            pdfBuffer = Buffer.from(resArrayBuf);
          }
        }
      } catch (cloudErr) {
        console.warn('Cloud LibreOffice API conversion skipped:', cloudErr);
      }
    }

    // Clean up input file
    try { if (fs.existsSync(inputPath)) await fs.promises.unlink(inputPath); } catch (e) {}

    if (pdfBuffer && pdfBuffer.length > 0) {
      const pdfBase64 = pdfBuffer.toString('base64');
      const cleanName = (fileName || 'presentation').replace(/\.(ppt|pptx)$/i, '') + '.pdf';
      return res.status(200).json({
        success: true,
        engine: 'libreoffice',
        fileData: `data:application/pdf;base64,${pdfBase64}`,
        fileName: cleanName
      });
    }

    return res.status(200).json({
      success: false,
      reason: 'LibreOffice binary not available on host CLI environment.'
    });
  } catch (err: any) {
    console.error('Convert PPT API Error:', err);
    return res.status(500).json({ error: err.message || 'PPT Conversion API Error' });
  }
}
