// src/pages/ReactAdmin/projects/ProjectList.tsx
import {
    List,
    Datagrid,
    TextField,
    BooleanField,
    DateField,
    TopToolbar,
    CreateButton,
    TextInput,
    BooleanInput,
    ReferenceInput,
    AutocompleteInput,
    ReferenceField,
} from "react-admin";
import { Box } from "@mui/material";

const filters = [
    // Full-text search -> mapped to { search } by your dataProvider
    <TextInput key="search" source="search" label="Search" alwaysOn />,
    // Filter by organization (autocomplete; backend expects { search: q })
    <ReferenceInput
        key="org"
        source="orgId"
        reference="organizations"
        label="Organization"
        perPage={25}
        sort={{ field: "name", order: "ASC" }}
    >
        <AutocompleteInput
            optionText="name"
            optionValue="id" // string id
            filterToQuery={(q) => ({ search: q })}
            fullWidth
        />
    </ReferenceInput>,
    // Active toggle
    <BooleanInput key="active" source="isActive" label="Active only" />,
];

const ListActions = () => (
    <TopToolbar>
        <Box sx={{ flex: 1 }} />
        <CreateButton />
    </TopToolbar>
);

export function ProjectList() {
    return (
        <List
            title="Projects"
            filters={filters}
            actions={<ListActions />}
            sort={{ field: "updatedAt", order: "DESC" }}
            perPage={25}
        >
            <Datagrid rowClick="show">
                <TextField source="id" />
                <TextField source="name" />
                <TextField source="kbid" label="KB Id" />

                {/* Show Organization NAME instead of ID */}
                <ReferenceField
                    label="Organization"
                    source="organizationId"
                    reference="organizations"
                    link="show" // or "edit" / false if you don't want a link
                >
                    <TextField source="name" />
                </ReferenceField>

                <BooleanField source="isActive" />
                <DateField source="updatedAt" />
                <DateField source="createdAt" />
                <DateField source="lastRefreshed" />
            </Datagrid>
        </List>
    );
}
