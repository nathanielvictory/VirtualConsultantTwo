// src/components/ChartOverlay/AnswerGridDisplay.tsx
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";

export type Grid = (string | number)[][];

type Props = {
    grid: Grid;
};

export default function AnswerGridDisplay({ grid }: Props) {
    if (!grid || grid.length === 0) return null;

    const header = grid[0];
    const body = grid.slice(1);

    const formatValue = (value: string | number): string => {
        if (typeof value === "number") {
            if (Number.isNaN(value)) return "—";
            return `${Math.round(value)}%`;
        }
        if (typeof value === "string") {
            if (value.length > 20) return value.slice(0, 20) + "…";
            return value;
        }
        return "—";
    };

    return (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        {header.map((cell, i) => (
                            <TableCell key={i}>{formatValue(cell)}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {body.map((row, rIdx) => (
                        <TableRow key={rIdx}>
                            {row.map((cell, cIdx) => (
                                <TableCell key={cIdx} align={cIdx > 0 ? "right" : "left"}>
                                    {formatValue(cell)}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
