

export default function buildPieChartSpec(sheetId: number, title: string) {
    return {
        spec: {
            title,
            pieChart: {
                legendPosition: "RIGHT_LEGEND",
                threeDimensional: false,
                domain: {
                    sourceRange: {
                        sources: [
                            {
                                sheetId,
                                startRowIndex: 0,
                                startColumnIndex: 0,
                                endColumnIndex: 1,
                            },
                        ],
                    },
                },
                series: {
                    sourceRange: {
                        sources: [
                            {
                                sheetId,
                                startRowIndex: 0,
                                startColumnIndex: 1,
                                endColumnIndex: 2,
                            },
                        ],
                    },
                },
            },
        },
        position: {
            overlayPosition: {
                anchorCell: { sheetId, rowIndex: 1, columnIndex: 3 },
            },
        },
    };
}