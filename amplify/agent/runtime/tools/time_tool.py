"""Current time tool (Japan Standard Time)."""

from datetime import datetime, timedelta, timezone

from strands import tool

_WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
_MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
]


@tool
def get_current_time() -> str:
    """Return the current date and time in Japan Standard Time (JST).

    Returns:
        Human-readable JST timestamp string.
    """
    jst = timezone(timedelta(hours=9))
    now = datetime.now(jst)
    weekday = _WEEKDAYS[now.weekday()]
    month = _MONTHS[now.month - 1]
    return f"{weekday}, {month} {now.day}, {now.year} {now.strftime('%H:%M')} JST"
