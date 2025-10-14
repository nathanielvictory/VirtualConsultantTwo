import {
    List,
    Datagrid,
    TextField,
    NumberField,
    DateField,
    TextInput,
    ReferenceInput,
    AutocompleteInput,
    TopToolbar,
    CreateButton,
    ReferenceField,
} from "react-admin";
import { Box } from "@mui/material";

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
];

const ListActions = () => (
    <TopToolbar>
        <Box sx={{ flex: 1 }} />
        <CreateButton />
    </TopToolbar>
);

export function SlidedeckList() {
    return (
        <List
            title="Slidedecks"
            filters={filters}
            actions={<ListActions />}
            sort={{ field: "updatedAt", order: "DESC" }}
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
                <TextField source="name" label="Title" />
                <TextField source="presentationId" label="Presentation Id" />
                <TextField source="sheetsId" label="Sheets Id" />
                <TextField source="promptFocus" label="Prompt Focus" />
                <ReferenceField
                    label="Created By"
                    source="createdById"
                    reference="users"
                    link="show"
                />
                <DateField source="updatedAt" />
                <DateField source="createdAt" />
            </Datagrid>
        </List>
    );
}
