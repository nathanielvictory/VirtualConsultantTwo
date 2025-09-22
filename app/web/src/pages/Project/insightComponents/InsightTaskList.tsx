import * as React from "react";
import { Alert, Box, Paper, Stack, Typography } from "@mui/material";
import {
    useGetApiTasksQuery,
    type TaskListItemDto,
    type TaskDetailDto,
} from "../../../api/tasksApi";
import InsightTask from "./InsightTask";

type InsightTaskListProps = {
    projectId?: number;
    listPollEveryMs?: number;   // default 2000
    taskPollEveryMs?: number;   // default 1500
    highlightTaskId?: number | null;
    onComplete?: () => void;    // fires when our active list becomes empty (after dismiss or pruning)
    onAnyTaskCompleted?: (taskId: number, task: TaskDetailDto) => void; // refresh insights list
    seedTaskIds?: number[];
};

type ActiveTask = { id: number; createdAtMs: number };
const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

export default function InsightTaskList({
                                            projectId,
                                            listPollEveryMs = 2000,
                                            taskPollEveryMs = 1500,
                                            highlightTaskId = null,
                                            onComplete,
                                            onAnyTaskCompleted,
                                            seedTaskIds = [],
                                        }: InsightTaskListProps) {
    // Our source of truth; we do NOT remove on completion
    const [active, setActive] = React.useState<ActiveTask[]>([]);

    React.useEffect(() => {
        setActive([]);
    }, [projectId]);

    // seed newly queued task ids as "now"
    React.useEffect(() => {
        if (!seedTaskIds?.length) return;
        setActive((prev) => {
            const seen = new Set(prev.map((t) => t.id));
            const now = Date.now();
            const seeded = seedTaskIds
                .filter((id) => !seen.has(id))
                .map((id) => ({ id, createdAtMs: now }));
            return prev.concat(seeded);
        });
    }, [seedTaskIds]);

    // Discover new tasks (Queued + Running)
    const queued = useGetApiTasksQuery(
        { projectId, status: "Queued", type: "Insights", page: 1, pageSize: 100, sort: "createdAt desc" },
        { skip: projectId == null }
    );
    const running = useGetApiTasksQuery(
        { projectId, status: "Running", type: "Insights", page: 1, pageSize: 100, sort: "createdAt desc" },
        { skip: projectId == null }
    );

    const discovered: ActiveTask[] = React.useMemo(() => {
        const now = Date.now();
        const cutoff = now - FOUR_HOURS_MS;
        const rows: TaskListItemDto[] = [
            ...(queued.data?.items ?? []),
            ...(running.data?.items ?? []),
        ].filter((t): t is TaskListItemDto & { id: number } => typeof t.id === "number");

        rows.sort((a, b) => {
            const rank = (s?: string) => (s === "Running" ? 0 : 1);
            const byStatus = rank(a.status as string) - rank(b.status as string);
            if (byStatus !== 0) return byStatus;
            const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bd - ad;
        });

        return rows
            .map((t) => ({
                id: t.id!,
                createdAtMs: t.createdAt ? new Date(t.createdAt).getTime() : now,
            }))
            .filter((t) => t.createdAtMs >= cutoff);
    }, [queued.data?.items, running.data?.items]);

    // Merge discovered into active — never remove here
    React.useEffect(() => {
        if (!discovered.length) return;
        setActive((prev) => {
            const seen = new Set(prev.map((t) => t.id));
            const next = [...prev];
            for (const d of discovered) {
                if (!seen.has(d.id)) next.push(d);
            }
            return next;
        });
    }, [discovered]);

    // Keep discovering at an interval
    React.useEffect(() => {
        if (projectId == null) return;
        const id = window.setInterval(() => {
            void queued.refetch();
            void running.refetch();
        }, Math.max(500, listPollEveryMs));
        return () => window.clearInterval(id);
    }, [projectId, listPollEveryMs, queued.refetch, running.refetch]);

    // Prune anything older than 4 hours (time-based, not status-based)
    React.useEffect(() => {
        const now = Date.now();
        const cutoff = now - FOUR_HOURS_MS;
        setActive((prev) => prev.filter((t) => t.createdAtMs >= cutoff));
    }, [queued.data?.items, running.data?.items]);

    // Child callbacks
    const handleTaskCompleted = (tid: number, detail: TaskDetailDto) => {
        // DO NOT remove here — keep card visible until user dismisses
        onAnyTaskCompleted?.(tid, detail);
    };

    const handleTaskDismiss = (tid: number) => {
        setActive((prev) => prev.filter((t) => t.id !== tid));
    };

    // Notify page when our active list is empty
    React.useEffect(() => {
        if (active.length === 0) onComplete?.();
    }, [active.length, onComplete]);

    if (projectId == null) {
        return <Alert severity="info">No project selected.</Alert>;
    }
    if (queued.isError || running.isError) {
        return <Alert severity="error">Failed to load tasks.</Alert>;
    }

    const visible = active; // filtered by 4h rule already

    return (
        <Box sx={{ mb: 2 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2, borderStyle: "dashed" }}>
                <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                    Insight generation tasks
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Cards stay until you dismiss them
                </Typography>
            </Paper>

            {queued.isLoading && running.isLoading && visible.length === 0 ? (
                <Typography variant="body2" color="text.secondary">Loading tasks…</Typography>
            ) : visible.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No recent insight tasks.</Typography>
            ) : (
                <Stack spacing={1.25}>
                    {visible.map((t) => (
                        <InsightTask
                            key={t.id}
                            taskId={t.id}
                            pollEveryMs={taskPollEveryMs}
                            highlight={highlightTaskId === t.id}
                            onCompleted={handleTaskCompleted}  // triggers insights-list refresh, but does not remove
                            onDismiss={handleTaskDismiss}      // user removes card explicitly
                        />
                    ))}
                </Stack>
            )}
        </Box>
    );
}
