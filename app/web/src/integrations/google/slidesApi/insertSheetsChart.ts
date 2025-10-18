// integrations/google/slidesApi/insertSheetsChart.ts
import { googleFetch } from "../googleFetch";

const SLIDES_BASE = "https://slides.googleapis.com/v1/presentations";

// Hard-coded layout (extend later if needed)
const LINKING_MODE = "LINKED"; // keep chart refreshable from Sheets
const WIDTH_PT = 288;          // ~8.0 in
const HEIGHT_PT = 162;         // ~4.5 in
const MARGIN_PT = 24;          // 0.33 in top/left

export type InsertSheetsChartResult = {
    presentationId: string;
    pageObjectId: string;   // last slide id
    chartObjectId: string;  // element id in Slides
};

export async function insertSheetsChartToLastSlide(
    accessToken: string,
    presentationId: string,
    spreadsheetId: string,
    chartId: number
): Promise<InsertSheetsChartResult> {
    // 1) Find the last slide
    const pres = await googleFetch<{ slides?: { objectId: string }[] }>(
        `${SLIDES_BASE}/${encodeURIComponent(presentationId)}?fields=slides(objectId)`,
        { method: "GET", accessToken }
    );
    const slides = pres.slides ?? [];
    if (slides.length === 0) throw new Error("Presentation has no slides.");
    const lastSlideId = slides[slides.length - 1]!.objectId;

    // 2) Insert the Sheets chart on the last slide
    const body = {
        requests: [
            {
                createSheetsChart: {
                    spreadsheetId,
                    chartId,
                    linkingMode: LINKING_MODE,
                    elementProperties: {
                        pageObjectId: lastSlideId,
                        size: {
                            width: { magnitude: WIDTH_PT, unit: "PT" },
                            height: { magnitude: HEIGHT_PT, unit: "PT" },
                        },
                        transform: {
                            scaleX: 1,
                            scaleY: 1,
                            translateX: MARGIN_PT,
                            translateY: MARGIN_PT,
                            unit: "PT",
                        },
                    },
                },
            },
        ],
    };

    const resp = await googleFetch<{ replies?: { createSheetsChart?: { objectId: string } }[] }>(
        `${SLIDES_BASE}/${encodeURIComponent(presentationId)}:batchUpdate`,
        { method: "POST", accessToken, body: JSON.stringify(body) }
    );

    const chartObjectId = resp.replies?.[0]?.createSheetsChart?.objectId;
    if (!chartObjectId) throw new Error("Slides API did not return a chart objectId.");

    return { presentationId, pageObjectId: lastSlideId, chartObjectId };
}
