// src/components/TokenRefresher.tsx
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { authApi } from "../api/authApi";
import {type PropsWithChildren, useState} from "react";

export default function TokenRefresher({ children }: PropsWithChildren) {
    const dispatch = useAppDispatch();
    const { isInitializing } = useAppSelector((s) => s.auth);
    const [refreshStarted, setRefreshStarted] = useState(false);

    if (isInitializing && !refreshStarted) {
        setRefreshStarted(true);
        dispatch(authApi.endpoints.postApiAuthRefresh.initiate());
    }

    return children;
}
