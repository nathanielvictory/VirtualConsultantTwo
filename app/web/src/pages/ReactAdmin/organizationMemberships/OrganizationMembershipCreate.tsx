import {
    Create,
    SimpleForm,
    ReferenceInput,
    AutocompleteInput,
    required,
} from "react-admin";

export function OrganizationMembershipCreate() {
    return (
        <Create title="Add Organization Membership">
            <SimpleForm>
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

                {/* organizationId as a reference to organizations */}
                <ReferenceInput
                    source="organizationId"
                    reference="organizations"
                    label="Organization"
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
