// useCreateSlidedeckWithGoogleAssets.ts
import { useCallback } from "react";
import { createGooglePresentation } from "../integrations/google/slidesApi/presentations";
import { createGoogleSpreadsheet } from "../integrations/google/sheetsApi/spreadsheets";
import { usePostApiSlidedecksMutation, type SlidedeckDetailDto } from "../api/slidedecksApi";
import { useAppSelector } from "../store/hooks";
import type { DriveFile } from "../integrations/google/drive";

/**
 * Creates a Google Slides presentation and a Google Sheet, then creates a Slidedeck
 * in the app pointing at those Drive file IDs.
 *
 * Parity with useCreateMemoWithGoogleDoc, but for decks + sheets.
 */

type CreateArgs = {
    projectId: number;
    name: string | null;
};

type CreateResult = {
    slidedeck: SlidedeckDetailDto;
    presentationFile: DriveFile;
    sheetFile: DriveFile;
};

export function useCreateSlidedeckWithGoogleAssets() {
    const accessToken = useAppSelector((state) => state.googleAuth.accessToken);
    const [postSlidedeck, postState] = usePostApiSlidedecksMutation();

    const create = useCallback(
        async ({ projectId, name }: CreateArgs): Promise<CreateResult> => {
            if (!accessToken) {
                throw new Error("No Google access token available in store");
            }

            // 1) Create the Google Slides presentation
            const title = name ?? "Untitled";
            const presentationFile = await createGooglePresentation(accessToken, title);

            // 2) Create the Google Sheet (commonly used for data tables/figures)
            const sheetTitle = `${title} Data`;
            const sheetFile = await createGoogleSpreadsheet(accessToken, sheetTitle);

            // 3) Create the slidedeck pointing at the Slides + Sheets file IDs
            const slidedeck = await postSlidedeck({
                createSlidedeckDto: {
                    projectId,
                    name,
                    presentationId: presentationFile.id,
                    sheetsId: sheetFile.id,
                },
            }).unwrap();

            return { slidedeck, presentationFile, sheetFile };
        },
        [accessToken, postSlidedeck]
    );

    return {
        create,
        isLoading: postState.isLoading,
        isError: postState.isError,
        error: postState.error,
        reset: postState.reset,
        data: postState.data as SlidedeckDetailDto | undefined,
    };
}
