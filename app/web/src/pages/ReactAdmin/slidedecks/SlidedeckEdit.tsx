import {
    Edit,
    SimpleForm,
    TextInput,
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

export function SlidedeckEdit() {
    return (
        <Edit title="Edit Slidedeck">
            <SimpleForm toolbar={<EditToolbar />}>
                <TextInput source="id" disabled />

                {/* Required (same as Create) */}
                <ReferenceInput
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
                        validate={[required()]}
                        fullWidth
                    />
                </ReferenceInput>

                <TextInput
                    source="name"
                    label="Title"
                    validate={[required()]}
                    fullWidth
                />

                {/* Optional */}
                <TextInput source="presentationId" label="Presentation Id" fullWidth />
                <TextInput source="sheetsId" label="Sheets Id" fullWidth />
                <TextInput source="promptFocus" label="Prompt Focus" fullWidth />

                {/* Required */}
                <ReferenceInput
                    source="createdById"
                    reference="users"
                    label="Created By"
                    perPage={25}
                    sort={{ field: "name", order: "ASC" }}
                >
                    <AutocompleteInput
                        optionText="name"
                        optionValue="id"
                        filterToQuery={(q) => ({ search: q })}
                        validate={[required()]}
                        fullWidth
                    />
                </ReferenceInput>
            </SimpleForm>
        </Edit>
    );
}
