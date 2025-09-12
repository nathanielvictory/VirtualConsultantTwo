import { emptySplitApi as api } from "./emptyApi";
export const addTagTypes = ["Slidedecks"] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getApiSlidedecks: build.query<
        GetApiSlidedecksApiResponse,
        GetApiSlidedecksApiArg
      >({
        query: (queryArg) => ({
          url: `/api/Slidedecks`,
          params: {
            projectId: queryArg.projectId,
            search: queryArg.search,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
            sort: queryArg.sort,
          },
        }),
        providesTags: ["Slidedecks"],
      }),
      postApiSlidedecks: build.mutation<
        PostApiSlidedecksApiResponse,
        PostApiSlidedecksApiArg
      >({
        query: (queryArg) => ({
          url: `/api/Slidedecks`,
          method: "POST",
          body: queryArg.createSlidedeckDto,
        }),
        invalidatesTags: ["Slidedecks"],
      }),
      getApiSlidedecksById: build.query<
        GetApiSlidedecksByIdApiResponse,
        GetApiSlidedecksByIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/Slidedecks/${queryArg.id}` }),
        providesTags: ["Slidedecks"],
      }),
      patchApiSlidedecksById: build.mutation<
        PatchApiSlidedecksByIdApiResponse,
        PatchApiSlidedecksByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/Slidedecks/${queryArg.id}`,
          method: "PATCH",
          body: queryArg.updateSlidedeckDto,
        }),
        invalidatesTags: ["Slidedecks"],
      }),
      deleteApiSlidedecksById: build.mutation<
        DeleteApiSlidedecksByIdApiResponse,
        DeleteApiSlidedecksByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/Slidedecks/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Slidedecks"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as slidedecksApi };
export type GetApiSlidedecksApiResponse =
  /** status 200 OK */ SlidedeckListItemDtoPagedResultDto;
export type GetApiSlidedecksApiArg = {
  projectId?: number;
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
};
export type PostApiSlidedecksApiResponse =
  /** status 200 OK */ SlidedeckDetailDto;
export type PostApiSlidedecksApiArg = {
  createSlidedeckDto: CreateSlidedeckDto;
};
export type GetApiSlidedecksByIdApiResponse =
  /** status 200 OK */ SlidedeckDetailDto;
export type GetApiSlidedecksByIdApiArg = {
  id: number;
};
export type PatchApiSlidedecksByIdApiResponse = unknown;
export type PatchApiSlidedecksByIdApiArg = {
  id: number;
  updateSlidedeckDto: UpdateSlidedeckDto;
};
export type DeleteApiSlidedecksByIdApiResponse = unknown;
export type DeleteApiSlidedecksByIdApiArg = {
  id: number;
};
export type SlidedeckListItemDto = {
  id?: number;
  projectId?: number;
  name?: string | null;
  presentationId?: string | null;
  sheetsId?: string | null;
  promptFocus?: string | null;
  createdById?: number;
  createdAt?: string;
  updatedAt?: string;
};
export type SlidedeckListItemDtoPagedResultDto = {
  items?: SlidedeckListItemDto[] | null;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
};
export type SlidedeckDetailDto = {
  id?: number;
  projectId?: number;
  name?: string | null;
  presentationId?: string | null;
  sheetsId?: string | null;
  promptFocus?: string | null;
  createdById?: number;
  createdAt?: string;
  updatedAt?: string;
};
export type CreateSlidedeckDto = {
  projectId?: number;
  name?: string | null;
  presentationId?: string | null;
  sheetsId?: string | null;
  promptFocus?: string | null;
  createdById?: number;
};
export type UpdateSlidedeckDto = {
  name?: string | null;
  presentationId?: string | null;
  sheetsId?: string | null;
  promptFocus?: string | null;
};
export const {
  useGetApiSlidedecksQuery,
  usePostApiSlidedecksMutation,
  useGetApiSlidedecksByIdQuery,
  usePatchApiSlidedecksByIdMutation,
  useDeleteApiSlidedecksByIdMutation,
} = injectedRtkApi;
