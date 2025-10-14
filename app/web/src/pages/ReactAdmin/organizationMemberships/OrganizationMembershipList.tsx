import {
    List,
    Datagrid,
    TextField,
    DateField,
    TextInput,
    ReferenceField,
} from "react-admin";

// Only what's supported/used elsewhere: a simple "search" filter
const filters = [
    <TextInput key="search" source="search" label="Search" alwaysOn />,
];

export function OrganizationMembershipList() {
    return (
        <List
            resource="organizationMemberships"
            title="Organization Memberships"
            filters={filters}
            sort={{ field: "createdAt", order: "DESC" }}
            perPage={25}
        >
            <Datagrid rowClick={false}>
                {/* User as a reference (numeric id) */}
                <ReferenceField
                    label="User"
                    source="userId"
                    reference="users"
                    link="show"
                >
                    <TextField source="userName" />
                </ReferenceField>

                {/* Organization as a reference (string id) */}
                <ReferenceField
                    label="Organization"
                    source="organizationId"
                    reference="organizations"
                    link="show"
                >
                    <TextField source="name" />
                </ReferenceField>

                <DateField source="createdAt" />
            </Datagrid>
        </List>
    );
}
