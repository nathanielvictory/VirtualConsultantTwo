// src/components/ChartOverlay/surveyMemo.ts
import type {
    Survey,
    SurveyQuestion,
    CrosstabQuestion,
    SurveyAnswer,
    CrosstabAnswer,
} from "../../types/survey";

export type Opt = { question_varname: string; question_text: string };

export type Grid = (string | number)[][];

export type ChartOverlaySelection =
    | { mode: "topline"; topline: SurveyQuestion | null }
    | { mode: "crosstab"; vertical: Opt | null; horizontal: Opt | null };

/** Safely returns the topline questions (empty array if missing). */
export const selectTopline = (survey: Survey): SurveyQuestion[] =>
    survey?.survey_topline ?? [];

/** Safely returns the crosstab questions (empty array if missing). */
export const selectCrosstabs = (survey: Survey): CrosstabQuestion[] =>
    survey?.survey_crosstab ?? [];

/** Unique vertical varnames + labels (stable order: first-seen). */
export const makeVerticalOptions = (crosstabs: CrosstabQuestion[]): Opt[] => {
    const seen = new Set<string>();
    const out: Opt[] = [];
    for (const ct of crosstabs) {
        if (!seen.has(ct.vertical_varname)) {
            seen.add(ct.vertical_varname);
            out.push({
                question_varname: ct.vertical_varname,
                question_text: ct.vertical_question,
            });
        }
    }
    return out;
};

/** Unique horizontal varnames + labels (stable order: first-seen). */
export const makeHorizontalOptions = (crosstabs: CrosstabQuestion[]): Opt[] => {
    const seen = new Set<string>();
    const out: Opt[] = [];
    for (const ct of crosstabs) {
        if (!seen.has(ct.horizontal_varname)) {
            seen.add(ct.horizontal_varname);
            out.push({
                question_varname: ct.horizontal_varname,
                question_text: ct.horizontal_question,
            });
        }
    }
    return out;
};

/**
 * Returns topline answers for a given question varname, or [] if not found.
 * By default filters out subtotal rows (is_subtotal === true).
 */
export const selectToplineAnswers = (
    survey: Survey,
    question_varname: string,
    opts?: { filter_subtotal?: boolean }
): SurveyAnswer[] => {
    const { filter_subtotal = true } = opts ?? {};
    const q = (survey?.survey_topline ?? []).find(
        (t) => t.question_varname === question_varname
    );
    if (!q) return [];
    const answers = q.survey_answers ?? [];
    return filter_subtotal ? answers.filter((a) => !a.is_subtotal) : answers;
};

/**
 * Returns crosstab answers for a given vertical + horizontal varname pair, or [] if not found.
 * By default filters out subtotal rows (where either subtotal flag is true).
 */
export const selectCrosstabAnswers = (
    survey: Survey,
    vertical_varname: string,
    horizontal_varname: string,
    opts?: { filter_subtotal?: boolean }
): CrosstabAnswer[] => {
    const { filter_subtotal = true } = opts ?? {};
    const ct = (survey?.survey_crosstab ?? []).find(
        (c) =>
            c.vertical_varname === vertical_varname &&
            c.horizontal_varname === horizontal_varname
    );
    if (!ct) return [];
    const answers = ct.crosstab_answers ?? [];
    return filter_subtotal
        ? answers.filter(
            (a) => !a.is_subtotal_vertical && !a.is_subtotal_horizontal
        )
        : answers;
};




export const getAnswerGrid = (
    survey: Survey,
    selection: ChartOverlaySelection,
    opts?: { filter_subtotal?: boolean; include_headers?: boolean }
): Grid => {
    const { filter_subtotal = true, include_headers = true } = opts ?? {};

    if (selection.mode === "topline") {
        const q = selection.topline;
        if (!q) return [];
        const answers = selectToplineAnswers(
            survey,
            q.question_varname,
            { filter_subtotal }
        );
        if (answers.length === 0) return [];

        const grid: Grid = [];
        if (include_headers) grid.push(["Answer", "Percentage"]);
        for (const a of answers) grid.push([a.answer_text, a.percentage]);
        return grid;
    }

    // crosstab
    const v = selection.vertical;
    const h = selection.horizontal;
    if (!v || !h) return [];

    const answers = selectCrosstabAnswers(
        survey,
        v.question_varname,
        h.question_varname,
        { filter_subtotal }
    );
    if (answers.length === 0) return [];

    // stable first-seen label lists
    const vLabels: string[] = [];
    const hLabels: string[] = [];
    const vSeen = new Set<string>();
    const hSeen = new Set<string>();
    for (const a of answers) {
        if (!vSeen.has(a.vertical_answer)) {
            vSeen.add(a.vertical_answer);
            vLabels.push(a.vertical_answer);
        }
        if (!hSeen.has(a.horizontal_answer)) {
            hSeen.add(a.horizontal_answer);
            hLabels.push(a.horizontal_answer);
        }
    }

    const key = (vv: string, hh: string) => `${vv}__${hh}`;
    const lookup = new Map<string, number>();
    for (const a of answers) {
        lookup.set(key(a.vertical_answer, a.horizontal_answer), a.percentage);
    }

    const grid: Grid = [];
    if (include_headers) grid.push(["", ...hLabels]);
    for (const vv of vLabels) {
        const row: (string | number)[] = [vv];
        for (const hh of hLabels) row.push(lookup.get(key(vv, hh)) ?? NaN);
        grid.push(row);
    }
    return grid;
};