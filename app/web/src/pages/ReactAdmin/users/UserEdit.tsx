// UserEdit.tsx
import {
    Edit,
    SimpleForm,
    TextInput,
    ReferenceInput,
    AutocompleteInput,
    SelectArrayInput,
    Toolbar,
    SaveButton,
    DeleteButton,
    required,
    useRecordContext,
} from "react-admin";
import { Stack } from "@mui/material";

/** Helper to extract org id from claims array on GET-records */
const getOrgIdFromClaims = (record: any) =>
    record?.claims?.find?.((c: any) => c?.type === "org")?.value ?? undefined;

const EditToolbar = (props: any) => (
    <Toolbar {...props}>
        <Stack direction="row" spacing={2} sx={{ width: "100%", justifyContent: "flex-end" }}>
            <DeleteButton />
            <SaveButton />
        </Stack>
    </Toolbar>
);

const PrefilledOrgReferenceInput = () => {
    const record = useRecordContext();
    const orgId = getOrgIdFromClaims(record);

    return (
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
                fullWidth
                validate={[required()]}
                defaultValue={orgId}
            />
        </ReferenceInput>
    );
};

export function UserEdit() {
    return (
        <Edit title="Edit User">
            <SimpleForm toolbar={<EditToolbar />}>
                <TextInput source="id" disabled />

                {/* Keep userName as the editable username */}
                <TextInput
                    source="userName"
                    label="Username"
                    validate={[required()]}
                    fullWidth
                />

                {/* Organization: pre-populated from the org claim; submits organizationId */}
                <PrefilledOrgReferenceInput />

                {/* Roles: multiselect, currently only "Admin" */}
                <SelectArrayInput
                    source="roles"
                    label="Roles"
                    choices={[{ id: "Admin", name: "Admin" }]}
                    fullWidth
                />

                {/* Optional on edit: leave blank to keep existing password */}
                <TextInput
                    source="password"
                    label="Password"
                    type="password"
                    helperText="Leave blank to keep the current password"
                    fullWidth
                />
            </SimpleForm>
        </Edit>
    );
}
