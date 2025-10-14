// src/pages/ReactAdmin/projectAccesses/ProjectAccessList.tsx
import {
    List,
    Datagrid,
    ReferenceField,
    TextField,
    BooleanField,
    DateField,
    TextInput,
} from "react-admin";

// Add the same simple `search` filter used elsewhere
const filters = [
    <TextInput key="search" source="search" label="Search" alwaysOn />,
];

export function ProjectAccessList() {
    return (
        <List
            resource="projectAccesses"
            title="Project Access"
            perPage={25}
            filters={filters}
        >
            <Datagrid rowClick={false} bulkActionButtons={false}>
                <ReferenceField label="User" source="userId" reference="users" link="show">
                    <TextField source="userName" />
                </ReferenceField>

                <ReferenceField label="Project" source="projectId" reference="projects" link="show">
                    <TextField source="name" />
                </ReferenceField>

                <BooleanField source="allowAccess" label="Allowed" />
                <TextField source="reason" />
                <DateField source="createdAt" />
            </Datagrid>
        </List>
    );
}
