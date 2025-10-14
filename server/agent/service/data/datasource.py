import re
from typing import Dict, List, Optional, Sequence, Tuple, Union, Iterable

import io
import json
import gzip
from logging import getLogger

from config import settings
from .s3_client import s3_client, get_survey_data_key

from service.slides.chartkit.models import AnswerOption, Question, Grid

from .mock_datasource import SurveyDataSource
from .models.survey import Survey, SurveyQuestion, CrosstabQuestion


class SurveyDataLoadError(Exception):
    def __init__(self, kbid: str, key_number: int, message: str = None):
        self.kbid = kbid
        self.key_number = key_number
        if message is None:
            message = f"Failed to load survey data for kbid={kbid}, key_number={key_number}"
        super().__init__(message)

def _download_survey_data(kbid, key_number):
    s3_key = get_survey_data_key(kbid, key_number)

    obj = s3_client.get_object(Bucket=settings.AWS_S3_BUCKET, Key=s3_key)
    with gzip.GzipFile(fileobj=io.BytesIO(obj["Body"].read())) as gz:
        survey_json = json.loads(gz.read().decode())

    return Survey.model_validate(survey_json)


def _canon(s: str) -> str:
    return re.sub(r"\s+", " ", s.strip().lower())

def _round_row(values: Iterable[float], *, decimals: int = 1) -> List[float]:
    """Round each value; preserve original magnitudes (no normalization)."""
    return [round(0.0 if v is None else float(v), decimals) for v in values]

def _filter_labels(candidates: Sequence[str], include: Optional[Sequence[str]]) -> List[str]:
    """
    Fuzzy-match `include` against `candidates` using the same canon rules as varnames.
    Keeps original candidate order; returns only the matched subset.
    """
    if not include:
        return list(candidates)
    wants = [_canon(s) for s in include]
    out: List[str] = []
    for c in candidates:
        cc = _canon(c)
        if any(w == cc or w in cc or cc in w for w in wants):
            out.append(c)
    return out


