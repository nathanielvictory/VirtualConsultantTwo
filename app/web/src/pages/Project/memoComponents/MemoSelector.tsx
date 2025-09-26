// src/pages/memoComponents/MemoSelector.tsx
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
import { useGetApiMemosQuery, useGetApiMemosByIdQuery } from '../../../api/memosApi';

// --- Helper: debouncer ---
function useDebouncedValue<T>(value: T, delayMs = 300) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(t);
    }, [value, delayMs]);
    return debounced;
}

type MemoOption = {
    id: number;
    name: string;
};

type MemoSelectorProps = {
    /** Current project scope; if null, component shows a helper message */
    projectId: number | null;
    /** (Optional) currently selected memo id to show its name */
    memoId?: number | null;
    /** Fired when a memo is chosen */
    onSelect: (memoId: number) => void;
    /** Toggles */
    showTitle?: boolean; // default true
    showCurrent?: boolean; // default true
    /** Visual density */
    variant?: 'default' | 'compact';
};

export default function MemoSelector({
                                         projectId,
                                         memoId = null,
                                         onSelect,
                                         showTitle = true,
                                         showCurrent = true,
                                         variant = 'default',
                                     }: MemoSelectorProps) {
    // Header: get current memo's name (if provided)
    const { data: currentMemo, isFetching: isFetchingCurrent } = useGetApiMemosByIdQuery(
        { id: memoId as number },
        { skip: memoId == null }
    );

    const currentMemoName = memoId == null
        ? '—'
        : isFetchingCurrent
            ? 'Loading…'
            : currentMemo?.name ?? String(memoId);

    // Search state
    const [input, setInput] = useState('');
    const debounced = useDebouncedValue(input, 300);

    const { data, isFetching, isError } = useGetApiMemosQuery(
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

    const options: MemoOption[] = useMemo(() => {
        const items = data?.items ?? [];
        return items
            .filter((m): m is Required<Pick<MemoOption, 'id' | 'name'>> & Partial<typeof m> => m.id != null)
            .map((m) => ({ id: m.id as number, name: m.name ?? `Memo #${m.id}` }));
    }, [data]);

    // Compact spacing preset
    const spacing = variant === 'compact' ? 1 : 2;

    return (
        <>
            {showTitle && (
                <Typography variant="h5">Select a memo</Typography>
            )}

            {showCurrent && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Currently selected memo: {currentMemoName}
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
                        noOptionsText={isError ? 'Failed to load memos' : 'No memos found'}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Search memos"
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
