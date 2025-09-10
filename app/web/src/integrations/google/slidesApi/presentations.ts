import { createDriveFile, listDriveFiles, type DriveFile, MIME } from '../drive';


export function getSlidesEditUrl(fileId: string) {
    return `https://docs.google.com/presentation/d/${fileId}/edit`;
}


export async function createGooglePresentation(accessToken: string, title: string): Promise<DriveFile> {
    return createDriveFile(accessToken, { name: title, mimeType: MIME.SLIDE });
}


export async function listGooglePresentations(
    accessToken: string,
    opts: { pageSize?: number } = {}
): Promise<DriveFile[]> {
    return listDriveFiles(accessToken, { pageSize: opts.pageSize, mimeType: MIME.SLIDE });
}