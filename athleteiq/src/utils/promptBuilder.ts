// ─────────────────────────────────────────────
//  AthleteIQ — Prompt Builder
//  Constructs the Claude API prompt from form data
// ─────────────────────────────────────────────

import { AthleteProfile, AudienceProfile } from '../types';

// ── System Prompt ────────────────────────────────
export const SYSTEM_PROMPT = `You are a world-class sports sponsorship strategist with 20 years of experience placing athletes with brand partners globally. You have deep knowledge of:
- Brand-athlete alignment frameworks (audience fit, values match, performance equity)
- Consumer psychographics across sports audiences worldwide
- Deal structures: ambassador, campaign, product-collab, event
- Category exclusivity norms and brand safety considerations
- Global brand portfolios and their target demographics

You always respond in valid JSON only. No preamble. No markdown code fences. No explanation outside the JSON array.`;

// ── Sport-specific stat labels ────────────────────
const SPORT_STAT_LABELS: Record<string, string[]> = {
  football: ['Goals', 'Assists', 'Matches Played', 'Pass Accuracy %'],
  basketball: ['Points Per Game', 'Rebounds', 'Assists', 'Field Goal %'],
  tennis: ['World Ranking', 'Win Rate %', 'Grand Slams Won', 'Titles This Year'],
  cricket: ['Batting Average', 'Runs Scored', 'Wickets', 'Matches'],
  formula1: ['Championship Position', 'Race Wins', 'Podiums', 'Points'],
  golf: ['World Ranking', 'Wins This Season', 'Average Score', 'Majors Won'],
  swimming: ['World Ranking', 'Olympic Medals', 'World Records', 'Best Time'],
  athletics: ['World Ranking', 'Personal Best', 'Medals', 'Season Wins'],
  boxing: ['Win Record', 'KO Rate %', 'Current Ranking', 'Title Belts'],
  cycling: ['Tour Wins', 'Stage Wins', 'World Ranking', 'Season Points'],
  other: ['Primary Stat', 'Secondary Stat', 'Ranking', 'Achievements'],
};

export function getStatsForSport(sport: string): string[] {
  return SPORT_STAT_LABELS[sport] ?? SPORT_STAT_LABELS.other;
}

// ── Main Prompt Builder ───────────────────────────
export function buildPrompt(
  athlete: AthleteProfile,
  audience: AudienceProfile
): string {
  const ageDist = audience.ageDistribution || {};
  const ageLines = Object.keys(ageDist).length > 0
    ? Object.entries(ageDist)
        .map(([range, pct]) => `  ${range}: ${pct}%`)
        .join('\n')
    : '  Not specified';

  const gender = audience.genderSplit || { male: 0, female: 0, other: 0 };
  const genderLines = `  Male: ${gender.male}%\n  Female: ${gender.female}%\n  Other: ${gender.other}%`;

  const followerFormatted =
    (athlete.followerCount || 0) >= 1_000_000
      ? `${((athlete.followerCount || 0) / 1_000_000).toFixed(1)}M`
      : (athlete.followerCount || 0) >= 1_000
      ? `${((athlete.followerCount || 0) / 1_000).toFixed(0)}K`
      : `${athlete.followerCount || 0}`;

  const athleteStats = athlete.stats || {};
  const statsLines = Object.keys(athleteStats).length > 0
    ? Object.entries(athleteStats)
        .map(([key, val]) => `  ${key}: ${val}`)
        .join('\n')
    : '  Not specified';

  return `Analyze this athlete and their audience, then recommend the 6 best-fit sponsor brands.

== ATHLETE ==
Name: ${athlete.name}
Sport: ${athlete.sport.charAt(0).toUpperCase() + athlete.sport.slice(1)}
Career Stage: ${athlete.careerStage.charAt(0).toUpperCase() + athlete.careerStage.slice(1)}
Geographic Base: ${athlete.geographicBase}
Primary Platform: ${athlete.primaryPlatform} | Followers: ${followerFormatted}
Performance Stats:
${statsLines}

== AUDIENCE ==
Age Distribution:
${ageLines}
Gender Split:
${genderLines}
Top Geographies: ${audience.topGeographies.join(', ')}
Interest Tags: ${audience.interestTags.join(', ')}
Engagement Rate: ${audience.engagementRate}%

== INSTRUCTIONS ==
Return a JSON array of exactly 6 objects. Each object must have these exact keys:
  rank          (number 1–6)
  brandCategory (string — e.g. "Sportswear", "Energy Drinks", "Fintech")
  brandName     (string — specific real brand name, not generic)
  matchScore    (number 0–100)
  reasoning     (string — 2–3 sentences explaining the fit)
  audienceOverlap (string — 1–2 sentences on demographic alignment)
  pitchAngle    (string — 1 sentence starting with an action verb)
  dealType      ("ambassador" | "campaign" | "product-collab" | "event")

Order by matchScore descending. Be specific with real brand names. Prioritize authentic fit over aspirational fit. Consider the athlete's career stage when matching brand tier.`;
}
