import { emptySplitApi as api } from "./emptyApi";
export const addTagTypes = ["Projects"] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
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
};
export const {
  useGetApiProjectsQuery,
  usePostApiProjectsMutation,
  useGetApiProjectsByIdQuery,
  usePatchApiProjectsByIdMutation,
  useDeleteApiProjectsByIdMutation,
} = injectedRtkApi;
