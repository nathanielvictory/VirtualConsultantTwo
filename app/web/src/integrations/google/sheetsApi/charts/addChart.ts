// integrations/google/sheetsApi/charts/addChart.ts
// Adds a chart to a specified sheet within a spreadsheet, supporting simple "topline" (pie) and "crosstab" (stacked bar) visualizations.
// Designed to work seamlessly with writeGridToNewSheet (uses returned sheetId + title).

import { googleFetch } from "../../googleFetch";
import buildToplineBarChart from './topline/pieChartSpec.ts'
import buildCrosstabColumnChart from "./crosstab/columnChartSpec.ts"

export type ChartType = "topline" | "crosstab";
export type DataDims = { rows: number; cols: number };

const SHEETS_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

export async function addChartToSheet(
    accessToken: string,
    spreadsheetId: string,
    sheetId: number,
    chartType: ChartType,
    title: string,
    dataDims?: DataDims
): Promise<void> {
    // Determine chart spec based on type
    const spec = chartType === "topline" ? buildToplineBarChart(sheetId, title) : buildCrosstabColumnChart(sheetId, title, dataDims!);

    await googleFetch(
        `${SHEETS_BASE}/${encodeURIComponent(spreadsheetId)}:batchUpdate`,
        {
            method: "POST",
            accessToken,
            body: JSON.stringify({
                requests: [
                    {
                        addChart: {
                            chart: spec,
                        },
                    },
                ],
            }),
        }
    );
}




