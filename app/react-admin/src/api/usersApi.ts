import { emptySplitApi as api } from "./emptyApi";
export const addTagTypes = ["Users"] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      postApiUsers: build.mutation<PostApiUsersApiResponse, PostApiUsersApiArg>(
        {
          query: (queryArg) => ({
            url: `/api/Users`,
            method: "POST",
            body: queryArg.createUserDto,
          }),
          invalidatesTags: ["Users"],
        },
      ),
      getApiUsers: build.query<GetApiUsersApiResponse, GetApiUsersApiArg>({
        query: (queryArg) => ({
          url: `/api/Users`,
          params: {
            search: queryArg.search,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["Users"],
      }),
      getApiUsersById: build.query<
        GetApiUsersByIdApiResponse,
        GetApiUsersByIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/Users/${queryArg.id}` }),
        providesTags: ["Users"],
      }),
      patchApiUsersById: build.mutation<
        PatchApiUsersByIdApiResponse,
        PatchApiUsersByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/Users/${queryArg.id}`,
          method: "PATCH",
          body: queryArg.updateUserDto,
        }),
        invalidatesTags: ["Users"],
      }),
      deleteApiUsersById: build.mutation<
        DeleteApiUsersByIdApiResponse,
        DeleteApiUsersByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/Users/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Users"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as usersApi };
export type PostApiUsersApiResponse = unknown;
export type PostApiUsersApiArg = {
  createUserDto: CreateUserDto;
};
export type GetApiUsersApiResponse = unknown;
export type GetApiUsersApiArg = {
  search?: string;
  page?: number;
  pageSize?: number;
};
export type GetApiUsersByIdApiResponse = unknown;
export type GetApiUsersByIdApiArg = {
  id: number;
};
export type PatchApiUsersByIdApiResponse = unknown;
export type PatchApiUsersByIdApiArg = {
  id: number;
  updateUserDto: UpdateUserDto;
};
export type DeleteApiUsersByIdApiResponse = unknown;
export type DeleteApiUsersByIdApiArg = {
  id: number;
};
export type CreateUserDto = {
  username?: string | null;
  password?: string | null;
  organizationId?: string | null;
  roles?: string[] | null;
};
export type UpdateUserDto = {
  username?: string | null;
  password?: string | null;
  organizationId?: string | null;
  roles?: string[] | null;
};
export const {
  usePostApiUsersMutation,
  useGetApiUsersQuery,
  useGetApiUsersByIdQuery,
  usePatchApiUsersByIdMutation,
  useDeleteApiUsersByIdMutation,
} = injectedRtkApi;
