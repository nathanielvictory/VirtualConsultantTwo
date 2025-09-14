import {
    Create,
    SimpleForm,
    TextInput,
    NumberInput,
    ReferenceInput,
    AutocompleteInput,
    SelectInput,
    required,
} from "react-admin";

const SOURCE_CHOICES = [
    { id: 0, name: "Llm" },
    { id: 1, name: "User" },
];

export function InsightCreate() {
    return (
        <Create title="Create Insight">
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
                        validate={[required()]}      // validator lives on the Autocomplete
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

                {/* Optional in Create DTO (value types default to 0) */}
                <SelectInput
                    source="source"
                    label="Source"
                    choices={SOURCE_CHOICES}
                />

                <NumberInput source="orderIndex" label="Order" />
            </SimpleForm>
        </Create>
    );
}
