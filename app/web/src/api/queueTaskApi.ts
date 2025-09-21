import { emptySplitApi as api } from "./emptyApi.ts";
export const addTagTypes = ["QueueTask"] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      postApiQueueTaskInsights: build.mutation<
        PostApiQueueTaskInsightsApiResponse,
        PostApiQueueTaskInsightsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/QueueTask/insights`,
          method: "POST",
          body: queryArg.queueCreateInsightsTaskDto,
        }),
        invalidatesTags: ["QueueTask"],
      }),
      postApiQueueTaskFullReport: build.mutation<
        PostApiQueueTaskFullReportApiResponse,
        PostApiQueueTaskFullReportApiArg
      >({
        query: (queryArg) => ({
          url: `/api/QueueTask/full-report`,
          method: "POST",
          body: queryArg.queueCreateFullReportTaskDto,
        }),
        invalidatesTags: ["QueueTask"],
      }),
      postApiQueueTaskMemo: build.mutation<
        PostApiQueueTaskMemoApiResponse,
        PostApiQueueTaskMemoApiArg
      >({
        query: (queryArg) => ({
          url: `/api/QueueTask/memo`,
          method: "POST",
          body: queryArg.queueCreateMemoTaskDto,
        }),
        invalidatesTags: ["QueueTask"],
      }),
      postApiQueueTaskSlides: build.mutation<
        PostApiQueueTaskSlidesApiResponse,
        PostApiQueueTaskSlidesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/QueueTask/slides`,
          method: "POST",
          body: queryArg.queueCreateSlidesTaskDto,
        }),
        invalidatesTags: ["QueueTask"],
      }),
      postApiQueueTaskSurveyData: build.mutation<
        PostApiQueueTaskSurveyDataApiResponse,
        PostApiQueueTaskSurveyDataApiArg
      >({
        query: (queryArg) => ({
          url: `/api/QueueTask/survey-data`,
          method: "POST",
          body: queryArg.queueCreateSurveyDataTaskDto,
        }),
        invalidatesTags: ["QueueTask"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as queueTaskApi };
export type PostApiQueueTaskInsightsApiResponse = unknown;
export type PostApiQueueTaskInsightsApiArg = {
  queueCreateInsightsTaskDto: QueueCreateInsightsTaskDto;
};
export type PostApiQueueTaskFullReportApiResponse = unknown;
export type PostApiQueueTaskFullReportApiArg = {
  queueCreateFullReportTaskDto: QueueCreateFullReportTaskDto;
};
export type PostApiQueueTaskMemoApiResponse = unknown;
export type PostApiQueueTaskMemoApiArg = {
  queueCreateMemoTaskDto: QueueCreateMemoTaskDto;
};
export type PostApiQueueTaskSlidesApiResponse = unknown;
export type PostApiQueueTaskSlidesApiArg = {
  queueCreateSlidesTaskDto: QueueCreateSlidesTaskDto;
};
export type PostApiQueueTaskSurveyDataApiResponse = unknown;
export type PostApiQueueTaskSurveyDataApiArg = {
  queueCreateSurveyDataTaskDto: QueueCreateSurveyDataTaskDto;
};
export type QueueCreateInsightsTaskDto = {
  projectId?: number;
  numberOfInsights?: number | null;
  focus?: string | null;
};
export type QueueCreateFullReportTaskDto = {
  projectId?: number;
};
export type QueueCreateMemoTaskDto = {
  projectId?: number;
};
export type QueueCreateSlidesTaskDto = {
  projectId?: number;
};
export type QueueCreateSurveyDataTaskDto = {
  projectId?: number;
};
export const {
  usePostApiQueueTaskInsightsMutation,
  usePostApiQueueTaskFullReportMutation,
  usePostApiQueueTaskMemoMutation,
  usePostApiQueueTaskSlidesMutation,
  usePostApiQueueTaskSurveyDataMutation,
} = injectedRtkApi;
