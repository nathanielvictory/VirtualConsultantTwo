const TOKEN_KEY = "token";
const TOKEN_TYPE_KEY = "token_type";
const EXPIRES_AT_KEY = "expires_at";
const SCOPE_KEY = "scope";

export type TokenResponseDto = {
    access_token?: string | null;
    token_type?: string | null;
    expires_in?: number;
    scope?: string | null;
};

export function saveSession(t: TokenResponseDto) {
    if (t.access_token) localStorage.setItem(TOKEN_KEY, t.access_token);
    if (t.token_type) localStorage.setItem(TOKEN_TYPE_KEY, t.token_type);
    if (t.scope != null) localStorage.setItem(SCOPE_KEY, t.scope);
    // compute absolute expiry time (ms since epoch)
    const now = Date.now();
    const expiresAt =
        t.expires_in && t.expires_in > 0 ? now + t.expires_in * 1000 : 0;
    localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt));
}

export function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_TYPE_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
    localStorage.removeItem(SCOPE_KEY);
}

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function isSessionValid(): boolean {
    const token = getToken();
    if (!token) return false;
    const exp = Number(localStorage.getItem(EXPIRES_AT_KEY) || 0);
    return exp === 0 || Date.now() < exp;
}

export function getPermissionsFromScope(): string[] {
    const scope = localStorage.getItem(SCOPE_KEY) || "";
    return scope ? scope.split(" ").filter(Boolean) : [];
}
