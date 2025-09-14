import {
    Create,
    SimpleForm,
    TextInput,
    ReferenceInput,
    AutocompleteInput,
    required,
} from "react-admin";

export function MemoCreate() {
    return (
        <Create title="Create Memo">
            <SimpleForm>
                {/* Required in DTO */}
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

                {/* Required in DTO */}
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
        </Create>
    );
}
