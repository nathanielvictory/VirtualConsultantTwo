// src/pages/slidedeckComponents/SlidedeckSelector.tsx
import { useEffect, useMemo, useState } from 'react';
import {
    Autocomplete,
    Box,
    CircularProgress,
    InputAdornment,
    TextField,
    Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useGetApiSlidedecksQuery, useGetApiSlidedecksByIdQuery } from '../../../api/slidedecksApi';

// --- Helper: debouncer ---
function useDebouncedValue<T>(value: T, delayMs = 300) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(t);
    }, [value, delayMs]);
    return debounced;
}

type SlidedeckOption = {
    id: number;
    name: string;
};

type SlidedeckSelectorProps = {
    /** Current project scope; if null, component shows a helper message */
    projectId: number | null;
    /** (Optional) currently selected slidedeck id to show its name */
    slidedeckId?: number | null;
    /** Fired when a slidedeck is chosen */
    onSelect: (slidedeckId: number) => void;
    /** Toggles */
    showTitle?: boolean; // default true
    showCurrent?: boolean; // default true
    /** Visual density */
    variant?: 'default' | 'compact';
};

export default function SlidedeckSelector({
                                         projectId,
                                         slidedeckId = null,
                                         onSelect,
                                         showTitle = true,
                                         showCurrent = true,
                                         variant = 'default',
                                     }: SlidedeckSelectorProps) {
    // Header: get current slidedeck's name (if provided)
    const { data: currentSlidedeck, isFetching: isFetchingCurrent } = useGetApiSlidedecksByIdQuery(
        { id: slidedeckId as number },
        { skip: slidedeckId == null }
    );

    const currentSlidedeckName = slidedeckId == null
        ? '—'
        : isFetchingCurrent
            ? 'Loading…'
            : currentSlidedeck?.name ?? String(slidedeckId);

    // Search state
    const [input, setInput] = useState('');
    const debounced = useDebouncedValue(input, 300);

    const { data, isFetching, isError } = useGetApiSlidedecksQuery(
        projectId == null
            ? // dummy args; hook is skipped below
            { projectId: undefined, page: 1, pageSize: 25, sort: 'name asc' } as any
            : {
                projectId,
                search: debounced || undefined,
                page: 1,
                pageSize: 25,
                sort: 'name asc',
            },
        { skip: projectId == null }
    );

    const options: SlidedeckOption[] = useMemo(() => {
        const items = data?.items ?? [];
        return items
            .filter((m): m is Required<Pick<SlidedeckOption, 'id' | 'name'>> & Partial<typeof m> => m.id != null)
            .map((m) => ({ id: m.id as number, name: m.name ?? `Slidedeck #${m.id}` }));
    }, [data]);

    // Compact spacing preset
    const spacing = variant === 'compact' ? 1 : 2;

    return (
        <>
            {showTitle && (
                <Typography variant="h5">Select a slidedeck</Typography>
            )}

            {showCurrent && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Currently selected slidedeck: {currentSlidedeckName}
                </Typography>
            )}

            {projectId == null ? (
                <Box sx={{ mt: spacing }}>
                    <Typography variant="body2" color="text.secondary">
                        No project selected yet. Please select a project first.
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ mt: spacing }}>
                    <Autocomplete
                        fullWidth
                        options={options}
                        getOptionLabel={(o) => o.name}
                        onChange={(_, value) => value && onSelect(value.id)}
                        loading={isFetching}
                        noOptionsText={isError ? 'Failed to load slidedecks' : 'No slidedecks found'}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Search slidedecks"
                                placeholder="Type to search by name…"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                size={variant === 'compact' ? 'small' : 'medium'}
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <>
                                            {isFetching ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />
                </Box>
            )}
        </>
    );
}
