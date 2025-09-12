import { emptySplitApi as api } from "./emptyApi";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getApiMemos: build.query<GetApiMemosApiResponse, GetApiMemosApiArg>({
      query: (queryArg) => ({
        url: `/api/Memos`,
        params: {
          projectId: queryArg.projectId,
          search: queryArg.search,
          page: queryArg.page,
          pageSize: queryArg.pageSize,
          sort: queryArg.sort,
        },
      }),
    }),
    postApiMemos: build.mutation<PostApiMemosApiResponse, PostApiMemosApiArg>({
      query: (queryArg) => ({
        url: `/api/Memos`,
        method: "POST",
        body: queryArg.createMemoDto,
      }),
    }),
    getApiMemosById: build.query<
      GetApiMemosByIdApiResponse,
      GetApiMemosByIdApiArg
    >({
      query: (queryArg) => ({ url: `/api/Memos/${queryArg.id}` }),
    }),
    patchApiMemosById: build.mutation<
      PatchApiMemosByIdApiResponse,
      PatchApiMemosByIdApiArg
    >({
      query: (queryArg) => ({
        url: `/api/Memos/${queryArg.id}`,
        method: "PATCH",
        body: queryArg.updateMemoDto,
      }),
    }),
    deleteApiMemosById: build.mutation<
      DeleteApiMemosByIdApiResponse,
      DeleteApiMemosByIdApiArg
    >({
      query: (queryArg) => ({
        url: `/api/Memos/${queryArg.id}`,
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as memosApi };
export type GetApiMemosApiResponse =
  /** status 200 OK */ MemoListItemDtoPagedResultDto;
export type GetApiMemosApiArg = {
  projectId?: number;
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
};
export type PostApiMemosApiResponse = /** status 200 OK */ MemoDetailDto;
export type PostApiMemosApiArg = {
  createMemoDto: CreateMemoDto;
};
export type GetApiMemosByIdApiResponse = /** status 200 OK */ MemoDetailDto;
export type GetApiMemosByIdApiArg = {
  id: number;
};
export type PatchApiMemosByIdApiResponse = unknown;
export type PatchApiMemosByIdApiArg = {
  id: number;
  updateMemoDto: UpdateMemoDto;
};
export type DeleteApiMemosByIdApiResponse = unknown;
export type DeleteApiMemosByIdApiArg = {
  id: number;
};
export type MemoListItemDto = {
  id?: number;
  projectId?: number;
  name?: string | null;
  docId?: string | null;
  promptFocus?: string | null;
  createdById?: number;
  createdAt?: string;
  updatedAt?: string;
};
export type MemoListItemDtoPagedResultDto = {
  items?: MemoListItemDto[] | null;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
};
export type MemoDetailDto = {
  id?: number;
  projectId?: number;
  name?: string | null;
  docId?: string | null;
  promptFocus?: string | null;
  createdById?: number;
  createdAt?: string;
  updatedAt?: string;
};
export type CreateMemoDto = {
  projectId?: number;
  name?: string | null;
  docId?: string | null;
  promptFocus?: string | null;
  createdById?: number;
};
export type UpdateMemoDto = {
  name?: string | null;
  docId?: string | null;
  promptFocus?: string | null;
};
export const {
  useGetApiMemosQuery,
  usePostApiMemosMutation,
  useGetApiMemosByIdQuery,
  usePatchApiMemosByIdMutation,
  useDeleteApiMemosByIdMutation,
} = injectedRtkApi;
