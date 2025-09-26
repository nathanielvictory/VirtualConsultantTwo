// useCreateMemoWithGoogleDoc.ts
import { useCallback } from "react";
import { createGoogleDocument } from "../integrations/google/docsApi/documents";
import { usePostApiMemosMutation, type MemoDetailDto } from "../api/memosApi";
import { useAppSelector } from "../store/hooks";
import type {DriveFile} from "../integrations/google/drive.ts";

type CreateArgs = {
    projectId: number;
    name: string | null;
};

type CreateResult = {
    memo: MemoDetailDto;
    driveFile: DriveFile;
};

export function useCreateMemoWithGoogleDoc() {
    const accessToken = useAppSelector((state) => state.googleAuth.accessToken);
    const [postMemo, postState] = usePostApiMemosMutation();

    const create = useCallback(
        async ({ projectId, name }: CreateArgs): Promise<CreateResult> => {
            if (!accessToken) {
                throw new Error("No Google access token available in store");
            }

            // 1) Create the Google Doc
            const title = name ?? "Untitled";
            const driveFile = await createGoogleDocument(accessToken, title);

            // 2) Create the memo pointing at the Doc
            const memo = await postMemo({
                createMemoDto: {
                    projectId,
                    name,
                    docId: driveFile.id
                },
            }).unwrap();

            return { memo, driveFile };
        },
        [accessToken, postMemo]
    );

    return {
        create,
        isLoading: postState.isLoading,
        isError: postState.isError,
        error: postState.error,
        reset: postState.reset,
        data: postState.data as MemoDetailDto | undefined,
    };
}
