export async function googleFetch<T = any>(
    url: string,
    options: RequestInit & { accessToken: string }
): Promise<T> {
    const { accessToken, headers, ...rest } = options;
    const resp = await fetch(url, {
        ...rest,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            ...(headers || {}),
        },
    });


    if (!resp.ok) throw await toGoogleError(resp);
    const ct = resp.headers.get('content-type') || '';
    return (ct.includes('application/json') ? resp.json() : (resp.text() as any)) as Promise<T>;
}


export async function toGoogleError(resp: Response): Promise<Error> {
    try {
        const j = await resp.json();
        const msg = j?.error?.message || j?.error_description || JSON.stringify(j);
        const code = j?.error?.code || resp.status;
        return new Error(`Google API ${code}: ${msg}`);
    } catch {
        const text = await resp.text();
        return new Error(`Google API ${resp.status}: ${text}`);
    }
}