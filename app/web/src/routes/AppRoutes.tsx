import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import Shell from "../layout/Shell";

import HomePage from "../pages/Home/HomePage";
import SettingsPage from "../pages/Settings/SettingsPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import LoginPage from "../pages/Login/LoginPage";

export default function AppRoutes() {
    return (
        <Routes>
            {/* ---------- PUBLIC ---------- */}
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                }
            />

            {/* ---------- PRIVATE (Shell expects children) ---------- */}
            <Route
                path="/*"
                element={
                    <PrivateRoute>
                        <Shell>
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/settings" element={<SettingsPage />} />
                                <Route path="/dashboard" element={<DashboardPage />} />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </Shell>
                    </PrivateRoute>
                }
            />
        </Routes>
    );
}
