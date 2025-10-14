import { emptySplitApi as api } from "./emptyApi.ts";
export const addTagTypes = ["ProjectAccesses", "Projects"] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getApiProjectAccesses: build.query<
        GetApiProjectAccessesApiResponse,
        GetApiProjectAccessesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/ProjectAccesses`,
          params: {
            search: queryArg.search,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["ProjectAccesses"],
      }),
      postApiProjectAccesses: build.mutation<
        PostApiProjectAccessesApiResponse,
        PostApiProjectAccessesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/ProjectAccesses`,
          method: "POST",
          body: queryArg.createProjectAccessDto,
        }),
        invalidatesTags: ["ProjectAccesses"],
      }),
      deleteApiProjectAccessesByUserIdAndProjectId: build.mutation<
        DeleteApiProjectAccessesByUserIdAndProjectIdApiResponse,
        DeleteApiProjectAccessesByUserIdAndProjectIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/ProjectAccesses/${queryArg.userId}/${queryArg.projectId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["ProjectAccesses"],
      }),
      getApiProjects: build.query<
        GetApiProjectsApiResponse,
        GetApiProjectsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/Projects`,
          params: {
            orgId: queryArg.orgId,
            search: queryArg.search,
            isActive: queryArg.isActive,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
            sort: queryArg.sort,
          },
        }),
        providesTags: ["Projects"],
      }),
      postApiProjects: build.mutation<
        PostApiProjectsApiResponse,
        PostApiProjectsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/Projects`,
          method: "POST",
          body: queryArg.createProjectDto,
        }),
        invalidatesTags: ["Projects"],
      }),
      getApiProjectsById: build.query<
        GetApiProjectsByIdApiResponse,
        GetApiProjectsByIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/Projects/${queryArg.id}` }),
        providesTags: ["Projects"],
      }),
      patchApiProjectsById: build.mutation<
        PatchApiProjectsByIdApiResponse,
        PatchApiProjectsByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/Projects/${queryArg.id}`,
          method: "PATCH",
          body: queryArg.updateProjectDto,
        }),
        invalidatesTags: ["Projects"],
      }),
      deleteApiProjectsById: build.mutation<
        DeleteApiProjectsByIdApiResponse,
        DeleteApiProjectsByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/Projects/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Projects"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as projectsApi };
export type GetApiProjectAccessesApiResponse =
  /** status 200 OK */ ProjectAccessListItemDtoPagedResultDto;
export type GetApiProjectAccessesApiArg = {
  search?: string;
  page?: number;
  pageSize?: number;
};
export type PostApiProjectAccessesApiResponse =
  /** status 200 OK */ ProjectAccessListItemDto;
export type PostApiProjectAccessesApiArg = {
  createProjectAccessDto: CreateProjectAccessDto;
};
export type DeleteApiProjectAccessesByUserIdAndProjectIdApiResponse = unknown;
export type DeleteApiProjectAccessesByUserIdAndProjectIdApiArg = {
  userId: number;
  projectId: number;
};
export type GetApiProjectsApiResponse =
  /** status 200 OK */ ProjectListItemDtoPagedResultDto;
export type GetApiProjectsApiArg = {
  orgId?: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
  sort?: string;
};
export type PostApiProjectsApiResponse = /** status 200 OK */ ProjectDetailDto;
export type PostApiProjectsApiArg = {
  createProjectDto: CreateProjectDto;
};
export type GetApiProjectsByIdApiResponse =
  /** status 200 OK */ ProjectDetailDto;
export type GetApiProjectsByIdApiArg = {
  id: number;
};
export type PatchApiProjectsByIdApiResponse = unknown;
export type PatchApiProjectsByIdApiArg = {
  id: number;
  updateProjectDto: UpdateProjectDto;
};
export type DeleteApiProjectsByIdApiResponse = unknown;
export type DeleteApiProjectsByIdApiArg = {
  id: number;
};
export type ProjectAccessListItemDto = {
  userId?: number;
  projectId?: number;
  allowAccess?: boolean;
  createdAt?: string;
  reason?: string | null;
};
export type ProjectAccessListItemDtoPagedResultDto = {
  items?: ProjectAccessListItemDto[] | null;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
};
export type CreateProjectAccessDto = {
  userId?: number;
  projectId?: number;
  allowAccess?: boolean;
  reason?: string | null;
};
export type ProjectListItemDto = {
  id?: number;
  kbid?: string | null;
  name?: string | null;
  organizationId?: string | null;
  projectContext?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastRefreshed?: string | null;
};
export type ProjectListItemDtoPagedResultDto = {
  items?: ProjectListItemDto[] | null;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
};
export type ProjectDetailDto = {
  id?: number;
  kbid?: string | null;
  name?: string | null;
  organizationId?: string | null;
  projectContext?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastRefreshed?: string | null;
  totalTokens?: number;
};
export type CreateProjectDto = {
  kbid?: string | null;
  name?: string | null;
  organizationId?: string | null;
  projectContext?: string | null;
  isActive?: boolean;
};
export type UpdateProjectDto = {
  kbid?: string | null;
  name?: string | null;
  organizationId?: string | null;
  projectContext?: string | null;
  isActive?: boolean | null;
  lastRefreshed?: string | null;
};
export const {
  useGetApiProjectAccessesQuery,
  usePostApiProjectAccessesMutation,
  useDeleteApiProjectAccessesByUserIdAndProjectIdMutation,
  useGetApiProjectsQuery,
  usePostApiProjectsMutation,
  useGetApiProjectsByIdQuery,
  usePatchApiProjectsByIdMutation,
  useDeleteApiProjectsByIdMutation,
} = injectedRtkApi;
