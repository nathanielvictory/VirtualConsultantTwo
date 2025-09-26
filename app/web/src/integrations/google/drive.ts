import { googleFetch } from './googleFetch';

export type DriveFile = {
    id: string;
    name: string;
    mimeType: string;
    modifiedTime?: string;
    webViewLink?: string;
};

export const MIME = {
    DOC: 'application/vnd.google-apps.document',
    SHEET: 'application/vnd.google-apps.spreadsheet',
    SLIDE: 'application/vnd.google-apps.presentation',
} as const;

const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_PERMS_URL = (fileId: string) =>
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/permissions`;

export async function listDriveFiles(
    accessToken: string,
    opts: { pageSize?: number; mimeType?: string; orderBy?: string } = {}
): Promise<DriveFile[]> {
    const { pageSize = 20, mimeType, orderBy = 'modifiedTime desc' } = opts;
    const qParts = [`trashed=false`];
    if (mimeType) qParts.push(`mimeType='${mimeType}'`);
    const params = new URLSearchParams({
        q: qParts.join(' and '),
        orderBy,
        pageSize: String(pageSize),
        fields: 'files(id,name,mimeType,modifiedTime,webViewLink)',
    });

    const data = await googleFetch<{ files: DriveFile[] }>(`${DRIVE_FILES_URL}?${params.toString()}`, {
        method: 'GET',
        accessToken,
    });
    return (data.files ?? []) as DriveFile[];
}

export async function createDriveFile(
    accessToken: string,
    body: { name: string; mimeType: string }
): Promise<DriveFile> {
    return await googleFetch<DriveFile>(DRIVE_FILES_URL, {
        method: 'POST',
        accessToken,
        body: JSON.stringify(body),
    });
}

/** Minimal: set “Anyone with the link can edit”. */
export async function setAnyoneWithLinkCanEdit(
    accessToken: string,
    fileId: string
): Promise<void> {
    // If this gets called twice, Drive may return an error. We keep it simple:
    // try once, and if Drive complains that it already exists, just ignore.
    try {
        await googleFetch(
            `${DRIVE_PERMS_URL(fileId)}`,
            {
                method: 'POST',
                accessToken,
                body: JSON.stringify({
                    type: 'anyone',
                    role: 'writer',
                    allowFileDiscovery: false,
                }),
            }
        );
    } catch (e: any) {
        const msg = String(e?.message ?? e);
        // Silently ignore “already exists / duplicate” style errors to stay minimal.
        const harmless =
            msg.includes('already') ||
            msg.includes('duplicate') ||
            msg.includes('cannotShare') ||
            msg.includes('400') || // some tenants return 400 for duplicate anyone perms
            msg.includes('409');
        if (!harmless) throw e;
    }
}

/** Export a Google Doc as HTML using the Drive API (works with Authorization headers). */
export async function exportDocAsHtml(accessToken: string, fileId: string): Promise<string> {
    const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/export?mimeType=text/html`;
    const resp = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!resp.ok) throw await toGoogleError(resp);
    return await resp.text();
}

async function toGoogleError(resp: Response): Promise<Error> {
    try {
        const j = await resp.json();
        const msg = j?.error?.message || j?.error_description || JSON.stringify(j);
        const code = j?.error?.code || resp.status;
        return new Error(`${code}: ${msg}`);
    } catch {
        const text = await resp.text();
        return new Error(`${resp.status}: ${text}`);
    }
}
