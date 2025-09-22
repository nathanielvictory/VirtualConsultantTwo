import { useState } from 'react';
import {
    Alert,
    Button,
    Paper,
    Skeleton,
    Stack,
    Typography,
} from "@mui/material";

import { useGetApiInsightsQuery } from "../../../api/insightsApi";
import InsightItem from "./InsightItem";

type InsightsListProps = {
    projectId?: number;
    onRefetched?: () => void;
};

export default function InsightsList({ projectId, onRefetched }: InsightsListProps) {
    const [page, setPage] = useState(1);
    const pageSize = 50;

    const { data, isLoading, isError, isFetching, refetch } = useGetApiInsightsQuery(
        { projectId, page, pageSize, sort: "orderIndex asc, id asc" },
        { skip: projectId == null }
    );

    const items = data?.items ?? [];
    const hasPrev = !!data?.hasPrevious;
    const hasNext = !!data?.hasNext;

    const handleUpdated = () => {
        refetch().finally(() => onRefetched?.());
    };

    const handleDeleted = (_id: number) => {
        if (items.length === 1 && hasPrev) {
            setPage((p) => Math.max(1, p - 1));
        }
        refetch().finally(() => onRefetched?.());
    };

    if (projectId == null) {
        return <Alert severity="info">No project selected.</Alert>;
    }

    if (isError) {
        return (
            <Alert
                severity="error"
                action={
                    <Button color="inherit" size="small" onClick={() => refetch()}>
                        Retry
                    </Button>
                }
            >
                Failed to load insights.
            </Alert>
        );
    }

    return (
        <>
            <Stack spacing={1.25}>
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <Paper key={i} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                            <Skeleton width="30%" />
                            <Skeleton />
                        </Paper>
                    ))
                ) : items.length === 0 ? (
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: "center" }}>
                        <Typography color="text.secondary">No insights yet.</Typography>
                    </Paper>
                ) : (
                    items.map((it) => (
                        <InsightItem
                            key={it.id}
                            insight={{ id: it.id!, content: it.content, source: it.source }}
                            onUpdated={handleUpdated}
                            onDeleted={handleDeleted}
                        />
                    ))
                )}
            </Stack>

            {/* Pagination */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Page {data?.page ?? page} / {data?.totalPages ?? "—"} • Total {data?.totalCount ?? "—"}
                    {isFetching ? " • Updating…" : ""}
                </Typography>
                <Stack direction="row" gap={1}>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={!hasPrev}
                    >
                        Previous
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={!hasNext}
                    >
                        Next
                    </Button>
                </Stack>
            </Stack>
        </>
    );
}
