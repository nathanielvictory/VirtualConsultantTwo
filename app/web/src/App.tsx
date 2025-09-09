import { ThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { useThemeMode } from "./theme/useThemeMode";

export default function App() {
    const { theme, mode, toggleMode } = useThemeMode();
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <AppRoutes mode={mode} toggleMode={toggleMode} />
            </BrowserRouter>
        </ThemeProvider>
    );
}