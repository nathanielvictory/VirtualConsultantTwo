// GoogleDocFrame.tsx
import { getDocsEditUrl } from '../../integrations/google/docsApi/documents';

type GoogleDocFrameProps = {
    docId: string;
    /** Optional height. Accepts number (px) or CSS string like '100vh'. Defaults to 720. */
    height?: number | string;
};

export default function GoogleDocFrame({ docId, height = 720 }: GoogleDocFrameProps) {
    if (!docId) return null;

    const src = getDocsEditUrl(docId);
    const resolvedHeight = typeof height === 'number' ? `${height}px` : height;

    return (
        <iframe
            key={docId}
            src={src}
            width="100%"
            style={{ height: resolvedHeight, border: 0, display: 'block' }}
            allow="clipboard-write; clipboard-read; fullscreen"
            loading="lazy"
        />
    );
}
