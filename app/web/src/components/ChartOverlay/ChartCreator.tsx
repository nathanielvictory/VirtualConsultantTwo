// src/components/ChartOverlay/ChartCreator.tsx
import { Typography } from "@mui/material";
import { type Grid } from "./surveyMemo.ts";

interface ChartCreatorProps {
    googlePresentationId: string;
    googleSheetId: string;
    answerGrid: Grid;
    type: "crosstab" | "topline";
}

export default function ChartCreator({ googlePresentationId, googleSheetId, type }: ChartCreatorProps) {
    return (
        <div>
            <Typography>Presentation ID: {googlePresentationId}</Typography>
            <Typography>Sheet ID: {googleSheetId}</Typography>
            <Typography>Chart Type: {type}</Typography>
        </div>
    );
}