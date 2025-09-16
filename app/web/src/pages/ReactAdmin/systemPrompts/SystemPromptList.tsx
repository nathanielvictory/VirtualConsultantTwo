// src/pages/ReactAdmin/systemPrompts/SystemPromptList.tsx
import {
    List,
    Datagrid,
    TextField,
    DateField,
    TextInput,
    BooleanInput,
} from "react-admin";

// Filters map 1:1 to your slice (type, latestOnly)
const filters = [
    <TextInput key="type" source="type" label="Type" alwaysOn />,
    <BooleanInput key="latestOnly" source="latestOnly" label="Latest only" />,
];

export function SystemPromptList() {
    return (
        <List
            title="System Prompts"
            filters={filters}
            perPage={25}
            // Your endpoint does not accept a sort param; if your dataProvider adds one,
            // ensure it is ignored or handled server-side.
        >
            <Datagrid rowClick="show">
                <TextField source="id" />
                <TextField source="promptType" label="Type" />
                <TextField source="prompt" label="Prompt" />
                <DateField source="createdAt" />
            </Datagrid>
        </List>
    );
}
