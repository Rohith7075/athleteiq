// ─────────────────────────────────────────────
//  AthleteIQ — Type Definitions
//  All shared TypeScript interfaces live here
// ─────────────────────────────────────────────

export type SportType =
  | 'football'
  | 'basketball'
  | 'tennis'
  | 'cricket'
  | 'formula1'
  | 'golf'
  | 'swimming'
  | 'athletics'
  | 'boxing'
  | 'cycling'
  | 'other';

export type CareerStage = 'emerging' | 'established' | 'elite';

export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook';

export type DealType = 'ambassador' | 'campaign' | 'product-collab' | 'event';

export type InterestTag =
  | 'fitness'
  | 'fashion'
  | 'gaming'
  | 'travel'
  | 'finance'
  | 'food'
  | 'technology'
  | 'music'
  | 'lifestyle'
  | 'health'
  | 'education'
  | 'automotive';

// ── Athlete ─────────────────────────────────────

export interface AthleteProfile {
  name: string;
  sport: SportType;
  stats: Record<string, number | string>;
  followerCount: number;
  primaryPlatform: SocialPlatform;
  careerStage: CareerStage;
  geographicBase: string; // ISO country code e.g. "IN", "US"
}

// ── Audience ─────────────────────────────────────

export interface AgeDistribution {
  '13-17': number;
  '18-24': number;
  '25-34': number;
  '35-44': number;
  '45+': number;
}

export interface GenderSplit {
  male: number;
  female: number;
  other: number;
}

export interface AudienceProfile {
  ageDistribution: AgeDistribution;
  genderSplit: GenderSplit;
  topGeographies: string[]; // up to 3 country names
  interestTags: InterestTag[];
  engagementRate: number; // percentage e.g. 4.2
}

// ── AI Output ────────────────────────────────────

export interface SponsorRecommendation {
  rank: number;
  brandCategory: string;
  brandName: string;
  matchScore: number; // 0–100
  reasoning: string;
  audienceOverlap: string;
  pitchAngle: string;
  dealType: DealType;
}

// ── API Request / Response ───────────────────────

export interface MatchRequest {
  athlete: AthleteProfile;
  audience: AudienceProfile;
}

export interface MatchResponse {
  recommendations: SponsorRecommendation[];
  generatedAt: string;
  tokenUsage: number;
}

// ── UI State ─────────────────────────────────────

export type AppStep = 'athlete' | 'audience' | 'results';

export interface AppState {
  step: AppStep;
  athlete: AthleteProfile | null;
  audience: AudienceProfile | null;
  results: SponsorRecommendation[] | null;
  loading: boolean;
  error: string | null;
}
