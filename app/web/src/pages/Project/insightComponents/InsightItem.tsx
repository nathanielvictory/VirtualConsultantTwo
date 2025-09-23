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
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import {
    usePatchApiInsightsByIdMutation,
    useDeleteApiInsightsByIdMutation,
    type InsightSource,
} from "../../../api/insightsApi";

type InsightItemProps = {
    insight: {
        id: number;
        content?: string | null;
        orderIndex: number;
        source?: InsightSource | null;
    };
    /** notify parent so it can refetch or adjust pagination */
    onUpdated?: (id: number, newContent: string) => void;
    onDeleted?: (id: number) => void;
};

export default function InsightItem({
                                        insight
                                    }: InsightItemProps) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [text, setText] = React.useState(insight.content ?? "");

    const [patchInsight, { isLoading: isSaving }] =
        usePatchApiInsightsByIdMutation();
    const [deleteInsight, { isLoading: isDeleting }] =
        useDeleteApiInsightsByIdMutation();

    const startEdit = () => setIsEditing(true);
    const cancelEdit = () => {
        setText(insight.content ?? "");
        setIsEditing(false);
    };

    const saveEdit = async () => {
        await patchInsight({
            id: insight.id,
            updateInsightDto: { content: text },
        }).unwrap();
        setIsEditing(false);
    };

    const handleDelete = async () => {
        await deleteInsight({ id: insight.id }).unwrap();
    };

    const moveUp = async () => {
        await patchInsight({
            id: insight.id,
            updateInsightDto: { orderIndex: insight.orderIndex - 1 },
        }).unwrap();
    };

    const moveDown = async () => {
        await patchInsight({
            id: insight.id,
            updateInsightDto: { orderIndex: insight.orderIndex + 1 },
        }).unwrap();
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

                <Stack direction="column" gap={0.5} alignItems="flex-end" flexShrink={0}>
                    <Stack direction="row" gap={0.5} alignItems="center">
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

                    {/* Only show arrows when editing */}
                    {isEditing && (
                        <Stack direction="row" gap={0.5}>
                            <Tooltip title="Move up">
                <span>
                  <IconButton size="small" onClick={moveUp} disabled={isSaving}>
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                </span>
                            </Tooltip>
                            <Tooltip title="Move down">
                <span>
                  <IconButton size="small" onClick={moveDown} disabled={isSaving}>
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                </span>
                            </Tooltip>
                        </Stack>
                    )}
                </Stack>
            </Stack>
        </Paper>
    );
}
