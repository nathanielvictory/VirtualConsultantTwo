import { createDriveFile, listDriveFiles, type DriveFile, MIME } from '../drive';


export function getDocsEditUrl(fileId: string) {
    return `https://docs.google.com/document/d/${fileId}/edit`;
}


export async function createGoogleDocument(accessToken: string, title: string): Promise<DriveFile> {
    return createDriveFile(accessToken, { name: title, mimeType: MIME.DOC });
}

export async function listGoogleDocuments(
    accessToken: string,
    opts: { pageSize?: number } = {}
): Promise<DriveFile[]> {
    return listDriveFiles(accessToken, { pageSize: opts.pageSize, mimeType: MIME.DOC });
}
