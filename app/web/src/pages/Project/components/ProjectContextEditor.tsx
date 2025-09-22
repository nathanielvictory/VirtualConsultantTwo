import { useState } from "react";
import {
    Box,
    Button,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";


export default function ProjectContextEditor({
                           originalContext,
                           disabled,
                           isSaving,
                           numericId,
                           onSaveContext,
                       }: {
    originalContext: string;
    disabled: boolean;
    isSaving: boolean;
    numericId?: number;
    onSaveContext: (v: string) => Promise<void>;
}) {
    // Because this component is keyed by originalContext, it will remount
    // whenever originalContext changes, re-initializing state without effects.
    const [context, setContext] = useState(originalContext);
    const isDirty = context !== originalContext;

    return (
        <Stack spacing={2}>
            <Typography variant="subtitle1">Project Context</Typography>
            <TextField
                label="Context"
                placeholder="Describe goals, constraints, audience, domain vocabulary…"
                multiline
                minRows={6}
                fullWidth
                value={context}
                disabled={disabled}
                onChange={(e) => setContext(e.target.value)}
                helperText={`${context.length}/10,000`}
                inputProps={{ maxLength: 10000 }}
            />

            <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                <Button
                    variant="contained"
                    onClick={() => onSaveContext(context)}
                    disabled={!isDirty || isSaving || numericId == null}
                >
                    {isSaving ? "Saving…" : "Save Context"}
                </Button>
                <Button
                    variant="text"
                    onClick={() => setContext(originalContext)}
                    disabled={!isDirty || isSaving}
                >
                    Reset
                </Button>
                <Box sx={{ flex: 1 }} />
                <Button
                    variant="outlined"
                    component={RouterLink}
                    to={`/projects/${numericId ?? ""}/insights`}
                    disabled={isSaving || numericId == null}
                >
                    Confirm & Continue
                </Button>
            </Stack>
        </Stack>
    );
}