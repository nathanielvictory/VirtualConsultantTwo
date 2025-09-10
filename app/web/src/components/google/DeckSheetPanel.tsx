import { useEffect, useMemo, useState } from 'react';
import {
    Stack,
    Typography,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Link,
    CircularProgress,
    Box,
} from '@mui/material';

import { useAppSelector } from '../../store/hooks';

import { type DriveFile } from '../../integrations/google/drive';
import {
    createGooglePresentation,
    listGooglePresentations,
    getSlidesEditUrl,
} from '../../integrations/google/slidesApi/presentations';
import {
    createGoogleSpreadsheet,
    listGoogleSpreadsheets,
    getSheetsEditUrl,
} from '../../integrations/google/sheetsApi/spreadsheets';

function timestampedTitle(prefix = 'POC Pair') {
    return `${prefix} — ${new Date().toLocaleString()}`;
}

export default function DeckSheetPanel() {
    const google = useAppSelector((s) => s.auth.google);
    const token = google?.accessToken;

    const [loadingSlides, setLoadingSlides] = useState(false);
    const [slides, setSlides] = useState<DriveFile[]>([]);
    const [selectedSlideId, setSelectedSlideId] = useState<string>('');

    const [pairedSheet, setPairedSheet] = useState<DriveFile | null>(null);
    const [loadingPair, setLoadingPair] = useState(false);

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [slidesIframeKey, setSlidesIframeKey] = useState(0);
    const [sheetsIframeKey, setSheetsIframeKey] = useState(0);

    const selectedSlide = useMemo(() => slides.find((s) => s.id === selectedSlideId), [slides, selectedSlideId]);

    // Load recent slides on mount / token change
    useEffect(() => {
        if (!token) return;
        let cancelled = false;
        (async () => {
            setLoadingSlides(true);
            setError(null);
            try {
                const items = await listGooglePresentations(token, { pageSize: 25 });
                if (!cancelled) {
                    setSlides(items);
                    if (items.length && !selectedSlideId) setSelectedSlideId(items[0].id);
                }
            } catch (e: any) {
                if (!cancelled) setError(e?.message ?? 'Failed to load Slides.');
            } finally {
                if (!cancelled) setLoadingSlides(false);
            }
        })();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    // Infer paired Sheet by exact name match
    useEffect(() => {
        if (!token || !selectedSlide) {
            setPairedSheet(null);
            return;
        }
        let cancelled = false;
        (async () => {
            setLoadingPair(true);
            try {
                const sheets = await listGoogleSpreadsheets(token, { pageSize: 50 });
                const match = sheets.find((sh) => sh.name === selectedSlide.name) || null;
                if (!cancelled) setPairedSheet(match);
            } catch (e: any) {
                if (!cancelled) setError(e?.message ?? 'Failed to search for paired Sheet.');
            } finally {
                if (!cancelled) setLoadingPair(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [token, selectedSlide]);

    async function handleCreatePair() {
        if (!token) return;
        setBusy(true);
        setError(null);
        try {
            const title = timestampedTitle();
            const [slideFile, sheetFile] = await Promise.all([
                createGooglePresentation(token, title),
                createGoogleSpreadsheet(token, title),
            ]);

            setSlides((prev) => [slideFile, ...prev]);
            setSelectedSlideId(slideFile.id);
            setPairedSheet(sheetFile);

            setSlidesIframeKey((k) => k + 1);
            setSheetsIframeKey((k) => k + 1);
        } catch (e: any) {
            setError(e?.message ?? 'Failed to create Slide + Sheet.');
        } finally {
            setBusy(false);
        }
    }

    const slideIframeSrc = selectedSlide ? getSlidesEditUrl(selectedSlide.id) : undefined;
    const sheetIframeSrc = pairedSheet ? getSheetsEditUrl(pairedSheet.id) : undefined;

    return (
        <Stack spacing={2} sx={{ width: '100%', alignSelf: 'stretch' }}>
            <Typography variant="h6">Slide + Sheet (paired by title)</Typography>

            <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={handleCreatePair} disabled={busy || !token}>
                    Create New Pair
                </Button>
            </Stack>

            {/* Slide selector */}
            {loadingSlides ? (
                <Stack direction="row" alignItems="center" spacing={1}>
                    <CircularProgress size={20} />
                    <Typography variant="body2">Loading Slides…</Typography>
                </Stack>
            ) : (
                <FormControl size="small" sx={{ minWidth: 320 }}>
                    <InputLabel id="slide-select-label">Recent Slides</InputLabel>
                    <Select
                        labelId="slide-select-label"
                        label="Recent Slides"
                        value={selectedSlideId}
                        onChange={(e) => setSelectedSlideId(e.target.value)}
                    >
                        {slides.map((d) => (
                            <MenuItem key={d.id} value={d.id}>
                                {d.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}

            {/* Paired sheet status */}
            <Stack direction="row" spacing={1} alignItems="center">
                {loadingPair ? (
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <CircularProgress size={16} />
                        <Typography variant="body2">Finding paired Sheet…</Typography>
                    </Stack>
                ) : pairedSheet ? (
                    <Typography variant="body2">
                        Paired Sheet: <Link href={pairedSheet.webViewLink} target="_blank" rel="noreferrer">{pairedSheet.name}</Link>
                    </Typography>
                ) : (
                    <Typography variant="body2">No paired Sheet found for the selected Slide name.</Typography>
                )}
            </Stack>

            {/* Embedded Slide */}
            {slideIframeSrc && (
                <Box sx={{ mt: 1, border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden', width: '100%' }}>
                    <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
                        Embedded Google Slide — Editable ({selectedSlide?.name ?? selectedSlideId})
                    </Typography>
                    <Box
                        key={slidesIframeKey}
                        component="iframe"
                        src={slideIframeSrc}
                        width="100%"
                        height={560}
                        sx={{ border: 0, display: 'block' }}
                        allow="clipboard-write; clipboard-read; fullscreen"
                        loading="lazy"
                    />
                </Box>
            )}

            {/* Embedded Sheet */}
            {sheetIframeSrc && (
                <Box sx={{ mt: 1, border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden', width: '100%' }}>
                    <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
                        Embedded Google Sheet — Editable ({pairedSheet?.name ?? pairedSheet?.id})
                    </Typography>
                    <Box
                        key={sheetsIframeKey}
                        component="iframe"
                        src={sheetIframeSrc}
                        width="100%"
                        height={720}
                        sx={{ border: 0, display: 'block' }}
                        allow="clipboard-write; clipboard-read; fullscreen"
                        loading="lazy"
                    />
                </Box>
            )}

            {error && (
                <Typography variant="body2" color="error">
                    {error}
                </Typography>
            )}
        </Stack>
    );
}
