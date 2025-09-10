import type { GisRoot } from '../types/gis';

const GIS_SRC = 'https://accounts.google.com/gsi/client';

let loadPromise: Promise<GisRoot> | null = null;

type WindowWithGoogle = Window & { google?: GisRoot };

function getWindow(): WindowWithGoogle {
    return window as WindowWithGoogle;
}

export function ensureGisLoaded(): Promise<GisRoot> {
    if (loadPromise) return loadPromise;

    // Already present (e.g., hot reload)
    const maybe = getWindow().google?.accounts?.oauth2;
    if (maybe) {
        loadPromise = Promise.resolve(getWindow().google!);
        return loadPromise;
    }

    loadPromise = new Promise<GisRoot>((resolve, reject) => {
        const s = document.createElement('script');
        s.src = GIS_SRC;
        s.async = true;
        s.defer = true;
        s.onload = () => {
            const g = getWindow().google;
            if (g?.accounts?.oauth2) resolve(g);
            else reject(new Error('Google Identity Services failed to initialize.'));
        };
        s.onerror = () => reject(new Error('Failed to load Google Identity Services script.'));
        document.head.appendChild(s);
    });

    return loadPromise;
}
