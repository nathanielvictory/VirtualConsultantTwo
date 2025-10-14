import {
    Show,
    SimpleShowLayout,
    TextField,
    NumberField,
    DateField,
    ReferenceField,
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

export function SlidedeckShow() {
    return (
        <Show title="Slidedeck" actions={<ShowActions />}>
            <SimpleShowLayout>
                <NumberField source="id" />
                <ReferenceField
                    label="Project"
                    source="projectId"
                    reference="projects"
                    link="show"
                >
                    <TextField source="name" />
                </ReferenceField>
                <TextField source="name" label="Title" />
                <TextField source="presentationId" label="Presentation Id" />
                <TextField source="sheetsId" label="Sheets Id" />
                <TextField source="promptFocus" label="Prompt Focus" />
                <ReferenceField
                    label="Created By"
                    source="createdById"
                    reference="users"
                    link="show"
                />
                <DateField source="updatedAt" />
                <DateField source="createdAt" />
            </SimpleShowLayout>
        </Show>
    );
}
