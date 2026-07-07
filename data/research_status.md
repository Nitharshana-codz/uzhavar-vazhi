# Research Verification Tracker

Use this tracker before marking any farmer-facing data as verified. Keep `last_verified` inside each JSON file in sync with this table.

| Dataset | Primary Source | Status | Notes |
| --- | --- | --- | --- |
| Districts | TNAU Agritech Portal; Tamil Nadu Agriculture Department | Pending | Verify Tamil names, agro-climatic zone, rainfall, soil types, and major crops. |
| Crops | TNAU Agritech Portal | Pending | Verify seasons, soil, water requirement, irrigation, pests, and diseases. |
| MSP | CACP; Department of Agriculture and Farmers Welfare | Pending | Verify MSP by crop and marketing season every year. |
| KCC | Department of Agriculture and Farmers Welfare; RBI | Pending | Verify interest rate, collateral rules, repayment, eligibility, and documents. |
| PMFBY | PMFBY Official Portal | Pending | Verify premium, eligible crops, enrollment process, claims, and coverage. |
| NABARD | NABARD | Pending | Verify loan types, refinance details, supported banks, eligibility, and purpose. |
| Banks | District Central Cooperative Bank websites; State Cooperative Department | Pending | Verify bank address, phone, website, latitude, and longitude. |
| Weather | IMD | Pending | Store historical averages only; live weather should come from an API. |
| Tamil Terms | TNAU Agritech Portal | Pending | Prefer official agricultural Tamil terminology over literal translations. |

## Verification Rules

1. Use government, university, regulator, or official scheme portals as primary sources.
2. Do not mark a file as verified unless every farmer-facing value in that file has been checked.
3. Put the verification date in `metadata.last_verified` using `YYYY-MM-DD`.
4. Change `metadata.verification_status` to `verified` only after source checking.
5. If only some fields are checked, keep the status as `partially_verified` and mention the remaining fields in `metadata.notes`.
