import {
    Edit,
    SimpleForm,
    TextInput,
    NumberInput,
    ReferenceInput,
    AutocompleteInput,
    SelectInput,
    Toolbar,
    SaveButton,
    DeleteButton,
    required,
} from "react-admin";
import { Stack } from "@mui/material";

const SOURCE_CHOICES = [
    { id: 0, name: "Llm" },
    { id: 1, name: "User" },
];

const EditToolbar = (props: any) => (
    <Toolbar {...props}>
        <Stack direction="row" spacing={2} sx={{ width: "100%", justifyContent: "flex-end" }}>
            <DeleteButton />
            <SaveButton />
        </Stack>
    </Toolbar>
);

export function InsightEdit() {
    return (
        <Edit title="Edit Insight">
            <SimpleForm toolbar={<EditToolbar />}>
                <NumberInput source="id" disabled />

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
                    source="content"
                    label="Content"
                    validate={[required()]}
                    multiline
                    minRows={3}
                    fullWidth
                />

                <SelectInput
                    source="source"
                    label="Source"
                    choices={SOURCE_CHOICES}
                />

                <NumberInput source="orderIndex" label="Order" />
            </SimpleForm>
        </Edit>
    );
}
