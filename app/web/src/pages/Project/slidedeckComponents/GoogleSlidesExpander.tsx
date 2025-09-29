// GoogleDocExpander.tsx
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    CircularProgress,
    Stack,
    Box,
    IconButton,
    Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

import GoogleSlidesFrame from '../../../components/google/GoogleSlidesFrame'; // adjust path if needed
import { useAppSelector } from '../../../store/hooks';
import { useState } from 'react';
import {useGetApiSlidedecksByIdQuery} from "../../../api/slidedecksApi.ts";

export default function GoogleSlidesExpander() {
    const slidedeckId = useAppSelector((s) => s.selected.slidedeckId);

    const { data: slidedeck, isLoading, isError, error } = useGetApiSlidedecksByIdQuery(
        { id: slidedeckId! },
        { skip: !slidedeckId }
    );

    const slidesId = slidedeck?.presentationId as string | undefined;
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleOpenFull = (e: React.MouseEvent) => {
        // prevent toggling the accordion when clicking the icon
        e.stopPropagation();
        setIsFullscreen(true);
    };

    return (
        <>
            <Accordion /* collapsed by default (no defaultExpanded prop) */>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
                        <Typography variant="subtitle1">Google Slides</Typography>
                        {!!slidesId && (
                            <Tooltip title="Open full page">
                                <IconButton
                                    size="small"
                                    onClick={handleOpenFull}
                                    onFocus={(e) => e.stopPropagation()}
                                >
                                    <FullscreenIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Stack>
                </AccordionSummary>

                <AccordionDetails>
                    {isLoading ? (
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <CircularProgress size={18} />
                            <Typography variant="body2">Loading memo…</Typography>
                        </Stack>
                    ) : isError ? (
                        <Typography variant="body2" color="error">
                            {(error as any)?.message || 'Failed to load memo.'}
                        </Typography>
                    ) : !slidesId ? (
                        <Typography variant="body2">No memo selected.</Typography>
                    ) : !slidesId ? (
                        <Typography variant="body2">This memo has no linked Google Doc.</Typography>
                    ) : (
                        <GoogleSlidesFrame slidesId={slidesId} />
                    )}
                </AccordionDetails>
            </Accordion>

            {/* Full-page overlay that does NOT affect accordion expansion state */}
            {isFullscreen && !!slidesId && (
                <Box
                    sx={{
                        position: 'fixed',
                        inset: 0,
                        bgcolor: 'background.paper',
                        zIndex: (theme) => theme.zIndex.modal + 1,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Box
                        sx={{
                            p: 1,
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            borderBottom: 1,
                            borderColor: 'divider',
                        }}
                    >
                        <Tooltip title="Exit full page">
                            <IconButton onClick={() => setIsFullscreen(false)}>
                                <FullscreenExitIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Box sx={{ flex: 1, minHeight: 0 }}>
                        <GoogleSlidesFrame slidesId={slidesId} height="100vh" />
                    </Box>
                </Box>
            )}
        </>
    );
}
