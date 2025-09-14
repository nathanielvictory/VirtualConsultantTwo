// src/api/emptyApi.ts
import {
    createApi,
    fetchBaseQuery,
    type BaseQueryFn,
    type FetchArgs,
    type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { setBackendToken, clearBackendAuth } from '../store/authSlice';

const baseUrl =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || 'http://localhost:8080';

const rawBaseQuery = fetchBaseQuery({
    baseUrl: `${baseUrl}/`,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as any)?.auth?.accessToken as string | undefined;
        if (token) headers.set('authorization', `Bearer ${token}`);
        return headers;
    },
});

// Helper: convert JSON body → x-www-form-urlencoded for specific endpoints
function maybeFormEncode(args: string | FetchArgs): string | FetchArgs {
    if (typeof args === 'string') return args;

    // Only transform the token endpoint (adjust path if yours differs)
    const isTokenEndpoint =
        args.method?.toUpperCase() === 'POST' &&
        args.url.replace(/\/+$/, '') === '/api/Auth/token';

    if (!isTokenEndpoint) return args;

    // If body is a plain object, turn it into URLSearchParams
    const b = (args as FetchArgs).body as any;
    if (b && typeof b === 'object' && !(b instanceof FormData) && !(b instanceof URLSearchParams)) {
        const usp = new URLSearchParams();
        // Typical fields for password grant — include only what your backend needs
        for (const [k, v] of Object.entries(b)) {
            if (v !== undefined && v !== null) usp.append(k, String(v));
        }
        return {
            ...args,
            body: usp,
            headers: {
                ...(args.headers as Record<string, string> | undefined),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        };
    }
    return args;
}

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions
) => {
    // 🔁 Transform token call to form-data if needed
    const firstArgs = maybeFormEncode(args);

    let result = await rawBaseQuery(firstArgs, api, extraOptions);

    if (result.error && result.error.status === 401) {
        const refresh = await rawBaseQuery(
            { url: '/api/Auth/refresh', method: 'POST' },
            api,
            extraOptions
        );

        if (refresh.data && typeof refresh.data === 'object') {
            const data = refresh.data as { access_token?: string | null; token_type?: string | null; expires_in?: number };
            if (data.access_token) {
                api.dispatch(
                    setBackendToken({
                        accessToken: data.access_token,
                        tokenType: data.token_type ?? 'Bearer',
                        expiresIn: data.expires_in,
                    })
                );
                // retry original (no need to re-encode; maybeFormEncode is idempotent)
                result = await rawBaseQuery(firstArgs, api, extraOptions);
            } else {
                api.dispatch(clearBackendAuth());
            }
        } else {
            api.dispatch(clearBackendAuth());
        }
    }

    return result;
};

export const emptySplitApi = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    endpoints: () => ({}),
});
