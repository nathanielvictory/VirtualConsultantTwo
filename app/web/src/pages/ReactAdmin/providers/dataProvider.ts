// src/pages/ReactAdmin/dataProvider.ts
import type { DataProvider, GetListParams } from "react-admin";
import { HttpError } from "react-admin";
import { store } from "../../../store";

// Generated API slices (from your codegen)
import { projectsApi } from "../../../api/projectsApi";
import { memosApi } from "../../../api/memosApi";
import { usersApi } from "../../../api/usersApi";
import { slidedecksApi } from "../../../api/slidedecksApi";
import { insightsApi } from "../../../api/insightsApi";
import { organizationsApi } from "../../../api/organizationsApi";
import { tasksApi } from "../../../api/tasksApi";
import { systemPromptsApi } from "../../../api/systemPromptsApi";

/** Prefer numeric ids when possible (except resources that are string-ids) */
const toId = (id: any) =>
    typeof id === "string" && /^\d+$/.test(id) ? Number(id) : id;

const asStringId = (id: any) => String(id);

const idOf = (r: any) => r?.id ?? r?.uuid ?? r?._id;

const packMembershipId = (userId: number | string, organizationId: string) =>
    `${Number(userId)}|${String(organizationId)}`;

const unpackMembershipId = (id: any) => {
    const [userIdStr, organizationId] = String(id).split("|");
    return { userId: Number(userIdStr), organizationId };
};

const membershipIdOf = (r: any) => packMembershipId(r?.userId, r?.organizationId);

const packProjectAccessId = (userId: number | string, projectId: number | string) =>
    `${Number(userId)}|${Number(projectId)}`;

const unpackProjectAccessId = (id: any) => {
    const [userIdStr, projectIdStr] = String(id).split("|");
    return { userId: Number(userIdStr), projectId: Number(projectIdStr) };
};

const projectAccessIdOf = (r: any) => packProjectAccessId(r?.userId, r?.projectId);

function toHttpError(err: any, fallbackMessage?: string) {
    // RTKQ errors look like: { status: 409, data: {...} }
    const status = err?.status ?? 500;
    const body = err?.data ?? err?.body ?? err;

    // ASP.NET ProblemDetails: title/detail/status/type plus optional validation `errors`
    const title  = body?.title  || body?.error || fallbackMessage || "Server Error";
    const detail = body?.detail || body?.message;
    const message = [title, detail].filter(Boolean).join(" — ");

    return new HttpError(message, status, body);
}

// Small wrapper to dispatch & unwrap thunks and convert errors to HttpError
async function run<T>(thunk: any, context?: string): Promise<T> {
    try {
        return await store.dispatch(thunk).unwrap();
    } catch (e) {
        throw toHttpError(e, context);
    }
}

/** Shared mapper for list params -> typical API query */
const makeListMapper =
    (extra?: (f: Record<string, any>) => Record<string, any>) =>
        (params: GetListParams) => {
            const { page = 1, perPage = 25 } = params.pagination ?? { page: 1, perPage: 25 };
            const { field, order } = params.sort ?? { field: "id", order: "ASC" };
            const f = params.filter ?? {};
            const base = {
                search: f.search ?? f.q,
                page,
                pageSize: perPage,
                sort: `${field}:${String(order).toLowerCase()}`,
            };
            return { ...base, ...(extra ? extra(f) : {}) };
        };

/** Describe each resource once; calls the right generated endpoints. */
type Bundle = {
    list: (arg: any) => any;
    getOne: (arg: any) => any;
    create: (arg: any) => any;
    update: (arg: any) => any;
    deleteOne: (arg: any) => any;
    mapListArgs: (p: GetListParams) => any;
    idOf: (r: any) => any;
};

