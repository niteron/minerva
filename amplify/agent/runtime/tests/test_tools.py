"""Unit tests for agent tools."""

import re
from datetime import datetime, timedelta, timezone

from tools.time_tool import get_current_time
from tools.calculator import simple_calculator


class TestGetCurrentTime:
    def test_returns_jst_time(self):
        result = get_current_time()
        assert "JST" in result

    def test_format_includes_year_month_day(self):
        result = get_current_time()
        # e.g. "Monday, April 7, 2026 15:30 JST"
        assert re.search(
            r"\b(January|February|March|April|May|June|July|August|September|October|November|December)\b \d{1,2}, \d{4}",
            result,
        )

    def test_format_includes_weekday(self):
        result = get_current_time()
        weekdays = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ]
        assert any(w in result for w in weekdays)

    def test_time_is_close_to_now(self):
        result = get_current_time()
        jst = timezone(timedelta(hours=9))
        now = datetime.now(jst)
        assert str(now.year) in result


class TestSimpleCalculator:
    def test_addition(self):
        result = simple_calculator("2 + 3")
        assert "= 5" in result

    def test_subtraction(self):
        result = simple_calculator("10 - 3")
        assert "= 7" in result

    def test_multiplication(self):
        result = simple_calculator("4 * 5")
        assert "= 20" in result

    def test_division(self):
        result = simple_calculator("10 / 2")
        assert "= 5" in result

    def test_float_division(self):
        result = simple_calculator("7 / 2")
        assert "= 3.5" in result

    def test_parentheses(self):
        result = simple_calculator("(2 + 3) * 4")
        assert "= 20" in result

    def test_decimal(self):
        result = simple_calculator("3.14 * 2")
        assert "= 6.28" in result

    def test_invalid_characters_rejected(self):
        result = simple_calculator("import os")
        assert "Error" in result

    def test_semicolon_rejected(self):
        result = simple_calculator("1; print('x')")
        assert "Error" in result

    def test_division_by_zero(self):
        result = simple_calculator("1 / 0")
        assert "Calculation error" in result

    def test_empty_expression(self):
        result = simple_calculator("")
        # Empty string raises SyntaxError from eval
        assert "Calculation error" in result
