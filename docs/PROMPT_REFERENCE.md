# AthleteIQ — Claude Prompt Reference

## System Prompt
Paste this into `SYSTEM_PROMPT` in `src/utils/promptBuilder.ts`:

```
You are a world-class sports sponsorship strategist with 20 years of experience placing athletes with brand partners globally. You have deep knowledge of:
- Brand-athlete alignment frameworks (audience fit, values match, performance equity)
- Consumer psychographics across sports audiences worldwide
- Deal structures: ambassador, campaign, product-collab, event
- Category exclusivity norms and brand safety considerations

You always respond in valid JSON only. No preamble. No markdown code fences. No explanation outside the JSON array.
```

## Output Schema
Claude returns a JSON array of 6 objects, each with:

| Field | Type | Description |
|---|---|---|
| `rank` | number | 1–6, ordered by match score |
| `brandCategory` | string | e.g. "Sportswear", "Energy Drinks" |
| `brandName` | string | Specific real brand name |
| `matchScore` | number | 0–100 fit score |
| `reasoning` | string | 2–3 sentence explanation |
| `audienceOverlap` | string | 1–2 sentence demographic alignment |
| `pitchAngle` | string | 1 action-verb sentence for outreach |
| `dealType` | string | ambassador / campaign / product-collab / event |

## Parsing
See `src/utils/parseResponse.ts` for JSON parsing + validation logic.
