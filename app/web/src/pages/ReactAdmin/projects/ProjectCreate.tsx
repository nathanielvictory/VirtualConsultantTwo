import {
    Create,
    SimpleForm,
    TextInput,
    BooleanInput,
    ReferenceInput,
    AutocompleteInput,
    required,
} from "react-admin";

export function ProjectCreate() {
    return (
        <Create title="Create Project">
            <SimpleForm defaultValues={{ isActive: true }}>
                <TextInput
                    source="name"
                    label="Name"
                    validate={[required()]}
                    fullWidth
                />
                <TextInput
                    source="kbid"
                    label="KB Id"
                    validate={[required()]}
                    fullWidth
                />

                <ReferenceInput
                    source="organizationId"
                    reference="organizations"
                    label="Organization"
                    perPage={25}
                    sort={{ field: "name", order: "ASC" }}
                >
                    <AutocompleteInput
                        optionText="name"
                        optionValue="id"                 // string ID
                        filterToQuery={(q) => ({ search: q })}
                        validate={[required()]}          // validator belongs on the Autocomplete
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
        </Create>
    );
}
