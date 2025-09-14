import {
    Create,
    SimpleForm,
    TextInput,
    ReferenceInput,
    AutocompleteInput,
    required,
} from "react-admin";

export function SlidedeckCreate() {
    return (
        <Create title="Create Slidedeck">
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
        </Create>
    );
}
