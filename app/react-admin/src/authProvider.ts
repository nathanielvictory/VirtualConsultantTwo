import type { AuthProvider } from "react-admin";
import { saveSession, clearSession, isSessionValid, getPermissionsFromScope } from "./auth/session";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const authProvider: AuthProvider = {
    login: async ({ username, password }: { username: string; password: string }) => {
        // Build application/x-www-form-urlencoded body
        const params = new URLSearchParams();
        params.set("grant_type", "password"); // your DTO includes this
        params.set("username", username);
        params.set("password", password);
        // params.set("scope", "optional-scope"); // if your server needs it
        // params.set("client_id", "…"); params.set("client_secret", "…"); // if required

        const res = await fetch(`${API_BASE}/api/Auth/token`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString(),
        });

        if (!res.ok) {
            // 400/401/415 etc.
            throw new Error("Invalid credentials or unsupported media type");
        }

        const data = (await res.json()) as {
            access_token?: string | null;
            token_type?: string | null;
            expires_in?: number;
            scope?: string | null;
        };

        saveSession(data);
        return Promise.resolve();
    },

    logout: async () => {
        // optional: call your logout endpoint; clearing local session is enough for now
        clearSession();
        return Promise.resolve();
    },

    checkAuth: async () => (isSessionValid() ? Promise.resolve() : Promise.reject()),
    checkError: async (error) => {
        const status = (error as any)?.status;
        if (status === 401 || status === 403) {
            clearSession();
            return Promise.reject();
        }
        return Promise.resolve();
    },
    getPermissions: async () => getPermissionsFromScope(),
    getIdentity: async () => Promise.resolve(undefined as any),
};
