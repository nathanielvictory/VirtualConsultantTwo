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

export function MemoEdit() {
    return (
        <Edit title="Edit Memo">
            <SimpleForm toolbar={<EditToolbar />}>
                <TextInput source="id" disabled />

                {/* Required */}
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
                <TextInput source="docId" label="Doc Id" fullWidth />
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
                        optionText="name"   // or "email"
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
