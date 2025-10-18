// src/hooks/useAddChartToSheet.ts
import { useCallback, useState } from "react";
import { useAppSelector } from "../store/hooks";
import { addChartToSheet, type ChartType } from "../integrations/google/sheetsApi/charts/addChart";

type AddChartArgs = {
    spreadsheetId: string;
    sheetId: number;
    chartType: ChartType;   // "topline" | "crosstab"
    title: string;
    rows?: number;          // required for crosstab
    cols?: number;          // required for crosstab
};

export function useAddChartToSheet() {
    const accessToken = useAppSelector((s) => s.googleAuth.accessToken);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);
    const [data, setData] = useState<AddChartArgs | null>(null);

    const create = useCallback(
        async ({ spreadsheetId, sheetId, chartType, title, rows, cols }: AddChartArgs) => {
            if (!accessToken) throw new Error("No Google access token available in store");
            setIsLoading(true);
            setError(null);
            try {
                await addChartToSheet(
                    accessToken,
                    spreadsheetId,
                    sheetId,
                    chartType,
                    title,
                    chartType === "crosstab" ? { rows: rows!, cols: cols! } : undefined
                );
                const result = { spreadsheetId, sheetId, chartType, title, rows, cols };
                setData(result);
                return result;
            } catch (e) {
                setError(e);
                throw e;
            } finally {
                setIsLoading(false);
            }
        },
        [accessToken]
    );

    const reset = useCallback(() => {
        setError(null);
        setData(null);
    }, []);

    return { create, isLoading, isError: Boolean(error), error, data: data ?? undefined, reset };
}
