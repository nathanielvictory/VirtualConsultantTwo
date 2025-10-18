// integrations/google/sheetsApi/writeGrid.ts
// Minimal helper to add a new sheet (tab) at the end of a spreadsheet and write a Grid to it.
// Keeps conventions consistent with other Google integrations (use googleFetch for auth + errors).

import { googleFetch } from "../googleFetch";
import { getSheetsEditUrl } from "./spreadsheets";

export type Grid = (string | number)[][];

/** Convenience return type. */
export type WriteGridResult = {
    spreadsheetId: string;
    sheetId: number;
    title: string;
    editUrl: string;
};

const SHEETS_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

/**
 * Adds a new tab at the end of the spreadsheet and writes the provided grid to A1.
 *
 * - If `title` is omitted, a sensible, non-colliding title will be chosen (e.g. "Sheet 4").
 * - Values are written RAW by default.
 */
export async function writeGridToNewSheet(
    accessToken: string,
    spreadsheetId: string,
    grid: Grid,
    opts: { title?: string; } = {}
): Promise<WriteGridResult> {
    const valueInputOption = "RAW";

    // 1) Fetch current sheet count + titles to determine insertion index and avoid collisions
    const meta = await googleFetch<{
        sheets?: { properties?: { sheetId: number; title: string; index: number } }[];
    }>(
        `${SHEETS_BASE}/${encodeURIComponent(spreadsheetId)}?fields=sheets(properties(sheetId,title,index))`,
        { method: "GET", accessToken }
    );

    const existingSheets = meta.sheets ?? [];
    const endIndex = existingSheets.length; // append at the end

    // Compute a non-colliding title if not provided
    const baseTitle = opts.title ?? `Sheet ${endIndex + 1}`;
    const existingTitles = new Set(existingSheets.map((s) => s.properties?.title).filter(Boolean) as string[]);
    let title = baseTitle;
    if (existingTitles.has(title)) {
        let i = 2;
        while (existingTitles.has(`${baseTitle} (${i})`)) i++;
        title = `${baseTitle} (${i})`;
    }

    // 2) Add the new sheet at the end (index = current sheet count)
    const addResp = await googleFetch<{ replies?: { addSheet?: { properties?: { sheetId: number; title: string; index: number } } }[] }>(
        `${SHEETS_BASE}/${encodeURIComponent(spreadsheetId)}:batchUpdate`,
        {
            method: "POST",
            accessToken,
            body: JSON.stringify({
                requests: [
                    {
                        addSheet: {
                            properties: {
                                title,
                                index: endIndex,
                            },
                        },
                    },
                ],
            }),
        }
    );

    const newProps = addResp.replies?.[0]?.addSheet?.properties;
    if (!newProps?.sheetId || !newProps?.title) {
        throw new Error("Sheets API: failed to create new sheet");
    }

    // 3) Write values to A1 on the new sheet
    const range = `${newProps.title}!A1`;
    await googleFetch(
        `${SHEETS_BASE}/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}?valueInputOption=${encodeURIComponent(valueInputOption)}`,
        {
            method: "PUT",
            accessToken,
            body: JSON.stringify({
                range,
                majorDimension: "ROWS",
                values: grid,
            }),
        }
    );

    return {
        spreadsheetId,
        sheetId: newProps.sheetId,
        title: newProps.title,
        editUrl: getSheetsEditUrl(spreadsheetId),
    };
}

/*
Example usage:

import { writeGridToNewSheet, type Grid } from "./writeGrid";

const grid: Grid = [
  ["Name", "Score", "Passed"],
  ["Ada", 95, "Yes"],
  ["Linus", 87, "Yes"],
  ["Grace", 72, "Yes"],
  ["Edsger", 64, "No"],
];

const result = await writeGridToNewSheet(accessToken, spreadsheetId, grid);
console.log(`Created sheet "${result.title}" (id ${result.sheetId}) → ${result.editUrl}`);
*/
