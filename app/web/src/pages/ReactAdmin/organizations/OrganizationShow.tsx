// src/pages/ReactAdmin/organizations/OrganizationShow.tsx
import {
  Show,
  SimpleShowLayout,
  TextField,
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

export function OrganizationShow() {
  return (
    <Show title="Organization" actions={<ShowActions />}>
      <SimpleShowLayout>
        <TextField source="id" label="ID" />
        <TextField source="name" label="Name" />
      </SimpleShowLayout>
    </Show>
  );
}
