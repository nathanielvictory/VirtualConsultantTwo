import { TextInput, BooleanInput, ListGuesser  } from "react-admin";

// Minimal filters shown on top of the list
const filters = [
    <TextInput key="search" source="search" label="Search" alwaysOn />,
    <BooleanInput key="isActive" source="isActive" label="Active" />,
    // example org selector if you know org ids; otherwise remove for now
    // <SelectInput key="orgId" source="orgId" label="Org" choices={[{ id: "org-1", name: "Org 1" }]} />
];

export default function ProjectsList() {
    return (
            <ListGuesser filters={filters} sort={{ field: "id", order: "ASC" }}/>
    );
}
