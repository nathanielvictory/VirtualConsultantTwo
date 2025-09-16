// src/pages/ReactAdmin/tasks/TaskShow.tsx
import {
    Show,
    SimpleShowLayout,
    TextField,
    ReferenceField,
    NumberField,
    DateField,
    TopToolbar,
    EditButton,
    DeleteButton,
    ListButton,
    ArrayField,
    Datagrid,
} from "react-admin";

const ShowActions = () => (
    <TopToolbar>
        <ListButton />
        <EditButton />
        <DeleteButton />
    </TopToolbar>
);

export function TaskShow() {
    return (
        <Show title="Task" actions={<ShowActions />}>
            <SimpleShowLayout>
                <TextField source="id" />
                <ReferenceField label="Project" source="projectId" reference="projects" link="show">
                    <TextField source="name" />
                </ReferenceField>
                <ReferenceField label="Creator" source="createdByUserId" reference="users" link="show">
                    <TextField source="name" />
                </ReferenceField>

                <TextField source="jobType" label="Job Type" />
                <TextField source="status" />
                <NumberField source="progress" />

                <TextField source="payloadJson" label="Payload (JSON)" />
                <TextField source="errorMessage" label="Error Message" />

                <DateField source="createdAt" />
                <DateField source="updatedAt" />
                <DateField source="startedAt" />
                <DateField source="completedAt" />

                {/* Artifacts (if any) */}
                <ArrayField source="artifacts" label="Artifacts">
                    <Datagrid bulkActionButtons={false}>
                        <TextField source="id" />
                        <TextField source="resourceType" />
                        <TextField source="resourceId" />
                        <TextField source="action" />
                        <TextField source="model" />
                        <NumberField source="promptTokens" />
                        <NumberField source="completionTokens" />
                        <NumberField source="totalTokens" />
                        <DateField source="createdAt" />
                    </Datagrid>
                </ArrayField>
            </SimpleShowLayout>
        </Show>
    );
}
