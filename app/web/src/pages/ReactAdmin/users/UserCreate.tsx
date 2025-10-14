// UserCreate.tsx
import {
    Create,
    SimpleForm,
    TextInput,
    ReferenceInput,
    AutocompleteInput,
    SelectArrayInput,
    required,
} from "react-admin";

export function UserCreate() {
    return (
        <Create title="Create User">
            <SimpleForm>
                {/* userName is required for create/update */}
                <TextInput
                    source="userName"
                    label="Username"
                    validate={[required()]}
                    fullWidth
                />

                {/* Directly posts organizationId (API accepts this on create) */}
                <ReferenceInput
                    source="organizationId"
                    reference="organizations"
                    label="Organization"
                    perPage={25}
                    sort={{ field: "name", order: "ASC" }}
                >
                    <AutocompleteInput
                        optionText="name"
                        optionValue="id" // string id
                        filterToQuery={(q) => ({ search: q })}
                        fullWidth
                        validate={[required()]}
                    />
                </ReferenceInput>

                {/* Roles: multiselect, currently only "Admin" */}
                <SelectArrayInput
                    source="roles"
                    label="Roles"
                    choices={[{ id: "Admin", name: "Admin" }]}
                    fullWidth
                />

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
