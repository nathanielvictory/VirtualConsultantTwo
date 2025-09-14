// src/pages/ReactAdmin/organizations/OrganizationEdit.tsx
import {
    Edit,
    SimpleForm,
    TextInput,
    required,
    Toolbar,
    SaveButton,
    DeleteButton,
} from "react-admin";
import { Stack } from "@mui/material";

const EditToolbar = (props: any) => (
    <Toolbar {...props}>
        <Stack direction="row" spacing={2} sx={{ width: "100%", justifyContent: "flex-end" }}>
            <DeleteButton />
            <SaveButton />
        </Stack>
    </Toolbar>
);

export function OrganizationEdit() {
    return (
        <Edit title="Edit Organization">
            <SimpleForm toolbar={<EditToolbar />}>
                <TextInput source="id" label="ID" disabled fullWidth />
                <TextInput source="name" label="Name" validate={[required()]} fullWidth />
            </SimpleForm>
        </Edit>
    );
}
