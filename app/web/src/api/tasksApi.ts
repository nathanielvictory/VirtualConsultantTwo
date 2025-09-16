import { emptySplitApi as api } from "./emptyApi.ts";
export const addTagTypes = ["Tasks"] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getApiTasks: build.query<GetApiTasksApiResponse, GetApiTasksApiArg>({
        query: (queryArg) => ({
          url: `/api/Tasks`,
          params: {
            projectId: queryArg.projectId,
            createdByUserId: queryArg.createdByUserId,
            status: queryArg.status,
            type: queryArg["type"],
            createdAfter: queryArg.createdAfter,
            createdBefore: queryArg.createdBefore,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
            sort: queryArg.sort,
          },
        }),
        providesTags: ["Tasks"],
      }),
      postApiTasks: build.mutation<PostApiTasksApiResponse, PostApiTasksApiArg>(
        {
          query: (queryArg) => ({
            url: `/api/Tasks`,
            method: "POST",
            body: queryArg.createTaskDto,
          }),
          invalidatesTags: ["Tasks"],
        },
      ),
      getApiTasksById: build.query<
        GetApiTasksByIdApiResponse,
        GetApiTasksByIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/Tasks/${queryArg.id}` }),
        providesTags: ["Tasks"],
      }),
      patchApiTasksById: build.mutation<
        PatchApiTasksByIdApiResponse,
        PatchApiTasksByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/Tasks/${queryArg.id}`,
          method: "PATCH",
          body: queryArg.updateTaskDto,
        }),
        invalidatesTags: ["Tasks"],
      }),
      deleteApiTasksById: build.mutation<
        DeleteApiTasksByIdApiResponse,
        DeleteApiTasksByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/Tasks/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Tasks"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as tasksApi };
export type GetApiTasksApiResponse =
  /** status 200 OK */ TaskListItemDtoPagedResultDto;
export type GetApiTasksApiArg = {
  projectId?: number;
  createdByUserId?: number;
  status?: TaskJobStatus;
  type?: TaskJobType;
  createdAfter?: string;
  createdBefore?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
};
export type PostApiTasksApiResponse = /** status 200 OK */ TaskDetailDto;
export type PostApiTasksApiArg = {
  createTaskDto: CreateTaskDto;
};
export type GetApiTasksByIdApiResponse = /** status 200 OK */ TaskDetailDto;
export type GetApiTasksByIdApiArg = {
  id: number;
};
export type PatchApiTasksByIdApiResponse = unknown;
export type PatchApiTasksByIdApiArg = {
  id: number;
  updateTaskDto: UpdateTaskDto;
};
export type DeleteApiTasksByIdApiResponse = unknown;
export type DeleteApiTasksByIdApiArg = {
  id: number;
};
export type TaskJobType = 0 | 1 | 2;
export type TaskStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type TaskListItemDto = {
  id?: number;
  projectId?: number;
  jobType?: TaskJobType;
  status?: TaskStatus;
  progress?: number | null;
  createdByUserId?: number;
  createdAt?: string;
  updatedAt?: string;
  startedAt?: string | null;
  completedAt?: string | null;
};
export type TaskListItemDtoPagedResultDto = {
  items?: TaskListItemDto[] | null;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
};
export type TaskJobStatus = 0 | 1 | 2 | 3 | 4;
export type TaskArtifactDto = {
  id?: number;
  taskId?: number;
  resourceType?: string | null;
  resourceId?: string | null;
  action?: string | null;
  model?: string | null;
  promptTokens?: number | null;
  completionTokens?: number | null;
  totalTokens?: number | null;
  createdAt?: string;
};
export type TaskDetailDto = {
  id?: number;
  projectId?: number;
  jobType?: TaskJobType;
  status?: TaskStatus;
  progress?: number | null;
  createdByUserId?: number;
  payloadJson?: string | null;
  errorMessage?: string | null;
  createdAt?: string;
  updatedAt?: string;
  startedAt?: string | null;
  completedAt?: string | null;
  artifacts?: TaskArtifactDto[] | null;
};
export type CreateTaskDto = {
  projectId?: number;
  jobType?: TaskJobType;
  createdByUserId?: number;
  payloadJson?: string | null;
};
export type UpdateTaskDto = {
  type?: TaskJobType;
  status?: TaskStatus;
  progress?: number | null;
  payloadJson?: string | null;
  errorMessage?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
};
export const {
  useGetApiTasksQuery,
  usePostApiTasksMutation,
  useGetApiTasksByIdQuery,
  usePatchApiTasksByIdMutation,
  useDeleteApiTasksByIdMutation,
} = injectedRtkApi;
