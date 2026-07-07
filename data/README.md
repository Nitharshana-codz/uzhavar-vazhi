# Data Directory

This folder stores project data as small JSON records. IDs are used as references between files so the app can load only the records it needs and migrate to a real database later.

## Layout

- `districts/`: district profiles and references to crop, scheme, and bank IDs.
- `crops/`: crop profiles with climate requirements.
- `schemes/`: loan, insurance, and support scheme details.
- `banks/`: district-wise bank records.
- `documents/`: reusable document records referenced by schemes.
- `translations/`: UI translation dictionaries.
- `msp/`: season-wise minimum support price data.
- `weather_rules/`: crop suitability rules for recommendation logic.
- `metadata/`: source notes for research traceability.

## Example Flow

When a farmer selects Coimbatore:

1. Load `districts/coimbatore.json`.
2. Use `major_crops` to load files from `crops/`.
3. Use `available_schemes` to load files from `schemes/`.
4. Use `banks` or the district slug to load `banks/coimbatore.json`.

Keep new IDs lowercase with underscores, such as `tn_interest_free_crop_loan`.
