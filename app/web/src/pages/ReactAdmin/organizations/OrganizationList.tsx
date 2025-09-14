// src/pages/ReactAdmin/organizations/OrganizationList.tsx
import {
    List,
    Datagrid,
    TextField,
    TextInput,
    TopToolbar,
    CreateButton,
} from "react-admin";
import { Box } from "@mui/material";

const filters = [
    <TextInput key="search" source="search" label="Search" alwaysOn />,
];

const ListActions = () => (
    <TopToolbar>
        <Box sx={{ flex: 1 }} />
        <CreateButton />
    </TopToolbar>
);

export function OrganizationList() {
    return (
        <List
            title="Organizations"
            filters={filters}
            actions={<ListActions />}
            sort={{ field: "name", order: "ASC" }}
            perPage={25}
        >
            <Datagrid rowClick="show">
                <TextField source="id" label="ID" />
                <TextField source="name" label="Name" />
            </Datagrid>
        </List>
    );
}
