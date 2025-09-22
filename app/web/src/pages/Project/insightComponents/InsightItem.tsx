import * as React from "react";
import {
    Chip,
    IconButton,
    Paper,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";

import {
    usePatchApiInsightsByIdMutation,
    useDeleteApiInsightsByIdMutation,
    type InsightSource,
} from "../../../api/insightsApi";

type InsightItemProps = {
    insight: {
        id: number;
        content?: string | null;
        source?: InsightSource | null;
    };
    /** notify parent so it can refetch or adjust pagination */
    onUpdated?: (id: number, newContent: string) => void;
    onDeleted?: (id: number) => void;
};

export default function InsightItem({ insight, onUpdated, onDeleted }: InsightItemProps) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [text, setText] = React.useState(insight.content ?? "");

    const [patchInsight, { isLoading: isSaving }] = usePatchApiInsightsByIdMutation();
    const [deleteInsight, { isLoading: isDeleting }] = useDeleteApiInsightsByIdMutation();

    React.useEffect(() => {
        // keep text in sync if parent data refreshes while not editing
        if (!isEditing) setText(insight.content ?? "");
    }, [insight.content, isEditing]);

    const startEdit = () => setIsEditing(true);
    const cancelEdit = () => {
        setText(insight.content ?? "");
        setIsEditing(false);
    };

    const saveEdit = async () => {
        await patchInsight({ id: insight.id, updateInsightDto: { content: text } }).unwrap();
        setIsEditing(false);
        onUpdated?.(insight.id, text);
    };

    const handleDelete = async () => {
        await deleteInsight({ id: insight.id }).unwrap();
        onDeleted?.(insight.id);
    };

    return (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                {isEditing ? (
                    <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                ) : (
                    <Typography sx={{ whiteSpace: "pre-wrap" }}>{insight.content}</Typography>
                )}

                <Stack direction="row" gap={0.5} flexShrink={0}>
                    <Chip size="small" label={insight.source ?? "—"} variant="outlined" />

                    {isEditing ? (
                        <>
                            <Tooltip title="Save">
                <span>
                  <IconButton size="small" onClick={saveEdit} disabled={isSaving}>
                    <SaveIcon fontSize="small" />
                  </IconButton>
                </span>
                            </Tooltip>
                            <Tooltip title="Cancel">
                                <IconButton size="small" onClick={cancelEdit}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </>
                    ) : (
                        <>
                            <Tooltip title="Edit">
                <span>
                  <IconButton size="small" onClick={startEdit} disabled={isSaving}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </span>
                            </Tooltip>
                            <Tooltip title="Delete">
                <span>
                  <IconButton size="small" onClick={handleDelete} disabled={isDeleting}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </span>
                            </Tooltip>
                        </>
                    )}
                </Stack>
            </Stack>
        </Paper>
    );
}
