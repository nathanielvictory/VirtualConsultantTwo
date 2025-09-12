import { emptySplitApi as api } from "./emptyApi";
export const addTagTypes = ["Insights"] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getApiInsights: build.query<
        GetApiInsightsApiResponse,
        GetApiInsightsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/Insights`,
          params: {
            projectId: queryArg.projectId,
            source: queryArg.source,
            search: queryArg.search,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
            sort: queryArg.sort,
          },
        }),
        providesTags: ["Insights"],
      }),
      postApiInsights: build.mutation<
        PostApiInsightsApiResponse,
        PostApiInsightsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/Insights`,
          method: "POST",
          body: queryArg.createInsightDto,
        }),
        invalidatesTags: ["Insights"],
      }),
      getApiInsightsById: build.query<
        GetApiInsightsByIdApiResponse,
        GetApiInsightsByIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/Insights/${queryArg.id}` }),
        providesTags: ["Insights"],
      }),
      patchApiInsightsById: build.mutation<
        PatchApiInsightsByIdApiResponse,
        PatchApiInsightsByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/Insights/${queryArg.id}`,
          method: "PATCH",
          body: queryArg.updateInsightDto,
        }),
        invalidatesTags: ["Insights"],
      }),
      deleteApiInsightsById: build.mutation<
        DeleteApiInsightsByIdApiResponse,
        DeleteApiInsightsByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/Insights/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Insights"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as insightsApi };
export type GetApiInsightsApiResponse =
  /** status 200 OK */ InsightListItemDtoPagedResultDto;
export type GetApiInsightsApiArg = {
  projectId?: number;
  source?: InsightSource;
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
};
export type PostApiInsightsApiResponse = /** status 200 OK */ InsightDetailDto;
export type PostApiInsightsApiArg = {
  createInsightDto: CreateInsightDto;
};
export type GetApiInsightsByIdApiResponse =
  /** status 200 OK */ InsightDetailDto;
export type GetApiInsightsByIdApiArg = {
  id: number;
};
export type PatchApiInsightsByIdApiResponse = unknown;
export type PatchApiInsightsByIdApiArg = {
  id: number;
  updateInsightDto: UpdateInsightDto;
};
export type DeleteApiInsightsByIdApiResponse = unknown;
export type DeleteApiInsightsByIdApiArg = {
  id: number;
};
export type InsightSource = 0 | 1;
export type InsightListItemDto = {
  id?: number;
  projectId?: number;
  orderIndex?: number;
  content?: string | null;
  source?: InsightSource;
};
export type InsightListItemDtoPagedResultDto = {
  items?: InsightListItemDto[] | null;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
};
export type InsightDetailDto = {
  id?: number;
  projectId?: number;
  orderIndex?: number;
  content?: string | null;
  source?: InsightSource;
};
export type CreateInsightDto = {
  projectId?: number;
  content?: string | null;
  source?: InsightSource;
  orderIndex?: number;
};
export type UpdateInsightDto = {
  content?: string | null;
  source?: InsightSource;
  orderIndex?: number | null;
};
export const {
  useGetApiInsightsQuery,
  usePostApiInsightsMutation,
  useGetApiInsightsByIdQuery,
  usePatchApiInsightsByIdMutation,
  useDeleteApiInsightsByIdMutation,
} = injectedRtkApi;
