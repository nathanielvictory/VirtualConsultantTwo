import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import Shell from "../layout/Shell";

import HomePage from "../pages/Home/HomePage";
import SettingsPage from "../pages/Settings/SettingsPage";
import LoginPage from "../pages/Login/LoginPage";
import AdminPanel from "../pages/ReactAdmin/AdminPanel";

// NEW PAGES
import ProjectOverviewPage from "../pages/Project/ProjectOverviewPage";
import ImportSetupPage from "../pages/Project/ImportSetupPage.tsx";
import InsightsPage from "../pages/Project/InsightsPage";
import MemoPage from "../pages/Project/MemoPage";
import SlidedeckPage from "../pages/Project/SlidedeckPage.tsx";
import ProjectSelectPage from "../pages/Project/ProjectSelectPage.tsx";
import DataReviewPage from "../pages/DataReview/DataReviewPage.tsx";

import AdminRoute from "./AdminRoute";

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

                                {/* Removed: /dashboard (was placeholder) */}

                                {/* Data Review is global (not tied to a step) */}
                                <Route path="/data-review" element={<DataReviewPage />} />

                                {/* Project workflow */}
                                <Route path="/projects/select" element={<ProjectSelectPage />} />
                                <Route path="/projects/:id" element={<ProjectOverviewPage />} />
                                <Route path="/projects/:id/import" element={<ImportSetupPage />} />
                                <Route path="/projects/:id/insights" element={<InsightsPage />} />
                                <Route path="/projects/:id/memo" element={<MemoPage />} />
                                <Route path="/projects/:id/slides" element={<SlidedeckPage />} />

                                <Route
                                    path="/admin/*"
                                    element={
                                        <AdminRoute>
                                            <AdminPanel />
                                        </AdminRoute>
                                    }
                                />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </Shell>
                    </PrivateRoute>
                }
            />
        </Routes>
    );
}