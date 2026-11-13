export type ValidationStatus =
  | 'VERIFICADO'
  | 'VERIFICADO PARCIALMENTE'
  | 'NO DISPONIBLE'
  | 'NO VERIFICADO'
  | 'DESACTUALIZADO';

export type RefereeVeracityState =
  | 'VERIFIED'
  | 'PENDING_DESIGNATION'
  | 'NOT_ACCESSIBLE'
  | 'UNVERIFIED';

export interface SourceMeta {
  source: string;
  resourceId?: string;
  fetchedAt: string;
  dataDate?: string;
  status: ValidationStatus;
  note?: string;
}

export interface TeamStats {
  xG?: number | null;
  xGA?: number | null;
  possession?: number | null;
  shotsOnTarget?: number | null;
  cornersAvg?: number | null;
  cleanSheets?: number | null;
  goalsScoredAvg?: number | null;
  goalsConcededAvg?: number | null;
  form: ('W' | 'D' | 'L')[];
  tacticalStyle?: string;
  sampleSize?: number;
  isModelDerived?: boolean;
}

export interface DetailedMatchStats {
  shotsTotal?: [number, number];
  shotsOnTarget?: [number, number];
  shotsOffTarget?: [number, number];
  blockedShots?: [number, number];
  possession?: [number, number];
  passesTotal?: [number, number];
  passesCompleted?: [number, number];
  passAccuracy?: [number, number];
  fouls?: [number, number];
  yellowCards?: [number, number];
  redCards?: [number, number];
  offsides?: [number, number];
  corners?: [number, number];
  saves?: [number, number];
  xg?: [number, number] | null;
  source?: string;
}

export interface RefereeInfo {
  name: string;
  country?: string;
  league?: string;
  state?: RefereeVeracityState;
  matchesCount?: number | null;
  yellowAvg?: number | null;
  redTotal?: number | null;
  foulsAvg?: number | null;
  penaltiesAvg?: number | null;
  trendDescription?: string;
  sourceMeta?: SourceMeta;
}

export interface DataIntegrity {
  status: 'VERIFIED' | 'WARNING';
  validationStatus?: ValidationStatus;
  source: string;
  lastSync: string;
  discrepancyNote?: string;
}

export interface BookmakerOddDetail {
  bookmaker: 'Betano' | 'BetPlay';
  home: number;
  draw: number;
  away: number;
  over25: number;
  under25: number;
  bttsYes: number;
  bttsNo: number;
  cornersOver85?: number;
  cornersOver95?: number;
}

export interface MatchOdds {
  home: number;
  draw: number;
  away: number;
  over25: number;
  under25: number;
  bttsYes: number;
  bttsNo: number;
  cornersOver85?: number;
  cornersOver95?: number;
  provider?: string;
  hasRealOdds?: boolean;
  betano?: BookmakerOddDetail;
  betplay?: BookmakerOddDetail;
  homeMove?: 'up' | 'down' | 'stable';
  awayMove?: 'up' | 'down' | 'stable';
  bookmakers?: {
    name: string;
    home: number;
    draw: number;
    away: number;
    over25: number;
  }[];
}

export interface ModelProbabilities {
  homeWin: number | null;
  draw: number | null;
  awayWin: number | null;
  over15?: number | null;
  over25?: number | null;
  under25?: number | null;
  btts?: number | null;
  confidenceScore?: number;
  isModelEstimate?: boolean;
  predictedScore?: {
    home: number;
    away: number;
  };
  scoreMatrix?: {
    score: string;
    prob: number;
  }[];
}

export interface ValueBet {
  isDetected: boolean;
  market: string;
  selection: string;
  bookmakerOdd: number;
  fairOdd: number;
  expectedValue: number;
  edgeDescription: string;
  recommendedStakePct: number;
  isModelEstimate?: boolean;
  abstainReason?: string;
}

export interface VerifiedHistoricalMatch {
  eventId: string;
  date: string;
  dateFormatted: string;
  competition: string;
  season: string;
  isOfficial: boolean;
  homeTeamId: string;
  homeTeamName: string;
  awayTeamId: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  outcomeForTeam?: 'W' | 'D' | 'L';
  source: string;
}

export interface VerifiedAbsenceItem {
  playerName: string;
  type: 'injury' | 'suspension' | 'internationalDuty' | 'doubtful' | 'other';
  reasonLabel: string;
  expectedReturn?: string;
  source: string;
}

export interface SampleAggregateMetrics {
  sampleSize: number;
  wins: number;
  draws: number;
  losses: number;
  goalsForAvg: number | null;
  goalsAgainstAvg: number | null;
  over25Count: number;
  bttsCount: number;
  cleanSheets: number;
}

export interface VerifiedTeamSummary {
  teamId: string;
  teamName: string;
  standings?: {
    rank?: number;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
    groupName?: string;
    sourceMeta: SourceMeta;
  } | null;
  last5Overall: VerifiedHistoricalMatch[];
  last5Home: VerifiedHistoricalMatch[];
  last5Away: VerifiedHistoricalMatch[];
  restDays: number | null;
  overallMetrics: SampleAggregateMetrics;
  splitMetrics: SampleAggregateMetrics & { split: 'home' | 'away' };
  absences: {
    status: ValidationStatus;
    note: string;
    items: VerifiedAbsenceItem[];
    sourceMeta: SourceMeta;
  };
  sourceMeta: SourceMeta;
}

