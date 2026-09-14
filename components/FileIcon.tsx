import React from 'react';

export interface FileIconProps {
  fileName?: string;
  fileType?: string;
  size?: string;
  className?: string;
  variant?: 'icon' | 'badge';
}

export const getFileExtension = (fileName = '', storagePath = '', fileType = ''): string => {
  const checkExt = (str: string) => {
    if (!str) return '';
    const clean = str.split('?')[0].split('#')[0];
    const match = clean.match(/\.([a-zA-Z0-9]{2,5})$/);
    return match ? match[1].toLowerCase() : '';
  };

  const nameExt = checkExt(fileName);
  if (nameExt) return nameExt;

  const storageExt = checkExt(storagePath);
  if (storageExt) return storageExt;

  const t = (fileType || '').toLowerCase();
  if (t.includes('pdf')) return 'pdf';
  if (t.includes('sheet') || t.includes('excel') || t.includes('xls') || t.includes('csv')) return 'xlsx';
  if (t.includes('word') || t.includes('doc')) return 'docx';
  if (t.includes('slide') || t.includes('ppt') || t.includes('presentation')) return 'pptx';
  if (t.includes('image') || t.includes('photo') || t.includes('png') || t.includes('jpg')) return 'png';
  if (t.includes('zip') || t.includes('archive') || t.includes('rar')) return 'zip';
  if (t.includes('code') || t.includes('script')) return 'ts';

  // Default academic files are PDFs
  return 'pdf';
};

export const getDisplayFileNameWithExtension = (
  fileName = '',
  storagePath = '',
  fileType = ''
): { baseName: string; ext: string; fullName: string } => {
  const ext = getFileExtension(fileName, storagePath, fileType);
  let base = (fileName || '').trim();

  // Strip existing extension if present to prevent double extensions
  const extRegex = /\.[a-zA-Z0-9]{2,5}$/;
  if (extRegex.test(base)) {
    base = base.replace(extRegex, '');
  }

  return {
    baseName: base,
    ext,
    fullName: `${base}.${ext}`,
  };
};

export const FileIcon: React.FC<FileIconProps> = ({
  fileName = '',
  fileType = '',
  size = 'w-4.5 h-[22px]',
  className = '',
  variant = 'icon',
}) => {
  const ext = getFileExtension(fileName, '', fileType);

  let label = 'PDF';
  let color = '#dc2626'; // Deep Red

  if (ext === 'pdf') {
    label = 'PDF';
    color = '#dc2626'; // Red
  } else if (['xls', 'xlsx', 'csv', 'tsv', 'ods'].includes(ext)) {
    label = ext === 'csv' ? 'CSV' : 'XLS';
    color = '#16a34a'; // Green
  } else if (['doc', 'docx', 'rtf', 'odt'].includes(ext)) {
    label = 'DOC';
    color = '#2563eb'; // Blue
  } else if (['ppt', 'pptx', 'key', 'odp'].includes(ext)) {
    label = 'PPTX';
    color = '#ea580c'; // Orange-Red
  } else if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'bmp', 'ico'].includes(ext)) {
    label = 'IMG';
    color = '#8b5cf6'; // Purple
  } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    label = 'ZIP';
    color = '#d97706'; // Amber
  } else if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'sql', 'sh'].includes(ext)) {
    label = 'DEV';
    color = '#0891b2'; // Cyan
  } else {
    label = ext.toUpperCase().slice(0, 4) || 'TXT';
    color = '#64748b'; // Slate
  }

  return (
    <svg
      viewBox="0 0 20 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${size} shrink-0 drop-shadow-xs transition-transform group-hover:scale-105 ${className}`}
    >
      {/* Base Document Sheet with Dog-Ear Corner Cut */}
      <path
        d="M3 1C1.89543 1 1 1.89543 1 3V21C1 22.1046 1.89543 23 3 23H17C18.1046 23 19 22.1046 19 21V7.5L12.5 1H3Z"
        fill={color}
      />
      {/* Dog-Ear Fold Flap */}
      <path
        d="M12.5 1V6.5C12.5 7.05228 12.9477 7.5 13.5 7.5H19L12.5 1Z"
        fill="#ffffff"
        fillOpacity="0.32"
      />
      {/* Crease shadow */}
      <path
        d="M12.5 1L19 7.5H13.5C12.9477 7.5 12.5 7.05228 12.5 6.5V1Z"
        fill="#000000"
        fillOpacity="0.12"
      />
      {/* File Type Badge Text */}
      <text
        x="10"
        y="17"
        fill="#ffffff"
        textAnchor="middle"
        fontSize={label.length >= 4 ? '4.8' : '6'}
        fontWeight="900"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        letterSpacing={label.length >= 4 ? '-0.2px' : '0px'}
      >
        {label}
      </text>
    </svg>
  );
};

export default FileIcon;
