// Local, explicit types for the Google Identity Services (GIS) OAuth2 token client.
// We avoid ambient globals; consumers import these types directly.

export type PromptValue = '' | 'consent' | 'select_account';

export interface TokenResponse {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: 'Bearer';
}

export interface TokenClientConfig {
    client_id: string;
    scope: string;
    hint?: string;
    prompt?: PromptValue;
    callback: (res: TokenResponse) => void;
    // Use unknown (not any). Callers must narrow.
    error_callback?: (error: unknown) => void;
}

export interface TokenClient {
    requestAccessToken: (options?: { prompt?: PromptValue }) => void;
}

export interface GisOAuth2 {
    initTokenClient: (config: TokenClientConfig) => TokenClient;
    revoke: (token: string, done?: () => void) => void;
}

export interface GisRoot {
    accounts: { oauth2: GisOAuth2 };
}
