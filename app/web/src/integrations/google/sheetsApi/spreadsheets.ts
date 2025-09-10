import { createDriveFile, listDriveFiles, type DriveFile, MIME } from '../drive';


export function getSheetsEditUrl(fileId: string) {
    return `https://docs.google.com/spreadsheets/d/${fileId}/edit`;
}


export async function createGoogleSpreadsheet(accessToken: string, title: string): Promise<DriveFile> {
    return createDriveFile(accessToken, { name: title, mimeType: MIME.SHEET });
}


export async function listGoogleSpreadsheets(
    accessToken: string,
    opts: { pageSize?: number } = {}
): Promise<DriveFile[]> {
    return listDriveFiles(accessToken, { pageSize: opts.pageSize, mimeType: MIME.SHEET });
}