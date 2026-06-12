// ─────────────────────────────────────────────
//  AthleteIQ — Response Parser
//  Parses and validates Claude's JSON output
// ─────────────────────────────────────────────

import { SponsorRecommendation, DealType } from '../types';

const VALID_DEAL_TYPES: DealType[] = ['ambassador', 'campaign', 'product-collab', 'event'];

// ── Single item validator ─────────────────────────
function validateRecommendation(item: unknown): item is SponsorRecommendation {
  if (!item || typeof item !== 'object') return false;

  const r = item as Record<string, unknown>;

  return (
    typeof r.rank === 'number' &&
    typeof r.brandCategory === 'string' && r.brandCategory.trim().length > 0 &&
    typeof r.brandName === 'string' && r.brandName.trim().length > 0 &&
    typeof r.matchScore === 'number' && r.matchScore >= 0 && r.matchScore <= 100 &&
    typeof r.reasoning === 'string' && r.reasoning.trim().length > 0 &&
    typeof r.audienceOverlap === 'string' && r.audienceOverlap.trim().length > 0 &&
    typeof r.pitchAngle === 'string' && r.pitchAngle.trim().length > 0 &&
    typeof r.dealType === 'string' && VALID_DEAL_TYPES.includes(r.dealType as DealType)
  );
}

// ── Main parser ───────────────────────────────────
export function parseSponsorResponse(text: string): SponsorRecommendation[] {
  // Strip markdown code fences if Claude wrapped the response
  const cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  let parsed: unknown;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Try to extract a JSON array from within the text as a fallback
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        parsed = JSON.parse(match[0]);
      } catch {
        throw new Error('AI response could not be parsed as JSON. Please try again.');
      }
    } else {
      // Last resort: try to find a JSON object and wrap it
      const objMatch = cleaned.match(/\{[\s\S]*"rank"[\s\S]*\}/);
      if (objMatch) {
        try {
          parsed = [JSON.parse(objMatch[0])];
        } catch {
          throw new Error('AI response did not contain valid JSON. Please try again.');
        }
      } else {
        throw new Error('AI response did not contain valid JSON. Please try again.');
      }
    }
  }

  if (!Array.isArray(parsed)) {
    throw new Error('AI response was not a JSON array as expected.');
  }

  const valid = parsed.filter(validateRecommendation);

  if (valid.length === 0) {
    throw new Error('AI returned no valid sponsor recommendations. Please try again.');
  }

  // Sort by matchScore descending (defensive — Claude should already sort)
  return valid.sort((a, b) => b.matchScore - a.matchScore);
}

// ── Match score → colour helper (used by SponsorCard) ──
export function scoreToColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
  if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-gray-500 bg-gray-50 border-gray-200';
}

export function scoreLabel(score: number): string {
  if (score >= 80) return 'Excellent Fit';
  if (score >= 60) return 'Good Fit';
  return 'Possible Fit';
}

// ── Deal type badge colour ────────────────────────
export function dealTypeColor(dealType: DealType): string {
  const map: Record<DealType, string> = {
    ambassador: 'bg-blue-100 text-blue-700',
    campaign: 'bg-purple-100 text-purple-700',
    'product-collab': 'bg-orange-100 text-orange-700',
    event: 'bg-teal-100 text-teal-700',
  };
  return map[dealType] ?? 'bg-gray-100 text-gray-600';
}
