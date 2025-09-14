import {
    Show,
    SimpleShowLayout,
    TextField,
    NumberField,
    SelectField,
    ReferenceField,
    TopToolbar,
    EditButton,
    DeleteButton,
    ListButton,
} from "react-admin";

const SOURCE_CHOICES = [
    { id: 0, name: "Llm" },
    { id: 1, name: "User" },
];

const ShowActions = () => (
    <TopToolbar>
        <ListButton />
        <EditButton />
        <DeleteButton />
    </TopToolbar>
);

export function InsightShow() {
    return (
        <Show title="Insight" actions={<ShowActions />}>
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
                <NumberField source="orderIndex" />
                <SelectField source="source" choices={SOURCE_CHOICES} />
                <TextField source="content" />
            </SimpleShowLayout>
        </Show>
    );
}
