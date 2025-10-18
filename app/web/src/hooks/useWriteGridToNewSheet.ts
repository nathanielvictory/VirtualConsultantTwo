// src/hooks/useWriteGridToNewSheet.ts
import { useCallback, useState } from "react";
import { useAppSelector } from "../store/hooks";
import {
    writeGridToNewSheet,
    type Grid,
    type WriteGridResult,
} from "../integrations/google/sheetsApi/writeGrid";

type WriteArgs = {
    spreadsheetId: string;
    grid: Grid;
    title?: string;
};

export function useWriteGridToNewSheet() {
    const accessToken = useAppSelector((s) => s.googleAuth.accessToken);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);
    const [data, setData] = useState<WriteGridResult | null>(null);

    const write = useCallback(
        async ({ spreadsheetId, grid, title }: WriteArgs): Promise<WriteGridResult> => {
            if (!accessToken) {
                throw new Error("No Google access token available in store");
            }
            setIsLoading(true);
            setError(null);
            try {
                const result = await writeGridToNewSheet(accessToken, spreadsheetId, grid, {
                    title
                });
                setData(result);
                return result;
            } catch (e) {
                setError(e);
                throw e;
            } finally {
                setIsLoading(false);
            }
        },
        [accessToken]
    );

    const reset = useCallback(() => {
        setError(null);
        setData(null);
    }, []);

    return {
        write,
        isLoading,
        isError: Boolean(error),
        error,
        data: data ?? undefined,
        reset,
    };
}
