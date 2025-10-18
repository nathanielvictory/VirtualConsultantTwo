// src/components/ChartOverlay/ChartCreator.tsx
import { useState } from "react";
import {Button, CircularProgress, Alert, FormControlLabel, Checkbox, TextField, Box} from "@mui/material";
import { type Grid } from "./surveyMemo";
import { useBuildChartPipeline } from "../../hooks/useBuildChartPipeline";

interface ChartCreatorProps {
    googlePresentationId: string;
    googleSheetId: string;
    answerGrid: Grid;
    type: "crosstab" | "topline";
    defaultTitle?: string;
}

export default function ChartCreator({
                                         googlePresentationId,
                                         googleSheetId,
                                         answerGrid,
                                         type,
                                         defaultTitle = "Untitled Chart",
                                     }: ChartCreatorProps) {
    const [createNewSlide, setCreateNewSlide] = useState(true);
    const [title, setTitle] = useState(defaultTitle);
    const { run, isLoading, isError, error } = useBuildChartPipeline();
    const [lastDefaultTitle, setLastDefaultTitle] = useState("");

    if (lastDefaultTitle != defaultTitle) {
        setLastDefaultTitle(defaultTitle)
        setTitle(defaultTitle);
    }

    const handleClick = async () => {
        try {
            await run({
                presentationId: googlePresentationId,
                spreadsheetId: googleSheetId,
                grid: answerGrid,
                type,
                createNewSlide,
                title,
            });
        } catch {
            // errors surfaced below
        }
    };

    return (
        <>
            <Box sx={{paddingLeft: 1, paddingRight: 1}}>
                <TextField
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    size="small"
                    sx={{ my: 1, width: "100%" }}
                />
            </Box>
            <FormControlLabel
                control={<Checkbox checked={createNewSlide} onChange={(e) => setCreateNewSlide(e.target.checked)} />}
                label="Create a new slide"
            />
            <Button variant="contained" onClick={handleClick} disabled={isLoading}>
                {isLoading ? "Working..." : "Add Chart"}
            </Button>
            {isLoading && <CircularProgress size={24} />}
            {isError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                    {String((error as any)?.message ?? "An error occurred")}
                </Alert>
            )}
        </>
    );
}
