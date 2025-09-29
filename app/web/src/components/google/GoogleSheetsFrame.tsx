// GoogleDocFrame.tsx
import { getSheetsEditUrl } from '../../integrations/google/sheetsApi/spreadsheets';

type GoogleDocFrameProps = {
    sheetsId: string;
    /** Optional height. Accepts number (px) or CSS string like '100vh'. Defaults to 720. */
    height?: number | string;
};

export default function GoogleSheetsFrame({ sheetsId, height = 720 }: GoogleDocFrameProps) {
    if (!sheetsId) return null;

    const src = getSheetsEditUrl(sheetsId);
    const resolvedHeight = typeof height === 'number' ? `${height}px` : height;

    return (
        <iframe
            key={sheetsId}
            src={src}
            width="100%"
            style={{ height: resolvedHeight, border: 0, display: 'block' }}
            allow="clipboard-write; clipboard-read; fullscreen"
            loading="lazy"
        />
    );
}
