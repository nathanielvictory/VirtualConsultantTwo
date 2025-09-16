import { Box, Step, StepLabel, Stepper } from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";

const steps = [
    { key: "overview", label: "Overview", to: (id: string) => `/projects/${id}` },
    { key: "import", label: "Import", to: (id: string) => `/projects/${id}/import` },
    { key: "insights", label: "Insights", to: (id: string) => `/projects/${id}/insights` },
    { key: "memo", label: "Memo", to: (id: string) => `/projects/${id}/memo` },
    { key: "slides", label: "Slides", to: (id: string) => `/projects/${id}/slides` },
];

export default function ProjectStepper({ active }: { active: string }) {
    const { id = "vc-001" } = useParams();
    const activeIndex = steps.findIndex((s) => s.key === active);
    return (
        <Box sx={{ px: { xs: 1, md: 2 }, py: 1.5 }}>
            <Stepper activeStep={activeIndex} alternativeLabel>
                {steps.map((s) => (
                    <Step key={s.key}>
                        <StepLabel slotProps={{ label: { component: RouterLink, to: s.to(id) } as any }}>{s.label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
        </Box>
    );
}