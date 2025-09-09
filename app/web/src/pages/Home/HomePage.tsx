import {
    Container,
    Box,
    Typography,
    Paper,
    Button,
    Chip,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Divider,
} from "@mui/material";
import {
    Home as HomeIcon,
    Dashboard as DashboardIcon,
    Settings as SettingsIcon,
    BarChart as BarChartIcon,
    CloudUpload,
    PlayCircle,
    Tune,
    AutoAwesome,
} from "@mui/icons-material";
import StatCard, { type SparkPoint } from "../../components/StatCard.tsx";
import {
    ResponsiveContainer,
    LineChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip as ReTooltip,
    Line,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { chartData } from "../../data/chartData.ts";

const sparkA: SparkPoint[] = [{ v: 6 }, { v: 9 }, { v: 7 }, { v: 12 }, { v: 10 }, { v: 14 }, { v: 16 }];
const sparkB: SparkPoint[] = [{ v: 2 }, { v: 3 }, { v: 4 }, { v: 6 }, { v: 5 }, { v: 7 }, { v: 8 }];
const sparkC: SparkPoint[] = [{ v: 12 }, { v: 10 }, { v: 14 }, { v: 13 }, { v: 15 }, { v: 16 }, { v: 18 }];
const sparkD: SparkPoint[] = [{ v: 60 }, { v: 58 }, { v: 61 }, { v: 63 }, { v: 62 }, { v: 64 }, { v: 66 }];

const usage = [
    { name: "Research", value: 45 },
    { name: "Ops", value: 25 },
    { name: "Sales", value: 18 },
    { name: "Support", value: 12 },
];

export default function HomePage() {
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Hero / banner */}
            <Paper
                sx={{
                    p: 3,
                    mb: 3,
                    background: (t) =>
                        t.palette.mode === "light"
                            ? "linear-gradient(135deg,#fff, #F7F8FA)"
                            : "linear-gradient(135deg,#101826,#0B0F19)",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        background: (t) =>
                            t.palette.mode === "light"
                                ? "radial-gradient(600px 200px at 0% 0%, rgba(225,29,46,.06), transparent 70%)"
                                : "radial-gradient(600px 200px at 0% 0%, rgba(240,82,82,.2), transparent 70%)",
                        pointerEvents: "none",
                    }}
                />
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                    <Typography variant="h4" fontWeight={800} sx={{ flex: 1, minWidth: 260 }}>
                        Virtual Consultant overview
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Button startIcon={<PlayCircle />} variant="contained">
                            Start consultation
                        </Button>
                        <Button startIcon={<CloudUpload />} variant="outlined">
                            Upload dataset
                        </Button>
                        <Button startIcon={<Tune />} variant="text">
                            Configure
                        </Button>
                    </Box>
                </Box>
                <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip size="small" icon={<AutoAwesome />} label="Smart prompts enabled" />
                    <Chip size="small" label="Safety: Strict" />
                    <Chip size="small" label="Latency target: 200ms" />
                </Box>
            </Paper>

            {/* KPI row (flex wrap, no Grid nor CSS grid) */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                <Box sx={{ flex: "1 1 260px", minWidth: 260 }}>
                    <StatCard title="Active users" value="2,413" icon={<HomeIcon />} sparkData={sparkA} trend="up" delta="+12%" />
                </Box>
                <Box sx={{ flex: "1 1 260px", minWidth: 260 }}>
                    <StatCard title="Conversions" value="384" icon={<BarChartIcon />} sparkData={sparkB} trend="up" delta="+5.2%" />
                </Box>
                <Box sx={{ flex: "1 1 260px", minWidth: 260 }}>
                    <StatCard title="Avg. session" value="3m 12s" icon={<DashboardIcon />} sparkData={sparkC} trend="up" delta="+9s" />
                </Box>
                <Box sx={{ flex: "1 1 260px", minWidth: 260 }}>
                    <StatCard title="NPS" value="62" icon={<SettingsIcon />} sparkData={sparkD} trend="down" delta="-1" />
                </Box>
            </Box>

            {/* Two-column layout via flex (no Grid) */}
            <Box
                sx={{
                    mt: 2,
                    display: "flex",
                    flexDirection: { xs: "column", lg: "row" },
                    gap: 2,
                }}
            >
                {/* Left column */}
                <Box sx={{ flex: 2, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            Weekly activity
                        </Typography>
                        <Box sx={{ height: 280 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <ReTooltip />
                                    <Line type="monotone" dataKey="value" strokeWidth={3} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>

                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            Recent activity
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemAvatar>
                                    <Avatar>VC</Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary='Ran consultation "Customer churn Q3"'
                                    secondary="2h ago · 1.2k tokens · Success"
                                />
                            </ListItem>
                            <Divider component="li" />
                            <ListItem>
                                <ListItemAvatar>
                                    <Avatar>
                                        <CloudUpload />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary="Uploaded dataset retail_churn.csv"
                                    secondary="Yesterday · 45MB"
                                />
                            </ListItem>
                            <Divider component="li" />
                            <ListItem>
                                <ListItemAvatar>
                                    <Avatar>
                                        <Tune />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary='Updated prompt template for "Retention insights"'
                                    secondary="2 days ago"
                                />
                            </ListItem>
                        </List>
                    </Paper>
                </Box>

                {/* Right column */}
                <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            Usage by team
                        </Typography>
                        <Box sx={{ height: 260 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={usage}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={4}
                                    >
                                        {usage.map((_, i) => (
                                            <Cell key={i} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>

                    <Paper
                        sx={{
                            p: 2,
                            background: (t) =>
                                t.palette.mode === "light"
                                    ? "linear-gradient(135deg, #fff 0%, #FDECEC 100%)"
                                    : "linear-gradient(135deg, #171a23 0%, #25141A 100%)",
                        }}
                    >
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            Assistant tips
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 1 }}>
                            Improve results with these prompts:
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemAvatar>
                                    <Avatar>
                                        <AutoAwesome />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary='"Explain the top 3 drivers of churn in plain English"' />
                            </ListItem>
                            <ListItem>
                                <ListItemAvatar>
                                    <Avatar>
                                        <AutoAwesome />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary='"Simulate impact of a 10% discount on conversion by segment"' />
                            </ListItem>
                        </List>
                        <Button fullWidth variant="contained" startIcon={<PlayCircle />}>
                            Open Assistant
                        </Button>
                    </Paper>
                </Box>
            </Box>
        </Container>
    );
}