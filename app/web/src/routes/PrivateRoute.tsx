import { type PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

export default function PrivateRoute({ children }: PropsWithChildren) {
    const email = useAppSelector(s => s.auth.email);
    const location = useLocation();

    if (!email) {
        // keep where the user tried to go so we can redirect back after login
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return <>{children}</>;
}
