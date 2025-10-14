// UserList.tsx
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
    useRecordContext,
} from "react-admin";
import { Box } from "@mui/material";

/** Helper to extract org id from claims when listing */
const getOrgIdFromClaims = (record: any) =>
    record?.claims?.find?.((c: any) => c?.type === "org")?.value ?? undefined;

/** Renders the Organization name by temporarily injecting organizationId for ReferenceField */
const OrgName = () => {
    const record = useRecordContext();
    const organizationId = getOrgIdFromClaims(record);
    if (!organizationId) return null;

    return (
        <ReferenceField
            label="Organization"
            source="organizationId"
            reference="organizations"
            // Provide a record that includes the derived organizationId
            record={{ ...record, organizationId }}
            link="show"
        >
            <TextField source="name" />
        </ReferenceField>
    );
};

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
            optionValue="id" // string id
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
                {/* userName is your record representation, but we still show it explicitly in a column */}
                <TextField source="userName" label="Username" />
                <OrgName />
                <FunctionField
                    label="Roles"
                    render={(r: any) => (Array.isArray(r?.roles) ? r.roles.join(", ") : "")}
                />
            </Datagrid>
        </List>
    );
}
