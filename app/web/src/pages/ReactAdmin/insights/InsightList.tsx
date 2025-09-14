import {
    List,
    Datagrid,
    TextField,
    NumberField,
    SelectField,
    ReferenceField,
    TextInput,
    ReferenceInput,
    AutocompleteInput,
    SelectInput,
    TopToolbar,
    CreateButton,
} from "react-admin";
import { Box } from "@mui/material";

const SOURCE_CHOICES = [
    { id: 0, name: "Llm" },
    { id: 1, name: "User" },
];

const filters = [
    <TextInput key="search" source="search" label="Search" alwaysOn />,
    <ReferenceInput
        key="project"
        source="projectId"
        reference="projects"
        label="Project"
        perPage={25}
        sort={{ field: "name", order: "ASC" }}
    >
        <AutocompleteInput
            optionText="name"
            optionValue="id"
            filterToQuery={(q) => ({ search: q })}
            fullWidth
        />
    </ReferenceInput>,
    <SelectInput
        key="source"
        source="source"
        label="Source"
        choices={SOURCE_CHOICES}
        emptyText="All"
    />,
];

const ListActions = () => (
    <TopToolbar>
        <Box sx={{ flex: 1 }} />
        <CreateButton />
    </TopToolbar>
);

export function InsightList() {
    return (
        <List
            title="Insights"
            filters={filters}
            actions={<ListActions />}
            sort={{ field: "orderIndex", order: "ASC" }}
            perPage={25}
        >
            <Datagrid rowClick="show">
                <NumberField source="id" />
                <ReferenceField
                    label="Project"
                    source="projectId"
                    reference="projects"
                    link="show"
                >
                    <TextField source="name" />
                </ReferenceField>
                <NumberField source="orderIndex" />
                <SelectField source="source" choices={SOURCE_CHOICES} />
                <TextField source="content" />
            </Datagrid>
        </List>
    );
}
