import { LibraryFile, UserProfile } from '../../types.ts';

export interface PDFViewerProps {
    url?: string;
    fileId?: string;
    file?: LibraryFile;
    onClose: (resolvedFile?: LibraryFile) => void;
    fileName: string;
    userProfile?: UserProfile | null;
    onAuthRequired?: () => void;
}

export interface SearchResult {
    pageIndex: number;
    matchIndex: number;
    totalMatchesInPage: number;
}

export interface PDFOutlineItem {
    title: string;
    dest?: any;
    pageNumber?: number;
    items?: PDFOutlineItem[];
}

export type ReadingTheme = 'light' | 'dark' | 'dark-clean';
export type ViewFitMode = 'width' | 'page' | 'auto';
export type SidebarTab = 'thumbnails' | 'outline' | 'search';

export interface PageDimensions {
    width: number;
    height: number;
}
