// src/pages/ReactAdmin/systemPrompts/SystemPromptCreate.tsx
import {
    Create,
    SimpleForm,
    TextInput,
    required,
} from "react-admin";

export function SystemPromptCreate() {
    return (
        <Create title="Create System Prompt">
            <SimpleForm>
                <TextInput
                    source="promptType"
                    label="Prompt Type"
                    validate={[required()]}
                    fullWidth
                />
                <TextInput
                    source="prompt"
                    label="Prompt"
                    multiline
                    minRows={6}
                    validate={[required()]}
                    fullWidth
                />
            </SimpleForm>
        </Create>
    );
}
