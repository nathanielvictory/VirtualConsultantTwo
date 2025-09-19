import {
    List,
    Datagrid,
    NumberField,
    TextField,
    ReferenceInput,
    ReferenceField,
    AutocompleteInput,
    TextInput,
    TopToolbar,
    CreateButton,
    FunctionField,
} from "react-admin";
import { Box } from "@mui/material";

const filters = [
    <TextInput key="search" source="search" label="Search" alwaysOn />,
    <ReferenceInput
        key="org"
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
            fullWidth
        />
    </ReferenceInput>,
];

const ListActions = () => (
    <TopToolbar>
        <Box sx={{ flex: 1 }} />
        <CreateButton />
    </TopToolbar>
);

export function UserList() {
    return (
        <List title="Users" filters={filters} actions={<ListActions />} perPage={25}>
            <Datagrid rowClick="show">
                <NumberField source="id" />
                <TextField source="userName" label="Username" />
                <ReferenceField
                    label="Organization"
                    source="organizationId"
                    reference="organizations"
                    link="show"
                >
                    <TextField source="name" />
                </ReferenceField>
                <FunctionField
                    label="Roles"
                    render={(r: any) => (Array.isArray(r?.roles) ? r.roles.join(", ") : "")}
                />
            </Datagrid>
        </List>
    );
}
