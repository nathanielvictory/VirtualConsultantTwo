// src/components/ChartOverlay/ChartOverlay.tsx
import { useEffect, useMemo, useState } from "react";
import { Paper, Box, Divider, IconButton, Portal, useTheme, Tooltip } from "@mui/material";
import TextSnippetTwoToneIcon from "@mui/icons-material/TextSnippetTwoTone";
import SlideshowRoundedIcon from "@mui/icons-material/SlideshowRounded";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import FullscreenExitRoundedIcon from "@mui/icons-material/FullscreenExitRounded";
import { Rnd } from "react-rnd";
import ChartOverlayContentShell from "./ChartOverlayContentShell";

export default function ChartOverlay() {
    const theme = useTheme();

    const SMALL = { width: 420, height: 320 };
    const MEDIUM = { width: 720, height: 520 };

    const [size, setSize] = useState<{ width: number; height: number }>(SMALL);
    const [isMedium, setIsMedium] = useState(false);
    const [showSurveyText, setShowSurveyText] = useState(false);

    const initialPos = useMemo(() => ({ x: 24, y: 24 }), []);
    const [position, setPosition] = useState<{ x: number; y: number }>(initialPos);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const pad = 24;
        const x = Math.max(window.innerWidth - size.width - pad, pad);
        const y = Math.max(window.innerHeight - size.height - pad, pad);
        setPosition({ x, y });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleSize = () => {
        if (isMedium) {
            setSize(SMALL);
            setIsMedium(false);
            setShowSurveyText(false);
        } else {
            setSize(MEDIUM);
            setIsMedium(true);
        }
    };

    const toggleSurveyText = () => setShowSurveyText((prev) => !prev);

    return (
        <Portal>
            {/* Fixed full-viewport layer to stabilize drag coords and avoid page scrollbars */}
            <Box
                sx={{
                    position: "fixed",
                    inset: 0,
                    zIndex: (theme.zIndex?.modal ?? 1300) - 1, // below menus/popovers
                    // 🔑 Let events pass through this entire layer:
                    pointerEvents: "none",
                    overflow: "hidden",
                }}
            >
                <Rnd
                    bounds="parent"
                    size={size}
                    position={position}
                    minWidth={320}
                    minHeight={200}
                    onDragStop={(_e, d) => setPosition({ x: d.x, y: d.y })}
                    onResizeStop={(_e, _dir, ref, _delta, newPos) => {
                        setSize({ width: ref.offsetWidth, height: ref.offsetHeight });
                        setPosition(newPos);
                    }}
                    dragHandleClassName="chart-overlay__drag"
                    cancel=".chart-overlay__btn, .chart-overlay__body"
                    // 🔑 Re-enable events only for the floating window itself:
                    style={{ position: "fixed", pointerEvents: "auto" }}
                >
                    <Paper
                        elevation={8}
                        sx={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                            borderRadius: 2,
                        }}
                    >
                        {/* Header (drag handle) */}
                        <Box
                            className="chart-overlay__drag"
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                gap: 0.5,
                                px: 1,
                                py: 0.75,
                                cursor: "move",
                                userSelect: "none",
                            }}
                        >
                            <Tooltip title={showSurveyText ? "Show slide-deck options" : "Show survey results"}>
                                <IconButton
                                    className="chart-overlay__btn"
                                    size="small"
                                    onClick={toggleSurveyText}
                                    aria-label="Toggle survey mode"
                                >
                                    {showSurveyText ? <SlideshowRoundedIcon fontSize="small" /> : <TextSnippetTwoToneIcon fontSize="small" />}
                                </IconButton>
                            </Tooltip>

                            <Tooltip title={isMedium ? "Make small" : "Make medium"}>
                                <IconButton
                                    className="chart-overlay__btn"
                                    size="small"
                                    onClick={toggleSize}
                                    aria-label="Toggle overlay size"
                                >
                                    {isMedium ? <FullscreenExitRoundedIcon fontSize="small" /> : <FullscreenRoundedIcon fontSize="small" />}
                                </IconButton>
                            </Tooltip>
                        </Box>

                        <Divider />

                        {/* Body (interactive content area) */}
                        <Box className="chart-overlay__body" sx={{ flex: 1, minHeight: 0, overflow: "auto", p: 1.5 }}>
                            <ChartOverlayContentShell showSurveyText={showSurveyText} />
                        </Box>
                    </Paper>
                </Rnd>
            </Box>
        </Portal>
    );
}
