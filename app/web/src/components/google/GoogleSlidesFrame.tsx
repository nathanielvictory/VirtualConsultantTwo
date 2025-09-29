import { getSlidesEditUrl } from '../../integrations/google/slidesApi/presentations.ts';

type GoogleSlidesFrameProps = {
    slidesId: string;
    /** Optional height. Accepts number (px) or CSS string like '100vh'. Defaults to 720. */
    height?: number | string;
};

export default function GoogleSlidesFrame({ slidesId, height = 720 }: GoogleSlidesFrameProps) {
    if (!slidesId) return null;

    const src = getSlidesEditUrl(slidesId);
    const resolvedHeight = typeof height === 'number' ? `${height}px` : height;

    return (
        <iframe
            key={slidesId}
            src={src}
            width="100%"
            style={{ height: resolvedHeight, border: 0, display: 'block' }}
            allow="clipboard-write; clipboard-read; fullscreen"
            loading="lazy"
        />
    );
}
