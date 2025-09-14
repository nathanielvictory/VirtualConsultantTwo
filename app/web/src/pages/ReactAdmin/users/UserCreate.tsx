import {
    Create,
    SimpleForm,
    TextInput,
    ReferenceInput,
    AutocompleteInput,
    required,
} from "react-admin";

export function UserCreate() {
    return (
        <Create title="Create User">
            <SimpleForm>
                <TextInput
                    source="username"
                    label="Username"
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
                        optionValue="id"                 // string id
                        filterToQuery={(q) => ({ search: q })}
                        validate={[required()]}
                        fullWidth
                    />
                </ReferenceInput>

                <TextInput
                    source="password"
                    label="Password"
                    type="password"
                    validate={[required()]}
                    fullWidth
                />
            </SimpleForm>
        </Create>
    );
}