class ReportingSurveyDataSource(SurveyDataSource):
    """
    Real data-backed implementation using explicit varnames from Survey payload.

    Varname resolution:
      - First by exact/lenient match on SurveyQuestion.question_varname
      - Or by question_number if you pass 'Q17' or '17'
    Crosstab resolution:
      - Prefer (vertical_varname, horizontal_varname); auto-flip if reversed is found
    """

    def __init__(
        self,
        *,
        kbid: str,
        key_number: int,
        preloaded_survey: Optional[Survey] = None,
    ) -> None:
        self.logger = getLogger(__name__)
        self._kbid = kbid
        self._key_number = key_number
        try:
            self._survey: Survey = preloaded_survey or _download_survey_data(kbid, key_number)
            self._survey.remove_subtotals()
        except Exception as e:
            raise SurveyDataLoadError(kbid, key_number) from e

        self._topline_by_var: Dict[str, SurveyQuestion] = {
            _canon(q.question_varname): q for q in self._survey.survey_topline
        }
        self._crosstab_by_pair: Dict[Tuple[str, str], CrosstabQuestion] = {
            (_canon(ct.vertical_varname), _canon(ct.horizontal_varname)): ct
            for ct in self._survey.survey_crosstab
        }

    # ---------- resolution helpers ----------

    def _resolve_var_key(self, varname: str) -> str:
        """
        Canonicalize `varname` to the canonical key (case/space-insensitive)
        used in indices. Tries topline first, then crosstab varnames,
        then question number (Q17/17), then fuzzy contains over both.
        Returns the canonical key (i.e., `_canon(actual_varname)`).
        """
        key = _canon(varname)

        # 1) exact topline match
        if key in self._topline_by_var:
            return key

        # 2) exact crosstab varname match
        crosstab_keys = set()
        for vs, hs in self._crosstab_by_pair.keys():
            crosstab_keys.add(vs)
            crosstab_keys.add(hs)
        if key in crosstab_keys:
            return key

        is_question = re.compile(r'^[Qq]\d{1,2}')
        # 4) fuzzy contains over topline, then over crosstab varnames
        for k in self._topline_by_var.keys():
            if key == k or key in k or k in key:
                return k

            if is_question.search(key) and is_question.search(k):
                if is_question.search(key).group(0) == is_question.search(k).group(0):
                    return k

        for k in crosstab_keys:
            if key == k or key in k or k in key:
                return k


        raise KeyError(f"Unknown varname: {varname}")

    def _resolve_topline(self, varname: str) -> SurveyQuestion:
        k = self._resolve_var_key(varname)
        q = self._topline_by_var.get(k)
        if q is None:
            # If a crosstab-only varname was matched, there’s no topline to return.
            raise KeyError(f"No topline found for varname: {varname}")
        return q

    def _resolve_crosstab(self, varname: str, by_varname: str) -> Tuple[CrosstabQuestion, bool]:
        v = self._resolve_var_key(varname)
        h = self._resolve_var_key(by_varname)

        ct = self._crosstab_by_pair.get((v, h))
        if ct:
            return ct, False

        ct_rev = self._crosstab_by_pair.get((h, v))
        if ct_rev:
            return ct_rev, True

        # Soft fallback: contains-match over known pairs
        for (vs, hs), obj in self._crosstab_by_pair.items():
            if (v == vs or v in vs or vs in v) and (h == hs or h in hs or hs in h):
                return obj, False
            if (v == hs or v in hs or hs in v) and (h == vs or h in vs or vs in h):
                return obj, True

        raise KeyError(f"No crosstab for ({varname} BY {by_varname})")

    # ---------- interface ----------

    def get_question(self, varname: str) -> Question:
        q = self._resolve_topline(varname)
        answers = [AnswerOption(a.answer_text, a.answer_number) for a in q.survey_answers]
        return Question(
            question_text=q.question_text,
            question_number=q.question_number,
            varname=q.question_varname,
            answers=answers,
        )

    def get_topline(
            self,
            varname: str,
            *,
            include_values: Optional[Sequence[str]] = None,  # NEW
    ) -> Grid:
        """
        Returns raw (but rounded) values as provided by the payload.
        No normalization—rows need not sum to 100.
        """
        q = self._resolve_topline(varname)

        # Optionally filter answers via fuzzy matching (preserving topline order)
        answer_texts = [a.answer_text for a in q.survey_answers]
        keep_order = _filter_labels(answer_texts, include_values)
        if include_values:
            selected = [a for a in q.survey_answers if a.answer_text in set(keep_order)]
        else:
            selected = list(q.survey_answers)

        rounded_vals = _round_row([a.percentage for a in selected], decimals=1)

        headers = ["Answer", "Percentage"]
        rows = [[ans.answer_text, val] for ans, val in zip(selected, rounded_vals)]
        return Grid(headers=headers, rows=rows)

    def get_crosstab(
            self,
            varname: str,
            by_varname: str,
            *,
            include_by_values: Optional[Sequence[str]] = None,
    ) -> Grid:
        """
        Returns raw (but rounded) values as provided by the payload.
        No normalization—each BY row may or may not sum to 100.
        """
        ct, flipped = self._resolve_crosstab(varname, by_varname)

        # Use matched varnames for display
        display_var = ct.vertical_varname if not flipped else ct.horizontal_varname
        display_by = ct.horizontal_varname if not flipped else ct.vertical_varname

        # Build BY -> { VAR_ANSWER -> value } map from raw payload numbers
        from collections import defaultdict
        by_to_var: Dict[str, Dict[str, float]] = defaultdict(dict)

        for cell in ct.crosstab_answers:
            v_label, h_label = cell.vertical_answer, cell.horizontal_answer
            val = float(cell.percentage) if cell.percentage is not None else 0.0
            if not flipped:
                var_label, by_label = v_label, h_label
            else:
                var_label, by_label = h_label, v_label
            by_to_var[by_label][var_label] = val

        # Column order (VAR answers) from the matched var's topline if available
        try:
            var_topline = self._resolve_topline(display_var)
            var_values = [a.answer_text for a in var_topline.survey_answers]
        except Exception:
            # derive in first-seen order
            seen = set()
            var_values = []
            for m in by_to_var.values():
                for k in m.keys():
                    if k not in seen:
                        seen.add(k)
                        var_values.append(k)

        # Row order (BY values) from the matched BY var's topline if available; then fuzzy-filter
        try:
            by_topline = self._resolve_topline(display_by)
            by_values = [a.answer_text for a in by_topline.survey_answers]
        except Exception:
            by_values = list(by_to_var.keys())

        # Fuzzy filter BY values with shared matcher
        by_values = _filter_labels(by_values, include_by_values)

        # Build rows (rounded only; no normalization)
        headers = [display_by] + var_values
        rows: List[List[Union[str, float]]] = []
        for by_val in by_values:
            row_vals = [by_to_var.get(by_val, {}).get(col, 0.0) for col in var_values]
            rounded = _round_row(row_vals, decimals=1)
            rows.append([by_val] + rounded)

        return Grid(headers=headers, rows=rows)

    # ---------- text helpers ----------

    def topline_text(self, varname: str, *, decimals: int = 1) -> str:
        q = self.get_question(varname)
        grid = self.get_topline(varname)
        lines = [f"Shortened Name: {q.varname}", f"Question Text: {q.question_text}"]
        for answer_text, val in grid.rows:
            lines.append(f"{answer_text} {val:.{decimals}f}")
        return "\n".join(lines)

    def all_toplines_text(self, *, decimals: int = 1) -> str:
        blocks = [self.topline_text(q.question_varname, decimals=decimals)
                  for q in self._survey.survey_topline]
        return "\n\n".join(blocks)

    def all_question_text(self) -> str:
        all_questions = ""
        for question in self._survey.survey_topline:
            all_questions += ("Shortened Name: " + question.question_varname + '\n' + "Question Text: " + question.question_text )
            all_questions += '\n\n'
        return all_questions


    def crosstab_text(
            self,
            varname: str,
            by_varname: str,
            *,
            decimals: int = 1,
    ) -> str:
        # Get matched names for the title line
        ct, flipped = self._resolve_crosstab(varname, by_varname)
        display_var = ct.vertical_varname if not flipped else ct.horizontal_varname
        display_by = ct.horizontal_varname if not flipped else ct.vertical_varname

        grid = self.get_crosstab(varname, by_varname)
        headers = [str(h) for h in grid.headers]

        # Token-light text: no symbols, no percent signs
        lines = [f"{display_var} BY {display_by}", " ".join(headers)]
        for row in grid.rows:
            by_value = str(row[0])
            nums = [f"{float(x):.{decimals}f}" for x in row[1:]]
            lines.append(" ".join([by_value] + nums))
        return "\n".join(lines)
