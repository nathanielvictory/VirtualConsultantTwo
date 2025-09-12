import type { DataProvider, GetListParams } from "react-admin";
import { store } from "./store";

// Generated API slices (from your codegen)
import { projectsApi } from "./api/projectsApi";
import { memosApi } from "./api/memosApi";
import { usersApi } from "./api/usersApi";
import { slidedecksApi } from "./api/slidedecksApi";
import { insightsApi } from "./api/insightsApi";

/** prefer numeric ids when possible */
const toId = (id: any) =>
    typeof id === "string" && /^\d+$/.test(id) ? Number(id) : id;

const idOf = (r: any) => r?.id ?? r?.uuid ?? r?._id;

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
    list?: (arg: any) => any;
    getOne?: (arg: any) => any;
    create?: (arg: any) => any;
    update?: (arg: any) => any;
    deleteOne?: (arg: any) => any;
    mapListArgs?: (p: GetListParams) => any;
    idOf?: (r: any) => any;
    readOnly?: boolean;
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

    // If Insights is read-only, we mark readOnly and only implement list/getOne
    insights: {
        list: (arg) => insightsApi.endpoints.getApiInsights.initiate(arg),
        getOne: ({ id }) =>
            insightsApi.endpoints.getApiInsightsById?.initiate
                ? insightsApi.endpoints.getApiInsightsById.initiate({ id: toId(id) })
                : undefined,
        mapListArgs: makeListMapper(),
        idOf,
        readOnly: true,
    },
};

export const dataProvider: DataProvider = {
    async getList(resource, params) {
        const r = resources[resource];
        if (!r?.list) return { data: [], total: 0 };
        const res = await store.dispatch(r.list(r.mapListArgs?.(params))).unwrap();

        // Accept shapes: { items, totalCount }, array, or { data, total }
        const items = Array.isArray(res)
            ? res
            : res?.items ?? res?.data ?? [];
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
        const record = await store.dispatch(r.getOne({ id })).unwrap();
        return { data: { id: (r.idOf ?? idOf)(record), ...record } };
    },

    async create(resource, { data }) {
        const r = resources[resource];
        if (!r?.create || r.readOnly) return { data: {} as any };
        const record = await store.dispatch(r.create({ data })).unwrap();
        return { data: { id: (r.idOf ?? idOf)(record), ...record } };
    },

    async update(resource, { id, data }) {
        const r = resources[resource];
        if (!r?.update || r.readOnly) return { data: {} as any };
        await store.dispatch(r.update({ id, data })).unwrap();
        // re-fetch for canonical data if PATCH returns void
        if (r.getOne) {
            const fresh = await store.dispatch(r.getOne({ id })).unwrap();
            return { data: { id: (r.idOf ?? idOf)(fresh), ...fresh } };
        }
        return { data: { id, ...data } as any };
    },

    async delete(resource, { id }) {
        const r = resources[resource];
        if (!r?.deleteOne || r.readOnly) return { data: {} as any };
        await store.dispatch(r.deleteOne({ id })).unwrap();
        return { data: { id } as any };
    },

    // Optional bulk helpers
    async deleteMany(resource, { ids }) {
        const r = resources[resource];
        if (!r?.deleteOne || r.readOnly) return { data: [] };
        // @ts-ignore
        await Promise.all(ids.map((id) => store.dispatch(r.deleteOne({ id })).unwrap()));
        return { data: ids };
    },

    getMany: async () => ({ data: [] }),
    getManyReference: async () => ({ data: [], total: 0 }),
    updateMany: async () => ({ data: [] }),
};
