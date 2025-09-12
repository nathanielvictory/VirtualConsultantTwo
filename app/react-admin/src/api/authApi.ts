import { emptySplitApi as api } from "./emptyApi";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    postApiAuthToken: build.mutation<
      PostApiAuthTokenApiResponse,
      PostApiAuthTokenApiArg
    >({
      query: (queryArg) => ({
        url: `/api/Auth/token`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
    postApiAuthRefresh: build.mutation<
      PostApiAuthRefreshApiResponse,
      PostApiAuthRefreshApiArg
    >({
      query: () => ({ url: `/api/Auth/refresh`, method: "POST" }),
    }),
    postApiAuthLogout: build.mutation<
      PostApiAuthLogoutApiResponse,
      PostApiAuthLogoutApiArg
    >({
      query: () => ({ url: `/api/Auth/logout`, method: "POST" }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as authApi };
export type PostApiAuthTokenApiResponse = /** status 200 OK */ TokenResponseDto;
export type PostApiAuthTokenApiArg = {
  body: {
    grant_type?: string;
    username: string;
    password: string;
    scope?: string;
    client_id?: string;
    client_secret?: string;
  };
};
export type PostApiAuthRefreshApiResponse =
  /** status 200 OK */ TokenResponseDto;
export type PostApiAuthRefreshApiArg = void;
export type PostApiAuthLogoutApiResponse = unknown;
export type PostApiAuthLogoutApiArg = void;
export type TokenResponseDto = {
  access_token?: string | null;
  token_type?: string | null;
  expires_in?: number;
  scope?: string | null;
};
export const {
  usePostApiAuthTokenMutation,
  usePostApiAuthRefreshMutation,
  usePostApiAuthLogoutMutation,
} = injectedRtkApi;
