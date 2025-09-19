import {
    Edit,
    SimpleForm,
    TextInput,
    ReferenceInput,
    AutocompleteInput,
    Toolbar,
    SaveButton,
    DeleteButton,
    required,
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

export function UserEdit() {
    return (
        <Edit title="Edit User">
            <SimpleForm toolbar={<EditToolbar />}>
                <TextInput source="id" disabled />

                <TextInput
                    source="userName"
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
                        optionValue="id"
                        filterToQuery={(q) => ({ search: q })}
                        validate={[required()]}
                        fullWidth
                    />
                </ReferenceInput>

                {/* Optional on edit: leave blank to keep existing password */}
                <TextInput
                    source="password"
                    label="Password"
                    type="password"
                    helperText="Leave blank to keep the current password"
                    fullWidth
                />
            </SimpleForm>c
        </Edit>
    );
}
