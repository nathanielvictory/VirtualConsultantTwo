// src/hooks/useInsertSheetsChart.ts
import { useCallback, useState } from "react";
import { useAppSelector } from "../store/hooks";
import { insertSheetsChartToLastSlide, type InsertSheetsChartResult } from "../integrations/google/slidesApi/insertSheetsChart";
import { createSlideAtEnd } from "../integrations/google/slidesApi/createSlideAtEnd";

type Args = {
    presentationId: string;
    spreadsheetId: string;
    chartId: number;
    /** If true, create a new blank slide at the end before inserting the chart */
    createNewSlide?: boolean;
};

export function useInsertSheetsChart() {
    const accessToken = useAppSelector((s) => s.googleAuth.accessToken);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);
    const [data, setData] = useState<InsertSheetsChartResult | null>(null);

    const insert = useCallback(async ({ presentationId, spreadsheetId, chartId, createNewSlide }: Args) => {
        if (!accessToken) throw new Error("No Google access token available in store");
        setIsLoading(true);
        setError(null);
        try {
            if (createNewSlide) {
                // New slide becomes the last slide; the insert helper targets the last slide automatically.
                await createSlideAtEnd(accessToken, presentationId);
            }
            const res = await insertSheetsChartToLastSlide(accessToken, presentationId, spreadsheetId, chartId);
            setData(res);
            return res;
        } catch (e) {
            setError(e);
            throw e;
        } finally {
            setIsLoading(false);
        }
    }, [accessToken]);

    const reset = () => { setError(null); setData(null); };

    return { insert, isLoading, isError: Boolean(error), error, data: data ?? undefined, reset };
}
