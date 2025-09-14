import {
    Show,
    SimpleShowLayout,
    NumberField,
    TextField,
    ReferenceField,
    FunctionField,
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

export function UserShow() {
    return (
        <Show title="User" actions={<ShowActions />}>
            <SimpleShowLayout>
                <NumberField source="id" />
                <TextField source="username" label="Username" />
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
            </SimpleShowLayout>
        </Show>
    );
}
