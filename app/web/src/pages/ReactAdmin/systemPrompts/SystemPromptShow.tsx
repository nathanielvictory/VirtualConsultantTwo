// src/pages/ReactAdmin/systemPrompts/SystemPromptShow.tsx
import {
    Show,
    SimpleShowLayout,
    TextField,
    DateField,
    TopToolbar,
    ListButton,
} from "react-admin";

const ShowActions = () => (
    <TopToolbar>
        <ListButton />
        {/* No Edit/Delete — API is read/create only */}
    </TopToolbar>
);

export function SystemPromptShow() {
    return (
        <Show title="System Prompt" actions={<ShowActions />}>
            <SimpleShowLayout>
                <TextField source="id" />
                <TextField source="promptType" label="Type" />
                <TextField source="prompt" label="Prompt" />
                <DateField source="createdAt" />
            </SimpleShowLayout>
        </Show>
    );
}
