import { ThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { useThemeMode } from "./theme/useThemeMode";
import TokenRefresher from "./components/TokenRefresher";

export default function App() {
    const { theme } = useThemeMode();
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <TokenRefresher>
                    <AppRoutes />
                </TokenRefresher>
            </BrowserRouter>
        </ThemeProvider>
    );
}