const resources: Record<string, Bundle> = {
    projects: {
        list: (arg) => projectsApi.endpoints.getApiProjects.initiate(arg),
        getOne: ({ id }) => projectsApi.endpoints.getApiProjectsById.initiate({ id: toId(id) }),
        create: ({ data }) =>
            projectsApi.endpoints.postApiProjects.initiate({ createProjectDto: data }),
        update: ({ id, data }) =>
            projectsApi.endpoints.patchApiProjectsById.initiate({
                id: toId(id),
                updateProjectDto: data,
            }),
        deleteOne: ({ id }) =>
            projectsApi.endpoints.deleteApiProjectsById.initiate({ id: toId(id) }),
        mapListArgs: makeListMapper((f) => ({
            orgId: f.orgId,
            isActive: typeof f.isActive === "boolean" ? f.isActive : undefined,
        })),
        idOf,
    },

    memos: {
        list: (arg) => memosApi.endpoints.getApiMemos.initiate(arg),
        getOne: ({ id }) => memosApi.endpoints.getApiMemosById.initiate({ id: toId(id) }),
        create: ({ data }) =>
            memosApi.endpoints.postApiMemos.initiate({ createMemoDto: data }),
        update: ({ id, data }) =>
            memosApi.endpoints.patchApiMemosById.initiate({
                id: toId(id),
                updateMemoDto: data,
            }),
        deleteOne: ({ id }) =>
            memosApi.endpoints.deleteApiMemosById.initiate({ id: toId(id) }),
        mapListArgs: makeListMapper(),
        idOf,
    },

    users: {
        list: (arg) => usersApi.endpoints.getApiUsers.initiate(arg),
        getOne: ({ id }) => usersApi.endpoints.getApiUsersById.initiate({ id: toId(id) }),
        create: ({ data }) =>
            usersApi.endpoints.postApiUsers.initiate({ createUserDto: data }),
        update: ({ id, data }) =>
            usersApi.endpoints.patchApiUsersById.initiate({
                id: toId(id),
                updateUserDto: data,
            }),
        deleteOne: ({ id }) =>
            usersApi.endpoints.deleteApiUsersById.initiate({ id: toId(id) }),
        mapListArgs: makeListMapper(),
        idOf,
    },

    slidedecks: {
        list: (arg) => slidedecksApi.endpoints.getApiSlidedecks.initiate(arg),
        getOne: ({ id }) =>
            slidedecksApi.endpoints.getApiSlidedecksById.initiate({ id: toId(id) }),
        create: ({ data }) =>
            slidedecksApi.endpoints.postApiSlidedecks.initiate({ createSlidedeckDto: data }),
        update: ({ id, data }) =>
            slidedecksApi.endpoints.patchApiSlidedecksById.initiate({
                id: toId(id),
                updateSlidedeckDto: data,
            }),
        deleteOne: ({ id }) =>
            slidedecksApi.endpoints.deleteApiSlidedecksById.initiate({ id: toId(id) }),
        mapListArgs: makeListMapper(),
        idOf,
    },

    insights: {
        list: (arg) => insightsApi.endpoints.getApiInsights.initiate(arg),
        getOne: ({ id }) =>
            insightsApi.endpoints.getApiInsightsById.initiate({ id: toId(id) }),
        create: ({ data }) =>
            insightsApi.endpoints.postApiInsights.initiate({ createInsightDto: data }),
        update: ({ id, data }) =>
            insightsApi.endpoints.patchApiInsightsById.initiate({
                id: toId(id),
                updateInsightDto: data,
            }),
        deleteOne: ({ id }) =>
            insightsApi.endpoints.deleteApiInsightsById.initiate({ id: toId(id) }),
        mapListArgs: makeListMapper(),
        idOf,
    },

    organizations: {
        list: (arg) => organizationsApi.endpoints.getApiOrganizations.initiate(arg),
        getOne: ({ id }) =>
            organizationsApi.endpoints.getApiOrganizationsById.initiate({
                id: asStringId(id), // string id
            }),
        create: ({ data }) =>
            organizationsApi.endpoints.postApiOrganizations.initiate({
                createOrganizationDto: data,
            }),
        update: ({ id, data }) =>
            organizationsApi.endpoints.patchApiOrganizationsById.initiate({
                id: asStringId(id), // string id
                updateOrganizationDto: data,
            }),
        deleteOne: ({ id }) =>
            organizationsApi.endpoints.deleteApiOrganizationsById.initiate({
                id: asStringId(id), // string id
            }),
        mapListArgs: makeListMapper(),
        idOf,
    },
    tasks: {
        list: (arg) => tasksApi.endpoints.getApiTasks.initiate(arg),
        getOne: ({ id }) => tasksApi.endpoints.getApiTasksById.initiate({ id: toId(id) }),
        create: ({ data }) =>
            tasksApi.endpoints.postApiTasks.initiate({ createTaskDto: data }),
        update: ({ id, data }) =>
            tasksApi.endpoints.patchApiTasksById.initiate({
                id: toId(id),
                updateTaskDto: data,
            }),
        deleteOne: ({ id }) =>
            tasksApi.endpoints.deleteApiTasksById.initiate({ id: toId(id) }),
        mapListArgs: makeListMapper((f) => ({
            orgId: f.orgId,
            isActive: typeof f.isActive === "boolean" ? f.isActive : undefined,
        })),
        idOf,
    },
    systemPrompts: {
        list: (arg) => systemPromptsApi.endpoints.getApiSystemPrompts.initiate(arg),
        getOne: ({ id }) => systemPromptsApi.endpoints.getApiSystemPromptsById.initiate({ id: toId(id) }),
        create: ({ data }) =>
            systemPromptsApi.endpoints.postApiSystemPrompts.initiate({ createSystemPromptDto: data }),
        update: () => Promise.resolve({} as any),
        deleteOne: () => Promise.resolve({} as any),
        mapListArgs: makeListMapper((f) => ({
            orgId: f.orgId,
            isActive: typeof f.isActive === "boolean" ? f.isActive : undefined,
        })),
        idOf,
    },
    organizationMemberships: {
        // GET /api/OrganizationMemberships?search=&page=&pageSize=&sort=
        list: (arg) => organizationsApi.endpoints.getApiOrganizationMemberships.initiate(arg),

        // No single-item GET in the API; keep a harmless placeholder
        getOne: () => Promise.resolve({} as any),

        // POST /api/OrganizationMemberships
        create: ({ data }) =>
            organizationsApi.endpoints.postApiOrganizationMemberships.initiate({
                createOrganizationMembershipDto: data,
            }),

        // No PATCH in the API
        update: () => Promise.resolve({} as any),

        // DELETE /api/OrganizationMemberships/{userId}/{organizationId}
        deleteOne: ({ id }) =>
            organizationsApi.endpoints.deleteApiOrganizationMembershipsByUserIdAndOrganizationId.initiate(
                unpackMembershipId(id)
            ),

        // map RA list params -> API args
        mapListArgs: makeListMapper(),

        // synthesize a stable RA id from composite keys
        idOf: membershipIdOf,
    },
    projectAccesses: {
        // GET /api/ProjectAccesses?page=&pageSize=
        list: (arg) => projectsApi.endpoints.getApiProjectAccesses.initiate(arg),

        // No single-item GET in the API
        getOne: () => Promise.resolve({} as any),

        // POST /api/ProjectAccesses
        create: ({ data }) =>
            projectsApi.endpoints.postApiProjectAccesses.initiate({
                createProjectAccessDto: data,
            }),

        // No PATCH in the API
        update: () => Promise.resolve({} as any),

        // DELETE /api/ProjectAccesses/{userId}/{projectId}
        deleteOne: ({ id }) =>
            projectsApi.endpoints.deleteApiProjectAccessesByUserIdAndProjectId.initiate(
                unpackProjectAccessId(id)
            ),

        // API only supports page/pageSize for list
        mapListArgs: makeListMapper(),

        // stable RA id from composite keys
        idOf: projectAccessIdOf,
    },
};

