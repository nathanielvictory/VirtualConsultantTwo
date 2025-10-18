// src/components/ChartOverlay/ChartCreatorShell.tsx
import { Typography } from "@mui/material";
import { useAppSelector } from "../../store/hooks.ts";
import { useGetApiSlidedecksByIdQuery } from "../../api/slidedecksApi.ts";
import { type Grid } from "./surveyMemo.ts";
import ChartCreator from "./ChartCreator.tsx";

type Props = {
    type: "crosstab" | "topline";
    defaultTitle?: string;
    answerGrid: Grid;
}

export default function ChartCreatorShell({ type, answerGrid, defaultTitle }: Props) {
    const selectedSlidedeckId = useAppSelector(state => state.selected.slidedeckId);
    const accessToken = useAppSelector((s) => s.googleAuth.accessToken);

    const { data: slidedeck, isSuccess } = useGetApiSlidedecksByIdQuery({id: selectedSlidedeckId!}, {
        skip: !selectedSlidedeckId,
    });

    if (!selectedSlidedeckId) {
        return <Typography>Please select a slidedeck to get started.</Typography>;
    }

    if (!answerGrid || answerGrid.length == 0) {
        return <Typography>Please select some questions to get started.</Typography>;
    }

    if (!accessToken) {
        return <Typography>You must authenticate with google in the settings page to use this feature.</Typography>
    }

    if (isSuccess && slidedeck?.presentationId && slidedeck?.sheetsId) {
        return <ChartCreator
            googlePresentationId={slidedeck.presentationId}
            googleSheetId={slidedeck.sheetsId}
            answerGrid={answerGrid}
            type={type}
            defaultTitle={defaultTitle}
        />
    }

    return <Typography>No presentation or sheet ID found for the selected slidedeck.</Typography>;
}
