// src/pages/ReactAdmin/tasks/TaskList.tsx
import {
    List,
    Datagrid,
    TextField,
    ReferenceField,
    NumberField,
    DateField,
    ReferenceInput,
    AutocompleteInput,
    SelectInput,
    DateInput,
} from "react-admin";
import { taskJobTypeChoices, taskStatusChoices } from "./_choices";

const filters = [
    // Filter by project
    <ReferenceInput
        key="project"
        source="projectId"
        reference="projects"
        label="Project"
        perPage={25}
        sort={{ field: "name", order: "ASC" }}
    >
        <AutocompleteInput
            optionText="name"
            optionValue="id"
            filterToQuery={(q) => ({ search: q })}
            fullWidth
        />
    </ReferenceInput>,

    // Filter by creator
    <ReferenceInput
        key="creator"
        source="createdByUserId"
        reference="users"
        label="Creator"
        perPage={25}
        sort={{ field: "name", order: "ASC" }}
    >
        <AutocompleteInput
            optionText="name"
            optionValue="id"
            filterToQuery={(q) => ({ search: q })}
            fullWidth
        />
    </ReferenceInput>,

    // Job type + status
    <SelectInput
        key="type"
        source="type"
        label="Job Type"
        choices={taskJobTypeChoices}
        optionText="name"
        optionValue="id"
    />,
    <SelectInput
        key="status"
        source="status"
        label="Status"
        choices={taskStatusChoices}
        optionText="name"
        optionValue="id"
    />,

    // Created date range
    <DateInput key="createdAfter" source="createdAfter" label="Created After" />,
    <DateInput key="createdBefore" source="createdBefore" label="Created Before" />,
];

export function TaskList() {
    return (
        <List
            title="Tasks"
            filters={filters}
            sort={{ field: "updatedAt", order: "DESC" }}
            perPage={25}
        >
            <Datagrid rowClick="show">
                <TextField source="id" />
                <ReferenceField label="Project" source="projectId" reference="projects" link="show">
                    <TextField source="name" />
                </ReferenceField>
                <ReferenceField label="Creator" source="createdByUserId" reference="users" link="show">
                    <TextField source="name" />
                </ReferenceField>
                <TextField source="jobType" label="Job Type" />
                <TextField source="status" />
                <NumberField source="progress" label="Progress" />
                <DateField source="updatedAt" />
                <DateField source="createdAt" />
                <DateField source="startedAt" />
                <DateField source="completedAt" />
            </Datagrid>
        </List>
    );
}
