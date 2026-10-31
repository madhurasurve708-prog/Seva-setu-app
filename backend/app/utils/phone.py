import re


def normalize_phone_number(raw_phone: str) -> str:
    """
    Safely normalizes an input phone number.
    Strips whitespace, hyphens, dots, parentheses.
    Handles standard Indian prefixes:
      - '+91' or '0091'
      - Leading trunk '0' when 11 digits
      - Leading '91' when 12 digits
    Does not guess or silently truncate arbitrary international numbers.
    """
    if not raw_phone:
        return ""
    cleaned = re.sub(r"[\s\-\(\)\.]", "", str(raw_phone).strip())
    if cleaned.startswith("+91"):
        cleaned = cleaned[3:]
    elif cleaned.startswith("0091"):
        cleaned = cleaned[4:]
    elif cleaned.startswith("0") and len(cleaned) == 11 and cleaned[1:].isdigit():
        cleaned = cleaned[1:]
    elif cleaned.startswith("91") and len(cleaned) == 12 and cleaned[2:].isdigit():
        cleaned = cleaned[2:]
    return cleaned