export const dataProvider: DataProvider = {
    async getList(resource, params) {
        const r = resources[resource];
        if (!r?.list) return { data: [], total: 0 };

        const res = await run<any>(
            r.list(r.mapListArgs?.(params)),
            `Failed to load ${resource}`
        );

        const items = Array.isArray(res) ? res : res?.items ?? res?.data ?? [];
        const data = (items as any[]).map((x) => ({ id: (r.idOf ?? idOf)(x), ...x }));
        const total =
            typeof res?.totalCount === "number"
                ? res.totalCount
                : Array.isArray(res)
                    ? res.length
                    : Array.isArray(items)
                        ? items.length
                        : 0;

        return { data, total };
    },

    async getOne(resource, { id }) {
        const r = resources[resource];
        if (!r?.getOne) return { data: { id } as any };
        const record = await run<any>(r.getOne({ id }), `Failed to load ${resource} #${id}`);
        return { data: { id: (r.idOf ?? idOf)(record), ...record } };
    },

    async create(resource, { data }) {
        const r = resources[resource];
        const record = await run<any>(r.create({ data }), `Failed to create ${resource}`);
        return { data: { id: (r.idOf ?? idOf)(record), ...record } };
    },

    async update(resource, { id, data }) {
        const r = resources[resource];
        await run<any>(r.update({ id, data }), `Failed to update ${resource} #${id}`);

        if (r.getOne) {
            const fresh = await run<any>(r.getOne({ id }), `Failed to reload ${resource} #${id}`);
            return { data: { id: (r.idOf ?? idOf)(fresh), ...fresh } };
        }
        return { data: { id, ...data } as any };
    },

    async delete(resource, { id }) {
        const r = resources[resource];
        await run<any>(r.deleteOne({ id }), `Failed to delete ${resource} #${id}`);
        return { data: { id } as any };
    },

    async deleteMany(resource, { ids }) {
        const r = resources[resource];
        await Promise.all(
            ids.map((id) => run<any>(r.deleteOne({ id }), `Failed to delete ${resource} #${id}`))
        );
        return { data: ids };
    },

    async getMany(resource, { ids }) {
        const r = resources[resource];
        if (!r?.getOne) return { data: [] };
        const results = await Promise.all(
            ids.map(async (id) => {
                try {
                    const rec = await run<any>(r.getOne({ id }), `Failed to load ${resource} #${id}`);
                    return { id: (r.idOf ?? idOf)(rec), ...rec };
                } catch {
                    return null;
                }
            })
        );
        return { data: results.filter(Boolean) as any[] };
    },

    getManyReference: async () => ({ data: [], total: 0 }),
    updateMany: async () => ({ data: [] }),
};

