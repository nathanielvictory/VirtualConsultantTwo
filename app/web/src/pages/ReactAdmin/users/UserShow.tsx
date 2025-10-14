// UserShow.tsx
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
    useRecordContext,
} from "react-admin";

/** Helper to extract org id from claims for show view */
const getOrgIdFromClaims = (record: any) =>
    record?.claims?.find?.((c: any) => c?.type === "org")?.value ?? undefined;

const OrgName = () => {
    const record = useRecordContext();
    const organizationId = getOrgIdFromClaims(record);
    if (!organizationId) return null;

    return (
        <ReferenceField
            label="Organization"
            source="organizationId"
            reference="organizations"
            record={{ ...record, organizationId }}
            link="show"
        >
            <TextField source="name" />
        </ReferenceField>
    );
};

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
                {/* Explicitly show username; recordRepresentation handles other contexts */}
                <TextField source="userName" label="Username" />
                <OrgName />
                <FunctionField
                    label="Roles"
                    render={(r: any) => (Array.isArray(r?.roles) ? r.roles.join(", ") : "")}
                />
            </SimpleShowLayout>
        </Show>
    );
}
