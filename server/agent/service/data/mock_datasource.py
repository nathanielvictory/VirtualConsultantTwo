from typing import Dict, List, Optional, Sequence, Union
from abc import ABC, abstractmethod

from service.slides.chartkit.models import AnswerOption, Question, Grid

class SurveyDataSource(ABC):
    """Interface to back with your real survey API later."""

    @abstractmethod
    def get_question(self, varname: str) -> Question: ...

    @abstractmethod
    def get_topline(
        self,
        varname: str,
        *,
        filters: Optional[Dict[str, Union[str, Sequence[str]]]] = None,
        percent_base: str = "total",
    ) -> Grid: ...

    @abstractmethod
    def get_crosstab(
        self,
        varname: str,
        by_varname: str,
        *,
        include_by_values: Optional[Sequence[str]] = None,
        filters: Optional[Dict[str, Union[str, Sequence[str]]]] = None,
        percent_base: str = "row",
    ) -> Grid: ...


# ------------------------------
# Deterministic MOCK implementation
# ------------------------------

class MockSurveyData(SurveyDataSource):
    _QUESTIONS: Dict[str, Question] = {
        "GENDER": Question(
            question_text="Gender", question_number=100, varname="GENDER",
            answers=[AnswerOption("Male", 1), AnswerOption("Female", 2)]
        ),
        "TRUMP_IMAGE": Question(
            question_text="Trump Image", question_number=200, varname="TRUMP_IMAGE",
            answers=[
                AnswerOption("Favorable", 1),
                AnswerOption("Unfavorable", 2),
                AnswerOption("No opinion", 3),
            ],
        ),
        "BIDEN_IMAGE": Question(
            question_text="Biden Image", question_number=201, varname="BIDEN_IMAGE",
            answers=[
                AnswerOption("Favorable", 1),
                AnswerOption("Unfavorable", 2),
                AnswerOption("No opinion", 3),
            ],
        ),
        "Q1_DIRECTION": Question(
            question_text="Q1 Do you agree with the direction the state is headed in?",
            question_number=1,
            varname="Q1_DIRECTION",
            answers=[
                AnswerOption("Right Direction", 1),
                AnswerOption("Wrong Track", 2),
                AnswerOption("Don’t know", 3),
            ],
        ),
    }

    # ---------- helpers ----------
    @staticmethod
    def _normalize_fraction_row(values: List[float], decimals: int = 4) -> List[float]:
        """
        Normalize a list of raw values into fractions summing to 1.0,
        rounded to `decimals`. Adjust the last element to fix drift.
        """
        if not values:
            return []
        total = sum(values)
        if total <= 0:
            return [0.0] * len(values)

        fractions = [v / total for v in values]
        rounded = [round(v, decimals) for v in fractions[:-1]]
        tail = round(1.0 - sum(rounded), decimals)
        return rounded + [tail]

    def get_question(self, varname: str) -> Question:
        try:
            return self._QUESTIONS[varname]
        except KeyError:
            raise KeyError(f"Unknown varname: {varname}")

    def get_topline(
        self,
        varname: str,
        *,
        filters: Optional[Dict[str, Union[str, Sequence[str]]]] = None,  # ignored in mock
        percent_base: str = "total",  # ignored in mock
    ) -> Grid:
        """
        Return only normalized fractions by answer.
        Headers: ["Answer", "Percentage"].
        """
        q = self.get_question(varname)

        # deterministic pseudo-distribution by varname
        seed = sum(ord(c) for c in varname) % 11 + 3
        raw: List[float] = []
        rem = 100.0
        for i, _ in enumerate(q.answers):
            if i < len(q.answers) - 1:
                pct = (seed * (i + 2)) % 37 + 20.0
                pct = min(pct, rem - 5.0)
                raw.append(pct)
                rem -= pct
            else:
                raw.append(rem)

        fractions = self._normalize_fraction_row(raw, decimals=4)

        headers = ["Answer", "Percentage"]
        rows = [[ans.answer_text, frac] for ans, frac in zip(q.answers, fractions)]
        return Grid(headers=headers, rows=rows)

    def get_crosstab(
        self,
        varname: str,
        by_varname: str,
        *,
        include_by_values: Optional[Sequence[str]] = None,
        filters: Optional[Dict[str, Union[str, Sequence[str]]]] = None,  # ignored in mock
        percent_base: str = "row",  # ignored in mock
    ) -> Grid:
        """
        Return normalized fraction rows by `by_varname`.
        Headers: [BY, <answers...>] with fractional values.
        """
        q = self.get_question(varname)
        by_q = self.get_question(by_varname)

        by_values = [a.answer_text for a in by_q.answers]
        if include_by_values:
            keep = set(include_by_values)
            by_values = [v for v in by_values if v in keep]

        headers = [by_q.varname] + [a.answer_text for a in q.answers]
        rows: List[List[Union[str, float]]] = []

        for by in by_values:
            if by == "Male":
                base = {
                    "TRUMP_IMAGE": [55.0, 38.0, 7.0],
                    "BIDEN_IMAGE": [42.0, 50.0, 8.0],
                    "Q1_DIRECTION": [47.0, 46.0, 7.0],
                }.get(varname, [50.0, 45.0, 5.0])
            elif by == "Female":
                base = {
                    "TRUMP_IMAGE": [49.0, 44.0, 7.0],
                    "BIDEN_IMAGE": [48.0, 44.0, 8.0],
                    "Q1_DIRECTION": [45.0, 48.0, 7.0],
                }.get(varname, [50.0, 45.0, 5.0])
            else:
                base = [50.0, 45.0, 5.0]

            # Adjust to answer count
            if len(base) != len(q.answers):
                each = 1.0 / len(q.answers)
                base = [each] * len(q.answers)

            fractions = self._normalize_fraction_row(base, decimals=4)
            rows.append([by] + fractions)

        return Grid(headers=headers, rows=rows)