export interface VerifiedMatchDossier {
  identity: {
    eventId: string;
    leagueSlug: string;
    leagueName: string;
    leagueCode: string;
    season: string;
    kickoffUtc: string;
    kickoffCot: string;
    homeTeamId: string;
    homeTeamName: string;
    awayTeamId: string;
    awayTeamName: string;
    venue?: string;
    status: Match['status'];
    verified: boolean;
    fotmobMatchId?: string;
    sourceMeta: SourceMeta;
  };
  referee: RefereeInfo;
  home: VerifiedTeamSummary;
  away: VerifiedTeamSummary;
  h2h: {
    status: ValidationStatus;
    note: string;
    matches: VerifiedHistoricalMatch[];
    officialCount: number;
    friendlyCount: number;
    sourceMeta: SourceMeta;
  };
  officialMatchStats?: {
    status: ValidationStatus;
    sourceMeta: SourceMeta;
    stats?: DetailedMatchStats | null;
    hasXg: boolean;
    events?: Match['events'];
    rosters?: Match['rosters'];
    lineupConfirmed?: boolean;
  };
  modelEstimates: {
    isOfficial: false;
    disclaimer: string;
    sampleAdequate: boolean;
    sampleNote: string;
    homeWinProb: number | null;
    drawProb: number | null;
    awayWinProb: number | null;
    over25Prob: number | null;
    bttsProb: number | null;
    expectedGoalsHome: number | null;
    expectedGoalsAway: number | null;
    recommendedPick: {
      available: boolean;
      market?: string;
      marketCategory?: string;
      selection?: string;
      betanoOdd?: number;
      betplayOdd?: number;
      bookmakerOdd?: number;
      fairOdd?: number;
      expectedValue?: number;
      impliedProb?: number;
      rationale?: string;
      contextTag?: string;
      confidenceLabel?: string;
      abstainReason?: string;
    };
  };
}

export interface Match {
  id: string;
  league: string;
  leagueCode: string;
  leagueSlug?: string;
  round: string;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED' | 'SUSPENDED';
  minute?: number;
  homeScore?: number | null;
  awayScore?: number | null;
  kickoffTime: string;
  dateKey: string;
  dateFormatted: string;
  stadium: string;
  refereeInfo?: RefereeInfo;
  dataIntegrity: DataIntegrity;

  homeTeam: {
    id?: string;
    name: string;
    shortName: string;
    logo: string;
    rank?: number | null;
    record?: string;
    stats: TeamStats;
  };

  awayTeam: {
    id?: string;
    name: string;
    shortName: string;
    logo: string;
    rank?: number | null;
    record?: string;
    stats: TeamStats;
  };

  odds: MatchOdds;
  probabilities: ModelProbabilities;
  valueBet?: ValueBet;
  detailedStats?: DetailedMatchStats | null;

  tacticalPreview?: string;
  keyAbsences?: {
    home: string[];
    away: string[];
  };
  h2h?: {
    date: string;
    home: string;
    away: string;
    score: string;
    competition?: string;
    isOfficial?: boolean;
    winner: 'home' | 'away' | 'draw';
    source?: string;
  }[];
  events?: Array<{
    type: string;
    minute: string;
    text: string;
    team?: 'home' | 'away';
    player?: string;
    assist?: string;
    subIn?: string;
    subOut?: string;
  }>;
  rosters?: {
    confirmed?: boolean;
    formationHome?: string;
    formationAway?: string;
    coachHome?: string;
    coachAway?: string;
    home: Array<{ name: string; position: string; jersey: string; isCaptain?: boolean }>;
    away: Array<{ name: string; position: string; jersey: string; isCaptain?: boolean }>;
    benchHome?: Array<{ name: string; position: string; jersey: string }>;
    benchAway?: Array<{ name: string; position: string; jersey: string }>;
  };
  verifiedDossier?: VerifiedMatchDossier;
}

export interface PlayerProfile {
  id: string;
  name: string;
  team: string;
  league: string;
  position: string;
  number: number;
  photoUrl: string;
  matchesPlayed: number;
  goals: number;
  assists: number;
  goalsPer90: number;
  shotsPer90: number;
  shotsOnTargetPer90: number;
  foulsDrawnPer90: number;
  foulsCommittedPer90: number;
  yellowCards: number;
  redCards: number;
  offsidesPer90: number;
  passAccuracy: number;
  propsRadarTrend: string;
}

export interface BetSelection {
  id: string;
  matchId: string;
  matchTitle: string;
  league: string;
  marketName: string;
  selectionName: string;
  odd: number;
  modelProb: number;
  hasValue: boolean;
  expectedValue?: number;
}

export interface PlacedBet {
  id: string;
  date: string;
  type: 'SIMPLE' | 'PARLAY';
  selections: BetSelection[];
  totalOdds: number;
  stake: number;
  potentialPayout: number;
  status: 'PENDING' | 'WON' | 'LOST';
  simulatedScore?: string;
}

export interface FilterState {
  league: string;
  statusFilter: 'ALL' | 'LIVE' | 'SCHEDULED' | 'FINISHED';
  onlyValueBets: boolean;
  onlyHighConfidence: boolean;
  selectedDate: string;
  searchQuery: string;
}
