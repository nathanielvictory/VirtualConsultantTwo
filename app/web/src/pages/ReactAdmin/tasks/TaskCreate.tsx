// src/pages/ReactAdmin/tasks/TaskCreate.tsx
import {
    Create,
    SimpleForm,
    ReferenceInput,
    AutocompleteInput,
    SelectInput,
    TextInput,
    required,
} from "react-admin";
import { taskJobTypeChoices } from "./_choices";

export function TaskCreate() {
    return (
        <Create title="Create Task">
            <SimpleForm>
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
                        optionValue="id"      // numeric id
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
            </SimpleForm>
        </Create>
    );
}
