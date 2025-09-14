import {
    Show,
    SimpleShowLayout,
    TextField,
    ReferenceField,
    BooleanField,
    DateField,
    TopToolbar,
    EditButton,
    DeleteButton,
    ListButton,
} from "react-admin";

const ShowActions = () => (
    <TopToolbar>
        <ListButton />
        <EditButton />
        <DeleteButton />
    </TopToolbar>
);

export function ProjectShow() {
    return (
        <Show title="Project" actions={<ShowActions />}>
            <SimpleShowLayout>
                <TextField source="id" />
                <TextField source="name" />
                <TextField source="kbid" label="KB Id" />
                <ReferenceField
                    label="Organization"
                    source="organizationId"
                    reference="organizations"
                    link="show"
                >
                    <TextField source="name" />
                </ReferenceField>
                <TextField source="projectContext" label="Context" />
                <BooleanField source="isActive" />
                <DateField source="updatedAt" />
                <DateField source="createdAt" />
                <DateField source="lastRefreshed" />
            </SimpleShowLayout>
        </Show>
    );
}
