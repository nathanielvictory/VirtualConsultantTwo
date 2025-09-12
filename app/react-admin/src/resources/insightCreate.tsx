import {
    Create,
    SimpleForm,
    ReferenceInput,
    AutocompleteInput,
    SelectInput,
    NumberInput,
    TextInput,
    required,
} from "react-admin";


// UI-only mapping for the numeric InsightSource type (0 | 1)
const insightSourceChoices = [
    { id: 0, name: "LLM" },
    { id: 1, name: "User" },
];


export default function InsightCreate() {
    return (
        <Create>
            <SimpleForm>
                <ReferenceInput source="projectId" reference="projects" filter={{isActive: true}}>
                    <AutocompleteInput label="Project" optionText="name" validate={required()} />
                </ReferenceInput>


                <SelectInput
                    source="source"
                    label="Source"
                    choices={insightSourceChoices}
                    optionText="name"
                    optionValue="id"
                    parse={(v) => (v === "" || v === null || v === undefined ? undefined : Number(v))}
                    format={(v) => (v === undefined || v === null ? undefined : Number(v))}
                    validate={required()}
                />


                <TextInput source="content" label="Content" multiline fullWidth />


                <NumberInput source="orderIndex" label="Order Index" />
            </SimpleForm>
        </Create>
    );
}