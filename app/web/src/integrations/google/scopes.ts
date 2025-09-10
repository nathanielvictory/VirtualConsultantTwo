export const GOOGLE_SCOPES = {
    driveFile: 'https://www.googleapis.com/auth/drive.file',
    docs: 'https://www.googleapis.com/auth/documents',
    slides: 'https://www.googleapis.com/auth/presentations',
    sheets: 'https://www.googleapis.com/auth/spreadsheets',
} as const;

export const DEFAULT_SCOPES: string[] = [
    GOOGLE_SCOPES.driveFile,
    GOOGLE_SCOPES.docs,
    GOOGLE_SCOPES.slides,
    GOOGLE_SCOPES.sheets,
];
