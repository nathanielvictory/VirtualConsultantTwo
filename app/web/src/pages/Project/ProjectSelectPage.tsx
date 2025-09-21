// src/pages/ProjectSelectPage.tsx
import { Container, Paper, Typography, Box } from '@mui/material';
import ProjectStepper from './ProjectStepper';
import ProjectSelector from './components/ProjectSelector';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { setProjectId } from '../../store/selectedSlice';
import { useGetApiProjectsByIdQuery } from '../../api/projectsApi';

export default function ProjectSelectPage() {
    const dispatch = useDispatch();
    const projectId = useSelector((s: RootState) => s.selected.projectId);

    const { data: project, isFetching } = useGetApiProjectsByIdQuery({id: projectId as number}, {
        skip: projectId == null,
    });

    const currentName =
        projectId == null ? '—' : isFetching ? 'Loading…' : project?.name ?? String(projectId);

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <ProjectStepper active="select" />
            <Paper sx={{ p: 3 }}>
                <Typography variant="h5">Select a project</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Currently selected project: {currentName}
                </Typography>

                <Box sx={{ mt: 2 }}>
                    <ProjectSelector onSelect={(id) => dispatch(setProjectId(id))} />
                </Box>
            </Paper>
        </Container>
    );
}
