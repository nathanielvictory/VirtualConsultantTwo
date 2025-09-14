// src/pages/ReactAdmin/projects/ProjectEdit.tsx
import {
    Edit,
    SimpleForm,
    TextInput,
    BooleanInput,
    ReferenceInput,
    AutocompleteInput,
    Toolbar,
    SaveButton,
    DeleteButton,
    required,
} from "react-admin";
import { Stack } from "@mui/material";

const EditToolbar = (props: any) => (
    <Toolbar {...props}>
        <Stack direction="row" spacing={2} sx={{ width: "100%", justifyContent: "flex-end" }}>
            <DeleteButton />
            <SaveButton />
        </Stack>
    </Toolbar>
);

export function ProjectEdit() {
    return (
        <Edit title="Edit Project">
            <SimpleForm toolbar={<EditToolbar />}>
                <TextInput source="id" disabled />

                {/* Required, same as Create */}
                <TextInput source="name" label="Name" validate={[required()]} fullWidth />
                <TextInput source="kbid" label="KB Id" validate={[required()]} fullWidth />

                <ReferenceInput
                    source="organizationId"
                    reference="organizations"
                    label="Organization"
                    perPage={25}
                    sort={{ field: "name", order: "ASC" }}
                >
                    <AutocompleteInput
                        optionText="name"
                        optionValue="id"               // string ID
                        filterToQuery={(q) => ({ search: q })}
                        validate={[required()]}        // keep required here too
                        fullWidth
                    />
                </ReferenceInput>

                <TextInput
                    source="projectContext"
                    label="Context"
                    multiline
                    minRows={3}
                    fullWidth
                />
                <BooleanInput source="isActive" label="Active" />
            </SimpleForm>
        </Edit>
    );
}
