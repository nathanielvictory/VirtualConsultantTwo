// src/pages/ReactAdmin/organizations/OrganizationCreate.tsx
import { Create, SimpleForm, TextInput, required } from "react-admin";

export function OrganizationCreate() {
    return (
        <Create title="Create Organization">
            <SimpleForm>
                <TextInput source="id" label="ID" validate={[required()]} fullWidth />
                <TextInput source="name" label="Name" validate={[required()]} fullWidth />
            </SimpleForm>
        </Create>
    );
}
