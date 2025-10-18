export default function buildCrosstabColumnChartSpec(
    sheetId: number,
    title: string,
    dims: { rows: number; cols: number }
) {
    const { rows, cols } = dims; // includes header row & header col
    const headerCount = 1;

    // X-axis: energy sources from header row (row 0), columns B..last
    const domainSource = {
        sheetId,
        startRowIndex: 0,
        endRowIndex: 1,
        startColumnIndex: 1,
        endColumnIndex: cols,
    };

    // SERIES: each approval row (1..rows-1), BUT include column A
    // so headerCount can use it as the legend label.
    const seriesSources = [];
    for (let r = 1; r < rows; r++) {
        seriesSources.push({
            sheetId,
            startRowIndex: r,
            endRowIndex: r + 1,
            startColumnIndex: 0, // <-- include A (labels)
            endColumnIndex: cols, // data spans B..last; A is treated as header
        });
    }

    return {
        spec: {
            title,
            basicChart: {
                chartType: "COLUMN",
                stackedType: "STACKED",
                legendPosition: "BOTTOM_LEGEND",
                headerCount, // allows first row/col to be used as headers
                axis: [
                    { position: "BOTTOM_AXIS", title: "Energy source" },
                    { position: "LEFT_AXIS",   title: "Percentage" },
                ],
                domains: [{ domain: { sourceRange: { sources: [domainSource] } } }],
                series: seriesSources.map(src => ({
                    series: { sourceRange: { sources: [src] } },
                    type: "COLUMN",
                    targetAxis: "LEFT_AXIS",
                })),
            },
        },
        position: {
            overlayPosition: { anchorCell: { sheetId, rowIndex: 1, columnIndex: 3 } },
        },
    };
}
