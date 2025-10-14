// src/pages/ReactAdmin/AdminPanel.tsx
import { Admin, Resource, Layout } from "react-admin";
import PeopleIcon from "@mui/icons-material/People";
import DomainIcon from "@mui/icons-material/Domain";
import FolderIcon from "@mui/icons-material/Folder";
import ArticleIcon from "@mui/icons-material/Article";
import InsightsIcon from "@mui/icons-material/Insights";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ChatIcon from "@mui/icons-material/Chat";

import { dataProvider } from "./providers/dataProvider";
import { ProjectList, ProjectCreate, ProjectEdit, ProjectShow } from "./projects";
import { OrganizationList, OrganizationCreate, OrganizationEdit, OrganizationShow } from "./organizations";
import { InsightList, InsightShow, InsightCreate, InsightEdit } from "./insights";
import { MemoList, MemoShow, MemoCreate, MemoEdit } from "./memos";
import { SlidedeckList, SlidedeckShow, SlidedeckCreate, SlidedeckEdit } from "./slidedecks";
import { UserList, UserShow, UserCreate, UserEdit } from "./users";
import { TaskList, TaskShow, TaskCreate, TaskEdit } from "./tasks";
import { SystemPromptList, SystemPromptShow, SystemPromptCreate } from "./systemPrompts";
import { OrganizationMembershipList, OrganizationMembershipCreate } from "./organizationMemberships";
import { useThemeMode } from "../../theme/useThemeMode";
import {ProjectAccessCreate, ProjectAccessList} from "./projectAccesses";

// remove the RA topbar, keep sidebar
const EmptyAppBar = () => null;
const CustomLayout = (props: any) => <Layout {...props} appBar={EmptyAppBar} />;

export default function AdminPanel() {
    const { theme } = useThemeMode();

    return (
        <Admin
            basename="/admin"
            dataProvider={dataProvider}
            layout={CustomLayout}
            theme={theme}
            lightTheme={theme}
            darkTheme={theme}
        >
            <Resource
                name="users"
                list={UserList}
                show={UserShow}
                create={UserCreate}
                edit={UserEdit}
                recordRepresentation="userName"
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
            <Resource
                name="tasks"
                list={TaskList}
                show={TaskShow}
                create={TaskCreate}
                edit={TaskEdit}
                icon={AssignmentTurnedInIcon}
            />
            <Resource
                name="systemPrompts"
                list={SystemPromptList}
                show={SystemPromptShow}
                create={SystemPromptCreate}
                icon={ChatIcon}
                options={{ label: "System Prompts"}}
            />
            <Resource
                name="organizationMemberships"
                list={OrganizationMembershipList}
                create={OrganizationMembershipCreate}
                options={{ label: "Organization Memberships"}}
            />
            <Resource
                name="projectAccesses"
                list={ProjectAccessList}
                create={ProjectAccessCreate}
                options={{ label: "Project Access"}}
            />
        </Admin>
    );
}
