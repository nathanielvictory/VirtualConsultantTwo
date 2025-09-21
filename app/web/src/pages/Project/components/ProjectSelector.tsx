import { useMemo, useState } from "react";
import { Autocomplete, TextField, Stack, FormControlLabel, Switch, CircularProgress } from "@mui/material";
// Replace with your actual generated hook for listing projects
import { useGetApiProjectsQuery } from "../../../api/projectsApi";

export type ProjectOption = {
    id: number;
    name: string;
};

type ProjectSelectorProps = {
    onSelect: (projectId: number | null) => void;
    disabled?: boolean;
};

/**
 * Minimal project selector with:
 * - Search-as-you-type (sets `search` param)
 * - "Active Only" toggle (adds isActive=true when on; omits when off)
 */
export default function ProjectSelector({ onSelect, disabled }: ProjectSelectorProps) {
    const [search, setSearch] = useState("");
    const [activeOnly, setActiveOnly] = useState(true);

    const queryArgs = useMemo(
        () => ({
            search: search || undefined,
            isActive: activeOnly ? true : undefined,
            page: 1,
            pageSize: 20,
        }),
        [search, activeOnly]
    );

    const { data, isFetching } = useGetApiProjectsQuery(queryArgs);
    const options: ProjectOption[] = (data as any)?.items ?? [];

    return (
        <Stack spacing={1}>
            <FormControlLabel
                control={<Switch checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} />}
                label="Active Only"
            />

            <Autocomplete<ProjectOption>
                disabled={disabled}
                loading={isFetching}
                options={options}
                getOptionLabel={(o) => o?.name ?? ""}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                onChange={(_, value) => onSelect(value ? value.id : null)}
                inputValue={search}
                onInputChange={(_, value) => setSearch(value)}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Search projects"
                        placeholder="Type to search…"
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {isFetching ? <CircularProgress size={18} /> : null}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        }}
                    />
                )}
            />
        </Stack>
    );
}
