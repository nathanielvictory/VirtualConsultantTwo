// src/pages/ReactAdmin/tasks/TaskEdit.tsx
import {
    Edit,
    SimpleForm,
    TextInput,
    ReferenceInput,
    AutocompleteInput,
    SelectInput,
    NumberInput,
    DateTimeInput,
    Toolbar,
    SaveButton,
    DeleteButton,
    required,
} from "react-admin";
import { Stack } from "@mui/material";
import { taskJobTypeChoices, taskStatusChoices } from "./_choices";

const EditToolbar = (props: any) => (
    <Toolbar {...props}>
        <Stack direction="row" spacing={2} sx={{ width: "100%", justifyContent: "flex-end" }}>
            <DeleteButton />
            <SaveButton />
        </Stack>
    </Toolbar>
);

export function TaskEdit() {
    return (
        <Edit title="Edit Task">
            <SimpleForm toolbar={<EditToolbar />}>
                <TextInput source="id" disabled />

                {/* Editable core fields */}
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

                <SelectInput
                    source="jobType"
                    label="Job Type"
                    choices={taskJobTypeChoices}
                    optionText="name"
                    optionValue="id"
                    validate={[required()]}
                    fullWidth
                />

                <SelectInput
                    source="status"
                    label="Status"
                    choices={taskStatusChoices}
                    optionText="name"
                    optionValue="id"
                    fullWidth
                />

                <NumberInput source="progress" label="Progress (%)" min={0} max={100} />

                <ReferenceInput
                    source="createdByUserId"
                    reference="users"
                    label="Created By"
                    perPage={25}
                    sort={{ field: "name", order: "ASC" }}
                >
                    <AutocompleteInput
                        optionText="name"
                        optionValue="id"
                        filterToQuery={(q) => ({ search: q })}
                        fullWidth
                    />
                </ReferenceInput>

                <TextInput
                    source="payloadJson"
                    label="Payload (JSON)"
                    multiline
                    minRows={3}
                    fullWidth
                />
                <TextInput
                    source="errorMessage"
                    label="Error Message"
                    multiline
                    minRows={2}
                    fullWidth
                />

                {/* Timestamps */}
                <DateTimeInput source="startedAt" label="Started At" />
                <DateTimeInput source="completedAt" label="Completed At" />

                {/* Readonly audit fields */}
                <DateTimeInput source="createdAt" label="Created At" disabled />
                <DateTimeInput source="updatedAt" label="Updated At" disabled />
            </SimpleForm>
        </Edit>
    );
}
