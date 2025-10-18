// src/hooks/useAddChartToSheet.ts
import { useCallback, useState } from "react";
import { useAppSelector } from "../store/hooks";
import { addChartToSheet, type ChartType } from "../integrations/google/sheetsApi/charts/addChart";

type AddChartArgs = {
    spreadsheetId: string;
    sheetId: number;
    chartType: ChartType;
    title: string;
    rows?: number; // required for crosstab
    cols?: number; // required for crosstab
};

type AddChartData = { spreadsheetId: string; sheetId: number; chartId: number; chartType: ChartType; title: string };

export function useAddChartToSheet() {
    const accessToken = useAppSelector((s) => s.googleAuth.accessToken);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);
    const [data, setData] = useState<AddChartData | null>(null);

    const create = useCallback(async ({ spreadsheetId, sheetId, chartType, title, rows, cols }: AddChartArgs) => {
        if (!accessToken) throw new Error("No Google access token available in store");
        setIsLoading(true);
        setError(null);
        try {
            const dims = chartType === "crosstab" ? { rows: rows!, cols: cols! } : undefined;
            const { chartId } = await addChartToSheet(accessToken, spreadsheetId, sheetId, chartType, title, dims);
            const result: AddChartData = { spreadsheetId, sheetId, chartId, chartType, title };
            setData(result);
            return result;
        } catch (e) {
            setError(e);
            throw e;
        } finally {
            setIsLoading(false);
        }
    }, [accessToken]);

    const reset = () => { setError(null); setData(null); };

    return { create, isLoading, isError: Boolean(error), error, data: data ?? undefined, reset };
}
