// src/components/ChartOverlay/ChartCreator.tsx
import { Button, CircularProgress, Alert } from "@mui/material";
import { type Grid } from "./surveyMemo";
import { useWriteGridToNewSheet } from "../../hooks/useWriteGridToNewSheet";
import {useAddChartToSheet} from "../../hooks/useAddChartToSheet.ts";


interface ChartCreatorProps {
    googlePresentationId: string;
    googleSheetId: string;
    answerGrid: Grid;
    type: "crosstab" | "topline";
}

export default function ChartCreator({ googleSheetId, answerGrid, type }: ChartCreatorProps) {
    const { write, isLoading: isWriting, isError, error } = useWriteGridToNewSheet();
    const { create: addChart, isLoading: isAddingChart } = useAddChartToSheet();
    const isLoading = isWriting || isAddingChart;

    const handleClick = async () => {
        try {
            // Step 1: Write grid
            const gridResult = await write({ spreadsheetId: googleSheetId, grid: answerGrid });

            // Step 2: Add chart using the new sheet’s ID
            await addChart({
                spreadsheetId: googleSheetId,
                sheetId: gridResult.sheetId,
                chartType: type,
                title: gridResult.title,
                rows: answerGrid.length,
                cols: answerGrid[0].length,
            });
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <>
            <Button variant="contained" onClick={handleClick} disabled={isLoading}>
                {isLoading ? "Writing..." : "Add Chart"}
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
