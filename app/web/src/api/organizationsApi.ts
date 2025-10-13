import { emptySplitApi as api } from "./emptyApi.ts";
export const addTagTypes = [
  "OrganizationMemberships",
  "Organizations",
] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getApiOrganizationMemberships: build.query<
        GetApiOrganizationMembershipsApiResponse,
        GetApiOrganizationMembershipsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/OrganizationMemberships`,
          params: {
            search: queryArg.search,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
            sort: queryArg.sort,
          },
        }),
        providesTags: ["OrganizationMemberships"],
      }),
      postApiOrganizationMemberships: build.mutation<
        PostApiOrganizationMembershipsApiResponse,
        PostApiOrganizationMembershipsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/OrganizationMemberships`,
          method: "POST",
          body: queryArg.createOrganizationMembershipDto,
        }),
        invalidatesTags: ["OrganizationMemberships"],
      }),
      deleteApiOrganizationMembershipsByUserIdAndOrganizationId: build.mutation<
        DeleteApiOrganizationMembershipsByUserIdAndOrganizationIdApiResponse,
        DeleteApiOrganizationMembershipsByUserIdAndOrganizationIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/OrganizationMemberships/${queryArg.userId}/${queryArg.organizationId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["OrganizationMemberships"],
      }),
      getApiOrganizations: build.query<
        GetApiOrganizationsApiResponse,
        GetApiOrganizationsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/Organizations`,
          params: {
            search: queryArg.search,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
            sort: queryArg.sort,
          },
        }),
        providesTags: ["Organizations"],
      }),
      postApiOrganizations: build.mutation<
        PostApiOrganizationsApiResponse,
        PostApiOrganizationsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/Organizations`,
          method: "POST",
          body: queryArg.createOrganizationDto,
        }),
        invalidatesTags: ["Organizations"],
      }),
      getApiOrganizationsById: build.query<
        GetApiOrganizationsByIdApiResponse,
        GetApiOrganizationsByIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/Organizations/${queryArg.id}` }),
        providesTags: ["Organizations"],
      }),
      patchApiOrganizationsById: build.mutation<
        PatchApiOrganizationsByIdApiResponse,
        PatchApiOrganizationsByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/Organizations/${queryArg.id}`,
          method: "PATCH",
          body: queryArg.updateOrganizationDto,
        }),
        invalidatesTags: ["Organizations"],
      }),
      deleteApiOrganizationsById: build.mutation<
        DeleteApiOrganizationsByIdApiResponse,
        DeleteApiOrganizationsByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/Organizations/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Organizations"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as organizationsApi };
export type GetApiOrganizationMembershipsApiResponse =
  /** status 200 OK */ OrganizationMembershipListItemDtoPagedResultDto;
export type GetApiOrganizationMembershipsApiArg = {
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
};
export type PostApiOrganizationMembershipsApiResponse =
  /** status 200 OK */ OrganizationMembershipListItemDto;
export type PostApiOrganizationMembershipsApiArg = {
  createOrganizationMembershipDto: CreateOrganizationMembershipDto;
};
export type DeleteApiOrganizationMembershipsByUserIdAndOrganizationIdApiResponse =
  unknown;
export type DeleteApiOrganizationMembershipsByUserIdAndOrganizationIdApiArg = {
  userId: number;
  organizationId: string;
};
export type GetApiOrganizationsApiResponse =
  /** status 200 OK */ OrganizationListItemDtoPagedResultDto;
export type GetApiOrganizationsApiArg = {
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
};
export type PostApiOrganizationsApiResponse =
  /** status 200 OK */ OrganizationDetailDto;
export type PostApiOrganizationsApiArg = {
  createOrganizationDto: CreateOrganizationDto;
};
export type GetApiOrganizationsByIdApiResponse =
  /** status 200 OK */ OrganizationDetailDto;
export type GetApiOrganizationsByIdApiArg = {
  id: string;
};
export type PatchApiOrganizationsByIdApiResponse = unknown;
export type PatchApiOrganizationsByIdApiArg = {
  id: string;
  updateOrganizationDto: UpdateOrganizationDto;
};
export type DeleteApiOrganizationsByIdApiResponse = unknown;
export type DeleteApiOrganizationsByIdApiArg = {
  id: string;
};
export type OrganizationMembershipListItemDto = {
  userId?: number;
  userName?: string | null;
  organizationId?: string | null;
  organizationName?: string | null;
  createdAt?: string;
};
export type OrganizationMembershipListItemDtoPagedResultDto = {
  items?: OrganizationMembershipListItemDto[] | null;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
};
export type CreateOrganizationMembershipDto = {
  userId?: number;
  organizationId?: string | null;
};
export type OrganizationListItemDto = {
  id?: string | null;
  name?: string | null;
};
export type OrganizationListItemDtoPagedResultDto = {
  items?: OrganizationListItemDto[] | null;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
};
export type OrganizationDetailDto = {
  id?: string | null;
  name?: string | null;
};
export type CreateOrganizationDto = {
  id?: string | null;
  name?: string | null;
};
export type UpdateOrganizationDto = {
  name?: string | null;
};
export const {
  useGetApiOrganizationMembershipsQuery,
  usePostApiOrganizationMembershipsMutation,
  useDeleteApiOrganizationMembershipsByUserIdAndOrganizationIdMutation,
  useGetApiOrganizationsQuery,
  usePostApiOrganizationsMutation,
  useGetApiOrganizationsByIdQuery,
  usePatchApiOrganizationsByIdMutation,
  useDeleteApiOrganizationsByIdMutation,
} = injectedRtkApi;
