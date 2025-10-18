// src/hooks/useBuildChartPipeline.ts
import { useCallback, useMemo } from "react";
import { useWriteGridToNewSheet } from "./useWriteGridToNewSheet";
import { useAddChartToSheet } from "./useAddChartToSheet";
import { useInsertSheetsChart } from "./useInsertSheetsChart";
import type { Grid } from "../components/ChartOverlay/surveyMemo";
import type { ChartType } from "../integrations/google/sheetsApi/charts/addChart";

type Args = {
    presentationId: string;
    spreadsheetId: string;
    grid: Grid;
    type: ChartType;           // "topline" | "crosstab"
    createNewSlide?: boolean;  // default false
    title?: string;            // optional override for the new tab + chart title
};

type Result = {
    spreadsheetId: string;
    sheetId: number;
    sheetTitle: string;
    chartId: number;
    presentationId: string;
    pageObjectId: string;   // last slide id
    chartObjectId: string;  // chart element on the slide
};

export function useBuildChartPipeline() {
    const writeHook = useWriteGridToNewSheet();
    const chartHook = useAddChartToSheet();
    const slidesHook = useInsertSheetsChart();

    const isLoading = useMemo(
        () => writeHook.isLoading || chartHook.isLoading || slidesHook.isLoading,
        [writeHook.isLoading, chartHook.isLoading, slidesHook.isLoading]
    );
    const isError = useMemo(
        () => writeHook.isError || chartHook.isError || slidesHook.isError,
        [writeHook.isError, chartHook.isError, slidesHook.isError]
    );
    const error = writeHook.error ?? chartHook.error ?? slidesHook.error;

    const reset = useCallback(() => {
        writeHook.reset?.();
        chartHook.reset?.();
        slidesHook.reset?.();
    }, [writeHook, chartHook, slidesHook]);

    const run = useCallback(
        async ({ presentationId, spreadsheetId, grid, type, createNewSlide, title }: Args): Promise<Result> => {
            reset();

            // 1) Write the grid to a new tab
            const gridRes = await writeHook.write({
                spreadsheetId,
                grid,
                // title is optional; the writer will dedupe/auto-name if omitted
                title,
            }); // { sheetId, title, editUrl, ... }

            // 2) Add the chart to that sheet
            const rows = grid.length;
            const cols = grid[0]?.length ?? 0;

            // IMPORTANT:
            // Your current addChartToSheet in canvas requires dims for crosstab and should return chartId.
            // Ensure it accepts { rows, cols } for crosstab and returns { chartId } as shown earlier.
            const chartRes = await chartHook.create({
                spreadsheetId,
                sheetId: gridRes.sheetId,
                chartType: type,
                title: gridRes.title,
                rows,
                cols,
            }); // { chartId, ... }

            // 3) Insert the linked chart into Slides (optionally add a new slide first)
            const slidesRes = await slidesHook.insert({
                presentationId,
                spreadsheetId,
                chartId: chartRes.chartId,
                createNewSlide,
            }); // { pageObjectId, chartObjectId }

            return {
                spreadsheetId,
                sheetId: gridRes.sheetId,
                sheetTitle: gridRes.title,
                chartId: chartRes.chartId,
                presentationId,
                pageObjectId: slidesRes.pageObjectId,
                chartObjectId: slidesRes.chartObjectId,
            };
        },
        [reset, writeHook, chartHook, slidesHook]
    );

    return {
        run,
        isLoading,
        isError,
        error,
        // expose individual pieces if you want granular UI later
        steps: {
            write: { ...writeHook },
            addChart: { ...chartHook },
            insertSlides: { ...slidesHook },
        },
        reset,
    };
}
