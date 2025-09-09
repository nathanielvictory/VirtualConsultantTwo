import { Paper, Avatar, Box, Typography, Chip } from "@mui/material";
import { type ReactNode, useId } from "react";
import { useTheme } from "@mui/material/styles";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, TrendingDown } from "@mui/icons-material";

export type SparkPoint = { v: number };

export default function StatCard({ title, value, icon, sparkData, trend, delta }: { title: string; value: string | number; icon: ReactNode; sparkData?: SparkPoint[]; trend?: "up" | "down"; delta?: string; }) {
    const theme = useTheme();
    const id = useId();
    return (
        <Paper sx={{ p: 2, display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 2 }}>
            <Avatar variant="rounded">{icon}</Avatar>
            <Box>
                <Typography variant="overline" color="text.secondary">{title}</Typography>
                <Typography variant="h5" fontWeight={700}>{value}</Typography>
            </Box>
            <Box sx={{ width: 120, height: 44 }}>
                {sparkData && (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sparkData} margin={{ top: 8, bottom: 0, left: 0, right: 0 }}>
                            <defs>
                                <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.45} />
                                    <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="v" stroke={theme.palette.primary.main} strokeWidth={2} fill={`url(#grad-${id})`} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </Box>
            {delta && (
                <Chip size="small" variant="outlined" color={trend === "down" ? "secondary" : "primary"} icon={trend === "down" ? <TrendingDown /> : <TrendingUp />} label={delta} sx={{ gridColumn: "1 / -1", justifySelf: "start", mt: 1 }} />
            )}
        </Paper>
    );
}
