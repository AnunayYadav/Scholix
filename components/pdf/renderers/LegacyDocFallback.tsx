import React from 'react';

interface LegacyDocFallbackProps {
    displayFileName: string;
    isLegacyDoc: boolean;
    isDownloading: boolean;
    onDownload: () => void;
}

export const LegacyDocFallback: React.FC<LegacyDocFallbackProps> = ({
    displayFileName,
    isLegacyDoc,
    isDownloading,
    onDownload,
}) => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center min-h-[60vh]">
            <div className="bg-white dark:bg-[#141416] border border-zinc-200 dark:border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center space-y-5 animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                    </svg>
                </div>
                <div className="space-y-1">
                    <h4 className="text-base font-extrabold text-zinc-900 dark:text-white truncate max-w-[320px]">
                        {displayFileName}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        {isLegacyDoc ? "Microsoft Word Document (.doc)" : "Word Document (.docx)"}
                    </p>
                </div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-xs">
                    {isLegacyDoc 
                        ? "Binary Word format (.doc) can be viewed by downloading directly to your device."
                        : "Direct preview is unavailable for this document. You can download and open it in Word or Google Docs."}
                </p>
                <button
                    onClick={onDownload}
                    disabled={isDownloading}
                    className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
                >
                    {isDownloading ? (
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                            </svg>
                            Downloading...
                        </span>
                    ) : (
                        <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Download Document
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
