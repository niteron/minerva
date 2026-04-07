"""Simple arithmetic calculator tool."""

from strands import tool


@tool
def simple_calculator(expression: str) -> str:
    """Evaluate a basic arithmetic expression (add, subtract, multiply, divide).

    Args:
        expression: Arithmetic expression, e.g. "2 + 3" or "10 * 5".

    Returns:
        String with the expression and result, or an error message.
    """
    allowed_chars = set("0123456789+-*/.() ")
    if not all(c in allowed_chars for c in expression):
        return "Error: expression contains disallowed characters"
    try:
        result = eval(expression)  # noqa: S307
        return f"{expression} = {result}"
    except Exception as e:
        return f"Calculation error: {e}"
