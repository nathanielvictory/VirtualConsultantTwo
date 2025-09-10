import { ensureGisLoaded } from '../platform/loadGis';
import type { PromptValue, TokenResponse } from '../types/gis';

export interface RequestTokenOptions {
    scopes: string[];
    prompt?: PromptValue;
    hintEmail?: string;
}

export interface TokenSuccess {
    accessToken: string;
    expiresIn: number;
    scope: string;
}

// Strongly-typed error you can use in UI and logs.
export class AuthError extends Error {
    code: string;
    raw?: unknown;
    constructor(code: string, message: string, raw?: unknown) {
        super(message);
        this.code = code;
        this.raw = raw;
    }
}

function normalizeError(err: unknown): AuthError {
    // Try to extract common fields that GIS may provide
    if (typeof err === 'object' && err !== null) {
        const r = err as Record<string, unknown>;
        const code =
            typeof r.error === 'string' ? r.error :
                typeof r.type === 'string' ? r.type :
                    'unknown';
        const message =
            typeof r.error_description === 'string' ? r.error_description :
                typeof r.message === 'string' ? r.message :
                    'Authorization failed.';
        return new AuthError(code, message, err);
    }
    if (err instanceof Error) {
        return new AuthError('unknown', err.message, err);
    }
    return new AuthError('unknown', 'Authorization failed.', err);
}

export async function requestAccessToken(
    { scopes, prompt = '', hintEmail }: RequestTokenOptions
): Promise<TokenSuccess> {
    const g = await ensureGisLoaded();

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) {
        throw new AuthError('config', 'Missing VITE_GOOGLE_CLIENT_ID in env.');
    }

    const scope = Array.from(new Set(scopes)).join(' ');

    const token = await new Promise<TokenResponse>((resolve, reject) => {
        const client = g.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope,
            hint: hintEmail,
            prompt,
            callback: (res) => resolve(res),
            error_callback: (e: unknown) => reject(normalizeError(e)),
        });
        client.requestAccessToken({ prompt });
    });

    return {
        accessToken: token.access_token,
        expiresIn: token.expires_in,
        scope: token.scope,
    };
}

export async function revokeAccessToken(accessToken: string): Promise<void> {
    const g = await ensureGisLoaded();
    await new Promise<void>((resolve) => g.accounts.oauth2.revoke(accessToken, resolve));
}
