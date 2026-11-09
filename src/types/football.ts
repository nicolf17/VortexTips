export interface TeamStats {
  xG: number;
  xGA: number;
  possession: number;
  shotsOnTarget: number;
  cornersAvg: number;
  cleanSheets: number;
  goalsScoredAvg: number;
  goalsConcededAvg: number;
  form: ('W' | 'D' | 'L')[];
  tacticalStyle: string;
}

export interface DetailedMatchStats {
  shotsTotal: [number, number];
  shotsOnTarget: [number, number];
  shotsOffTarget: [number, number];
  blockedShots: [number, number];
  possession: [number, number]; // in percentage e.g. [58, 42]
  passesTotal: [number, number];
  passesCompleted: [number, number];
  passAccuracy: [number, number]; // percentage e.g. [87, 81]
  fouls: [number, number];
  yellowCards: [number, number];
  redCards: [number, number];
  offsides: [number, number];
  corners: [number, number];
  saves: [number, number];
  xg: [number, number];
}

export interface RefereeInfo {
  name: string;
  country: string;
  matchesCount: number;
  yellowAvg: number; // e.g. 5.4 amarillas/partido
  redTotal: number;
  foulsAvg: number;  // e.g. 24.2 faltas/partido
  penaltiesAvg: number; // e.g. 0.38 penaltis/partido
  trendDescription: string;
}

export interface DataIntegrity {
  status: 'VERIFIED' | 'WARNING';
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
  homeWin: number;
  draw: number;
  awayWin: number;
  over15: number;
  over25: number;
  under25: number;
  btts: number;
  confidenceScore: number;
  predictedScore: {
    home: number;
    away: number;
  };
  scoreMatrix: {
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
}

export interface Match {
  id: string;
  league: string;
  leagueCode: string;
  leagueSlug?: string;
  round: string;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  minute?: number;
  homeScore?: number;
  awayScore?: number;
  kickoffTime: string;
  dateKey: string;
  dateFormatted: string;
  stadium: string;
  refereeInfo?: RefereeInfo;
  dataIntegrity: DataIntegrity;
  
  homeTeam: {
    name: string;
    shortName: string;
    logo: string;
    rank: number;
    stats: TeamStats;
  };
  
  awayTeam: {
    name: string;
    shortName: string;
    logo: string;
    rank: number;
    stats: TeamStats;
  };

  odds: MatchOdds;
  probabilities: ModelProbabilities;
  valueBet: ValueBet;
  detailedStats: DetailedMatchStats;
  
  tacticalPreview: string;
  keyAbsences: {
    home: string[];
    away: string[];
  };
  h2h?: {
    date: string;
    home: string;
    away: string;
    score: string;
    winner: 'home' | 'away' | 'draw';
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
    formationHome?: string;
    formationAway?: string;
    coachHome?: string;
    coachAway?: string;
    home: Array<{ name: string; position: string; jersey: string; isCaptain?: boolean }>;
    away: Array<{ name: string; position: string; jersey: string; isCaptain?: boolean }>;
    benchHome?: Array<{ name: string; position: string; jersey: string }>;
    benchAway?: Array<{ name: string; position: string; jersey: string }>;
  };
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
  selectedDate: string; // e.g. '19 Oct'
  searchQuery: string;
}
