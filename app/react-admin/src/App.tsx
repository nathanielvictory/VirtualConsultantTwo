import { Admin, Resource, EditGuesser, ShowGuesser, ListGuesser } from "react-admin";
import { authProvider } from "./authProvider";
import { dataProvider } from "./dataProvider";
import ProjectsList from "./resources/projectsList.tsx";
import ProjectsCreate from "./resources/projectsCreate.tsx";
import InsightCreate from "./resources/insightCreate.tsx";

export default function App() {
    return (
        <Admin authProvider={authProvider} dataProvider={dataProvider}>
            <Resource name="projects"    list={ProjectsList} edit={EditGuesser} show={ShowGuesser} create={ProjectsCreate} />
            <Resource name="memos"       list={ListGuesser} edit={EditGuesser} show={ShowGuesser} />
            <Resource name="users"       list={ListGuesser} edit={EditGuesser} show={ShowGuesser} />
            <Resource name="slidedecks"  list={ListGuesser} edit={EditGuesser} show={ShowGuesser} />
            <Resource name="insights"    list={ListGuesser} edit={EditGuesser} show={ShowGuesser} create={InsightCreate} />
        </Admin>
    );
}
