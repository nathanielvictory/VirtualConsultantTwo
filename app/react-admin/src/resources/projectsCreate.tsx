import { Create, SimpleForm, TextInput, BooleanInput } from "react-admin";

export default function ProjectsCreate() {
    return (
        <Create>
            <SimpleForm>
                <TextInput source="name" />
                <TextInput source="kbid" />
                <TextInput source="organizationId" />
                <TextInput source="projectContext" multiline />
                <BooleanInput source="isActive" />
            </SimpleForm>
        </Create>
    );
}
