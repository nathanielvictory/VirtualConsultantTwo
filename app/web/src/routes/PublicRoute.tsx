import { type PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

export default function PublicRoute({ children }: PropsWithChildren) {
    const email = useAppSelector(s => s.auth.email);
    if (email) return <Navigate to="/" replace />;
    return <>{children}</>;
}
