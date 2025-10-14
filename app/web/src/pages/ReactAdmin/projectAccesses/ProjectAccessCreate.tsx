import {
    Create,
    SimpleForm,
    ReferenceInput,
    AutocompleteInput,
    BooleanInput,
    TextInput,
    required,
} from "react-admin";

export function ProjectAccessCreate() {
    return (
        <Create title="Add Project Access">
            <SimpleForm defaultValues={{ allowAccess: true }}>
                {/* userId as a reference to users */}
                <ReferenceInput
                    source="userId"
                    reference="users"
                    label="User"
                    perPage={25}
                    sort={{ field: "name", order: "ASC" }}
                >
                    <AutocompleteInput
                        optionText="userName"
                        optionValue="id"
                        filterToQuery={(q) => ({ search: q })}
                        validate={[required()]}
                        fullWidth
                    />
                </ReferenceInput>

                {/* projectId as a reference to projects */}
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

                <BooleanInput source="allowAccess" label="Allowed" />
                <TextInput source="reason" label="Reason" fullWidth />
            </SimpleForm>
        </Create>
    );
}
