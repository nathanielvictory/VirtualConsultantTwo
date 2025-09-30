import {createDriveFile, listDriveFiles, type DriveFile, MIME, setAnyoneWithLinkCanEdit} from '../drive';


export function getSheetsEditUrl(fileId: string) {
    return `https://docs.google.com/spreadsheets/d/${fileId}/edit`;
}


export async function createGoogleSpreadsheet(accessToken: string, title: string): Promise<DriveFile> {
    const file = await createDriveFile(accessToken, { name: title, mimeType: MIME.SHEET });
    await setAnyoneWithLinkCanEdit(accessToken, file.id);

    return file
}


export async function listGoogleSpreadsheets(
    accessToken: string,
    opts: { pageSize?: number } = {}
): Promise<DriveFile[]> {
    return listDriveFiles(accessToken, { pageSize: opts.pageSize, mimeType: MIME.SHEET });
}