//import type { ConfigFile } from "@rtk-query/codegen-openapi";

/**
 * We fetch from your running swagger.json and generate per-controller files.
 * Note: filterEndpoints matches by operationId in most Swagger setups,
 * so these regexes assume your operationIds start with the controller name,
 * e.g. Auth_Login, Users_GetById, etc.
 */
const config = {
    schemaFile: "http://localhost:8080/swagger/v1/swagger.json",
    apiFile: "./src/api/emptyApi.ts.ts",
    apiImport: "emptySplitApi",
    hooks: true,
    tag: true,
    // Generate one bundle per controller into src/api/
    outputFiles: {
        "./src/api/authApi.ts": {
            exportName: "authApi",
            filterEndpoints: [/Auth/i],
        },
        "./src/api/insightsApi.ts": {
            exportName: "insightsApi",
            filterEndpoints: [/Insights/i],
        },
        "./src/api/memosApi.ts": {
            exportName: "memosApi",
            filterEndpoints: [/Memos/i],
        },
        "./src/api/projectsApi.ts": {
            exportName: "projectsApi",
            filterEndpoints: [/Project/i],
        },
        "./src/api/slidedecksApi.ts": {
            exportName: "slidedecksApi",
            filterEndpoints: [/Slidedecks?/i],
        },
        "./src/api/usersApi.ts": {
            exportName: "usersApi",
            filterEndpoints: [/Users?/i],
        },
        "./src/api/organizationsApi.ts": {
            exportName: "organizationsApi",
            filterEndpoints: [/Organization?/i],
        },
        "./src/api/tasksApi.ts": {
            exportName: "tasksApi",
            filterEndpoints: [/Tasks?/i],
        },
        "./src/api/systemPromptsApi.ts": {
            exportName: "systemPromptsApi",
            filterEndpoints: [/SystemPrompts?/i],
        },
        "./src/api/queueTaskApi.ts": {
            exportName: "queueTaskApi",
            filterEndpoints: [/QueueTask?/i],
        },
    },
};

export default config;
