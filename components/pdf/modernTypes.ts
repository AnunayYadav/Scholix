import { LibraryFile, UserProfile } from '../../types.ts';

export interface ModernPDFViewerProps {
    url?: string;
    fileId?: string;
    file?: LibraryFile;
    onClose: (resolvedFile?: LibraryFile) => void;
    fileName: string;
    userProfile?: UserProfile | null;
    onAuthRequired?: () => void;
}

export type ModernReadingTheme = 'light' | 'dark' | 'dark-clean' | 'sepia';
export type ModernViewFitMode = 'width' | 'page' | 'auto' | 'custom';
export type ModernActiveTool = 'select' | 'hand';
export type ModernSidebarTab = 'thumbnails' | 'outline' | 'search' | 'bookmarks';

export interface ModernSearchResult {
    pageIndex: number;
    matchIndex: number;
    totalMatchesInPage: number;
}

export interface ModernSearchSnippet {
    pageIndex: number;
    snippet: string;
    matchIndex: number;
}

export interface ModernPDFOutlineItem {
    title: string;
    dest?: any;
    pageNumber?: number;
    items?: ModernPDFOutlineItem[];
}

export interface ModernPageDimensions {
    width: number;
    height: number;
}

export interface ModernBookmark {
    pageNumber: number;
    title: string;
    createdAt: number;
}
