// src/routes/AdminRoute.tsx
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { type PropsWithChildren } from "react";

export default function AdminRoute({ children }: PropsWithChildren) {
    const role = useAppSelector((s) => s.auth.role);

    if (role !== "Admin") {
        return <Navigate to="/" replace />;
    }

    return children;
}
