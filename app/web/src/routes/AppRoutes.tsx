import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Shell from "../layout/Shell";
import HomePage from "../pages/Home/HomePage.tsx";
import SettingsPage from "../pages/Settings/SettingsPage.tsx";
import LoginPage from "../pages/Login/LoginPage.tsx";
import DashboardPage from "../pages/Dashboard/DashboardPage.tsx";

export default function AppRoutes({ mode, toggleMode }: { mode: "light" | "dark"; toggleMode: () => void }) {
    const [authed, setAuthed] = useState(false); // demo auth gate
    if (!authed) return <LoginPage onLogin={() => setAuthed(true)} />;
    return (
        <Shell mode={mode} toggleMode={toggleMode}>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Shell>
    );
}