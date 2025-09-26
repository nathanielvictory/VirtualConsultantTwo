// src/components/ProgressBar.tsx
import * as React from "react";
import { LinearProgress, Box } from "@mui/material";

type ProgressBarProps = {
    /** Target progress percentage (0–100) */
    progress: number;
    /** Optional: mark task complete to finish to 100% gracefully */
    done?: boolean;
    /** Optional height in px for a slightly thicker bar */
    height?: number;
    /** Accessible label */
    ariaLabel?: string;
    speed?: {
        minPps?: number;
        maxPps?: number;
        baseIdlePps?: number;
        idleHalfLifeMs?: number;
        emaRateAlpha?: number;
        emaJitterAlpha?: number;
        underrunFactor?: number;
        minTrust?: number;
        maxTrust?: number;
        minDurationMs?: number;
        finishDurationMs?: number;
    };
};

/**
 * Adaptive progress bar.
 * - Learns real-world cadence, crawls when idle.
 * - If progress jumps to 99, treat as complete → sweep to 100 immediately.
 */
export default function TaskProgressBar({
                                            progress,
                                            done = false,
                                            height = 4,
                                            ariaLabel = "Task progress",
                                            speed,
                                        }: ProgressBarProps) {
    const {
        minPps = 0.12,
        maxPps = 10,
        baseIdlePps = 0.25,
        idleHalfLifeMs = 12000,
        emaRateAlpha = 0.35,
        emaJitterAlpha = 0.25,
        underrunFactor = 0.9,
        minTrust = 0.15,
        maxTrust = 0.95,
        minDurationMs = 450,
        finishDurationMs = 700,
    } = speed || {};

    // ---- NEW: normalize progress ----
    // If backend says 99 → treat as done (100).
    const normalized = progress === 99 ? 100 : progress;
    const target = Math.max(0, Math.min(100, done ? 100 : normalized));

    const [displayValue, setDisplayValue] = React.useState<number>(() => target);

    const rafRef = React.useRef<number | null>(null);
    const lastIncomingValueRef = React.useRef<number>(target);
    const lastIncomingTsRef = React.useRef<number>(performance.now());
    const emaRateRef = React.useRef<number>(baseIdlePps);
    const emaJitterRef = React.useRef<number>(0);
    const lastObsRateRef = React.useRef<number>(baseIdlePps);
    const lastUpdateTsRef = React.useRef<number>(performance.now());

    const clamp = (v: number, lo: number, hi: number) =>
        Math.max(lo, Math.min(hi, v));

    React.useEffect(() => {
        const now = performance.now();

        // --- If normalized == 100, just snap/animate to 100 quickly ---
        if (target === 100) {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            setDisplayValue(100);
            return;
        }

        // --- otherwise use adaptive animation as before ---
        const prevVal = lastIncomingValueRef.current;
        const prevTs = lastIncomingTsRef.current;
        if (target !== prevVal) {
            const dtSec = Math.max(0.001, (now - prevTs) / 1000);
            const obsRate = Math.abs((target - prevVal) / dtSec);

            const nextRateEma =
                (1 - emaRateAlpha) * emaRateRef.current + emaRateAlpha * obsRate;
            emaRateRef.current = nextRateEma;

            const accel = Math.abs(obsRate - lastObsRateRef.current);
            emaJitterRef.current =
                (1 - emaJitterAlpha) * emaJitterRef.current + emaJitterAlpha * accel;
            lastObsRateRef.current = obsRate;

            lastIncomingValueRef.current = target;
            lastIncomingTsRef.current = now;
            lastUpdateTsRef.current = now;
        }

        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }

        const startValue = displayValue;
        const delta = target - startValue;
        if (delta === 0) return;

        const sinceLastUpdateMs = now - lastUpdateTsRef.current;
        const decay = Math.pow(0.5, sinceLastUpdateMs / idleHalfLifeMs);
        const decayedIdlePps = baseIdlePps * (0.5 + 0.5 * decay);

        const jitter = emaJitterRef.current;
        const jitterScore = 1 / (1 + 6 * jitter);
        const recencyScore = 1 / (1 + sinceLastUpdateMs / 4000);
        let trust = clamp(jitterScore * recencyScore, minTrust, maxTrust);

        const observedPps = emaRateRef.current * underrunFactor;
        let blendedPps =
            trust * observedPps + (1 - trust) * decayedIdlePps;
        blendedPps = clamp(blendedPps, minPps, maxPps);

        const durationMs = done
            ? finishDurationMs
            : Math.max(minDurationMs, (Math.abs(delta) / blendedPps) * 1000);

        const startTime = now;
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

        const step = (ts: number) => {
            const t = Math.min(1, (ts - startTime) / durationMs);
            const eased = easeOutCubic(t);
            setDisplayValue(startValue + delta * eased);

            if (t < 1) {
                rafRef.current = requestAnimationFrame(step);
            } else {
                setDisplayValue(target);
                rafRef.current = null;
            }
        };

        rafRef.current = requestAnimationFrame(step);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target, done]);

    return (
        <Box role="progressbar" aria-label={ariaLabel}>
            <LinearProgress
                variant="determinate"
                value={displayValue}
                sx={{ height, borderRadius: 999 }}
            />
        </Box>
    );
}
