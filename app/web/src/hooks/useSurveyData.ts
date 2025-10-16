import { useAppSelector } from '../store/hooks';
import { selectProjectId } from '../store/selectedSlice';
import { useGetApiTasksQuery, useGetApiTasksByIdQuery } from '../api/tasksApi';
import { type Survey } from '../types/survey';

export function useSurveyData() {
    const projectId = useAppSelector(selectProjectId);

    const { data: tasksData, isLoading: areTasksLoading, isError: areTasksError } = useGetApiTasksQuery({
        projectId: projectId!,
        type: 'SurveyData',
        status: 'Succeeded',
    }, {
        skip: !projectId,
    });

    const surveyTask = tasksData?.items?.[0];
    const surveyTaskId = surveyTask?.id;

    const { data: singleTaskData, isLoading: isSingleTaskLoading, isError: isSingleTaskError } = useGetApiTasksByIdQuery(
        {id: surveyTaskId!},
        {
            skip: !surveyTaskId,
        }
    );

    const surveyData = singleTaskData?.artifacts?.[0]?.payload as Survey | undefined;

    return {
        surveyData,
        isLoading: areTasksLoading || isSingleTaskLoading,
        isError: areTasksError || isSingleTaskError,
    };
}
