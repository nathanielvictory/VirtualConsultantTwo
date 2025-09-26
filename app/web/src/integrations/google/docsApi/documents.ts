import {
    createDriveFile,
    type DriveFile,
    MIME,
    setAnyoneWithLinkCanEdit,
} from '../drive';

export function getDocsEditUrl(fileId: string) {
    return `https://docs.google.com/document/d/${fileId}/edit`;
}

export async function createGoogleDocument(
    accessToken: string,
    title: string
): Promise<DriveFile> {
    const file = await createDriveFile(accessToken, { name: title, mimeType: MIME.DOC });
    await setAnyoneWithLinkCanEdit(accessToken, file.id);

    // Optional later (commented out by default):
    // await ensureUserEditor(accessToken, file.id, 'virtualconsultant@virtual-consultant-470512.iam.gserviceaccount.com');

    return file;
}
