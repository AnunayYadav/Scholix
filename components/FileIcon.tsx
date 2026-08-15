import React from 'react';

export const FileIcon = ({ fileName, size = "w-5 h-5", className = "" }: { fileName: string, size?: string, className?: string }) => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  let colorClass = 'text-zinc-400 dark:text-zinc-500';
  let label = '';

  if (ext === 'pdf') {
    colorClass = 'text-red-500';
    label = 'PDF';
  } else if (['doc', 'docx'].includes(ext)) {
    colorClass = 'text-blue-500';
    label = 'DOC';
  } else if (['xls', 'xlsx', 'csv'].includes(ext)) {
    colorClass = 'text-emerald-500';
    label = 'XLS';
  } else if (['ppt', 'pptx'].includes(ext)) {
    colorClass = 'text-orange-500';
    label = 'PPT';
  } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    colorClass = 'text-amber-500';
    label = 'ZIP';
  } else if (['dwg', 'dxf', 'dwfx'].includes(ext)) {
    colorClass = 'text-cyan-500';
    label = 'DWG';
  } else if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext)) {
    colorClass = 'text-purple-500';
    label = 'IMG';
  } else if (['txt', 'md'].includes(ext)) {
    colorClass = 'text-teal-500';
    label = 'TXT';
  }

  const mergedClassName = className.includes('text-')
    ? `${size} ${className}`
    : `${size} ${colorClass} ${className}`;

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={mergedClassName}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      {label && (
        <text
          x="12"
          y="15.5"
          fill="currentColor"
          fontSize="6"
          fontWeight="bold"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          textAnchor="middle"
          dominantBaseline="middle"
          stroke="none"
        >
          {label}
        </text>
      )}
    </svg>
  );
};
