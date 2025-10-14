// src/components/TokenRefresher.tsx
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { authApi } from "../api/authApi";
import { type PropsWithChildren } from "react";

export default function TokenRefresher({ children }: PropsWithChildren) {
    const dispatch = useAppDispatch();
    const token = useAppSelector((s) => s.auth.accessToken);
    const [refreshAttempted, setRefreshAttempted] = useState(false);

    if (token && !refreshAttempted) {
        dispatch(authApi.endpoints.postApiAuthRefresh.initiate());
        setRefreshAttempted(true);
    }

    return children;
}
