// src/pages/ReactAdmin/AdminPanel.tsx
import { Admin, Resource } from "react-admin";
import PeopleIcon from "@mui/icons-material/People";
import DomainIcon from "@mui/icons-material/Domain";
import FolderIcon from "@mui/icons-material/Folder";
import ArticleIcon from "@mui/icons-material/Article";
import InsightsIcon from "@mui/icons-material/Insights";
import {dataProvider} from "./providers/dataProvider.ts";
import {ProjectList, ProjectCreate, ProjectEdit, ProjectShow} from "./projects";
import { OrganizationList, OrganizationCreate, OrganizationEdit, OrganizationShow } from "./organizations";
import { InsightList, InsightShow, InsightCreate, InsightEdit } from "./insights";
import { MemoList, MemoShow, MemoCreate, MemoEdit } from "./memos";
import { SlidedeckList, SlidedeckShow, SlidedeckCreate, SlidedeckEdit } from "./slidedecks";
import { UserList, UserShow, UserCreate, UserEdit } from "./users";

export default function AdminPanel() {
    return (
        <Admin basename="/admin" dataProvider={dataProvider}>
            <Resource
                name="users"
                list={UserList}
                show={UserShow}
                create={UserCreate}
                edit={UserEdit}
                icon={PeopleIcon}
            />
            <Resource
                name="organizations"
                list={OrganizationList}
                create={OrganizationCreate}
                edit={OrganizationEdit}
                show={OrganizationShow}
                icon={DomainIcon}
            />
            <Resource
                name="projects"
                list={ProjectList}
                show={ProjectShow}
                create={ProjectCreate}
                edit={ProjectEdit}
                icon={FolderIcon}
            />
            <Resource
                name="memos"
                list={MemoList}
                show={MemoShow}
                create={MemoCreate}
                edit={MemoEdit}
                icon={ArticleIcon}
            />

            <Resource
                name="slidedecks"
                list={SlidedeckList}
                show={SlidedeckShow}
                create={SlidedeckCreate}
                edit={SlidedeckEdit}
                icon={ArticleIcon}
            />
            <Resource
                name="insights"
                list={InsightList}
                show={InsightShow}
                create={InsightCreate}
                edit={InsightEdit}
                icon={InsightsIcon}
            />
        </Admin>
    );
}