import { Match, VerifiedMatchDossier } from '../types/football';

export interface AnalysisResponse {
  analysis: string;
  isGeneratedByAI: boolean;
  warning?: string;
}

export interface SmartParlayResponse {
  recommendation: string;
  isGeneratedByAI: boolean;
}

export interface RealMatchesApiResponse {
  success: boolean;
  count: number;
  source: string;
  timestamp: string;
  matches: Match[];
}

const clientDossierCache = new Map<string, VerifiedMatchDossier>();

export async function fetchLiveFootballMatches(dateStr?: string): Promise<Match[]> {
  try {
    const url = dateStr ? `/api/football/real-matches?date=${dateStr}` : '/api/football/real-matches';
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network error');
    const data = await response.json();
    if (data.matches && Array.isArray(data.matches)) {
      return data.matches.map((raw: any) => {
        const hasRealOdds = Boolean(raw.odds?.hasRealOdds && raw.odds?.home > 0);
        const hOdd = hasRealOdds ? raw.odds.home : 0;
        const dOdd = hasRealOdds ? raw.odds.draw : 0;
        const aOdd = hasRealOdds ? raw.odds.away : 0;
        const o25Odd = hasRealOdds ? raw.odds.over25 : 0;

        return {
          id: raw.id,
          league: raw.league,
          leagueCode: raw.leagueCode,
          leagueSlug: raw.leagueSlug,
          round: raw.round || 'Jornada',
          status: raw.status || 'SCHEDULED',
          minute: raw.minute,
          homeScore: raw.homeTeam?.score ?? null,
          awayScore: raw.awayTeam?.score ?? null,
          kickoffTime: raw.timeDisplay || 'Por confirmar',
          dateKey: raw.dateKey || '',
          dateFormatted: raw.dateFormatted || '',
          stadium: raw.stadium || 'Estadio por confirmar',
          refereeInfo: raw.refereeInfo || undefined,
          dataIntegrity: {
            status: 'VERIFIED' as const,
            validationStatus: 'VERIFICADO' as const,
            source: 'ESPN Live Scoreboards',
            lastSync: data.timestamp || new Date().toISOString(),
          },
          homeTeam: {
            id: raw.homeTeam?.id ? String(raw.homeTeam.id) : undefined,
            name: raw.homeTeam?.name || 'Local',
            shortName: raw.homeTeam?.shortName || 'LOC',
            logo: raw.homeTeam?.logo || '',
            rank: null,
            record: raw.homeTeam?.record,
            stats: {
              xG: raw.detailedStats?.xg?.[0] ?? null,
              xGA: raw.detailedStats?.xg?.[1] ?? null,
              possession: raw.detailedStats?.possession?.[0] ?? null,
              shotsOnTarget: raw.detailedStats?.shotsOnTarget?.[0] ?? null,
              cornersAvg: raw.detailedStats?.corners?.[0] ?? null,
              cleanSheets: null,
              goalsScoredAvg: null,
              goalsConcededAvg: null,
              form: Array.isArray(raw.homeTeam?.form) ? raw.homeTeam.form : [],
              isModelDerived: false,
            },
          },
          awayTeam: {
            id: raw.awayTeam?.id ? String(raw.awayTeam.id) : undefined,
            name: raw.awayTeam?.name || 'Visitante',
            shortName: raw.awayTeam?.shortName || 'VIS',
            logo: raw.awayTeam?.logo || '',
            rank: null,
            record: raw.awayTeam?.record,
            stats: {
              xG: raw.detailedStats?.xg?.[1] ?? null,
              xGA: raw.detailedStats?.xg?.[0] ?? null,
              possession: raw.detailedStats?.possession?.[1] ?? null,
              shotsOnTarget: raw.detailedStats?.shotsOnTarget?.[1] ?? null,
              cornersAvg: raw.detailedStats?.corners?.[1] ?? null,
              cleanSheets: null,
              goalsScoredAvg: null,
              goalsConcededAvg: null,
              form: Array.isArray(raw.awayTeam?.form) ? raw.awayTeam.form : [],
              isModelDerived: false,
            },
          },
          odds: {
            home: hOdd,
            draw: dOdd,
            away: aOdd,
            over25: o25Odd,
            under25: hasRealOdds ? raw.odds.under25 : 0,
            bttsYes: hasRealOdds ? raw.odds.bttsYes : 0,
            bttsNo: hasRealOdds ? raw.odds.bttsNo : 0,
            cornersOver85: raw.odds?.cornersOver85,
            provider: raw.odds?.provider || (hasRealOdds ? 'ESPN Odds' : 'Sin cuota publicada'),
            hasRealOdds,
            betano: raw.odds?.betano,
            betplay: raw.odds?.betplay,
            homeMove: 'stable',
            awayMove: 'stable',
            bookmakers: hasRealOdds
              ? [
                  {
                    name: 'Betano',
                    home: raw.odds?.betano?.home || hOdd,
                    draw: raw.odds?.betano?.draw || dOdd,
                    away: raw.odds?.betano?.away || aOdd,
                    over25: raw.odds?.betano?.over25 || o25Odd,
                  },
                  {
                    name: 'BetPlay',
                    home: raw.odds?.betplay?.home || hOdd,
                    draw: raw.odds?.betplay?.draw || dOdd,
                    away: raw.odds?.betplay?.away || aOdd,
                    over25: raw.odds?.betplay?.over25 || o25Odd,
                  },
                ]
              : [],
          },
          probabilities: {
            homeWin: hasRealOdds && hOdd > 0 ? Math.round((1 / hOdd) * 90) : null,
            draw: hasRealOdds && dOdd > 0 ? Math.round((1 / dOdd) * 90) : null,
            awayWin: hasRealOdds && aOdd > 0 ? Math.round((1 / aOdd) * 90) : null,
            over25: hasRealOdds && o25Odd > 0 ? Math.round((1 / o25Odd) * 90) : null,
            isModelEstimate: true,
          },
          detailedStats: raw.detailedStats || null,
          events: raw.events || [],
          rosters: raw.rosters,
        };
      });
    }
    return [];
  } catch (err) {
    console.error('Error in fetchLiveFootballMatches:', err);
    return [];
  }
}

export async function fetchMatchSummary(leagueSlug: string, eventId: string) {
  try {
    const res = await fetch(
      `/api/football/match-summary?leagueSlug=${encodeURIComponent(leagueSlug)}&eventId=${encodeURIComponent(eventId)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.summary;
  } catch (err) {
    console.error('Error fetching match summary:', err);
    return null;
  }
}

export async function fetchMatchDossier(match: Match): Promise<VerifiedMatchDossier | null> {
  if (!match?.id || !match?.leagueSlug) return null;
  const key = `${match.leagueSlug}_${match.id}`;
  const cached = clientDossierCache.get(key);
  if (cached) return cached;

  try {
    const res = await fetch('/api/football/match-dossier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leagueSlug: match.leagueSlug,
        eventId: match.id,
        homeTeamId: match.homeTeam?.id,
        awayTeamId: match.awayTeam?.id,
        odds: match.odds,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.dossier) {
      clientDossierCache.set(key, data.dossier);
      return data.dossier as VerifiedMatchDossier;
    }
    return null;
  } catch (err) {
    console.error('Error fetching match dossier:', err);
    return null;
  }
}

export async function fetchRadarDossiers(
  matches: Match[]
): Promise<Record<string, VerifiedMatchDossier>> {
  const result: Record<string, VerifiedMatchDossier> = {};
  const toFetch: Match[] = [];

  for (const m of matches.slice(0, 4)) {
    if (!m.leagueSlug) continue;
    const key = `${m.leagueSlug}_${m.id}`;
    const cached = clientDossierCache.get(key);
    if (cached) {
      result[m.id] = cached;
    } else {
      toFetch.push(m);
    }
  }

  if (toFetch.length === 0) return result;

  try {
    const res = await fetch('/api/football/radar-dossiers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matches: toFetch.map((m) => ({
          id: m.id,
          leagueSlug: m.leagueSlug,
          homeTeamId: m.homeTeam?.id,
          awayTeamId: m.awayTeam?.id,
          odds: m.odds,
        })),
      }),
    });
    if (!res.ok) return result;
    const data = await res.json();
    if (data?.dossiers) {
      for (const [id, dossier] of Object.entries(data.dossiers)) {
        const d = dossier as VerifiedMatchDossier;
        if (d?.identity?.leagueSlug) {
          clientDossierCache.set(`${d.identity.leagueSlug}_${id}`, d);
        }
        result[id] = d;
      }
    }
    return result;
  } catch (err) {
    console.error('Error fetching radar dossiers:', err);
    return result;
  }
}

export async function requestMatchAnalysis(
  match: Match,
  queryType: 'general' | 'goals' | 'monte-carlo' | 'value-hunt' = 'general'
): Promise<AnalysisResponse> {
  const dossier = match.verifiedDossier;
  const response = await fetch('/api/gemini/analyze-match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      match: {
        id: match.id,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        league: match.league,
        status: match.status,
        odds: match.odds,
        probabilities: {
          home: dossier?.modelEstimates?.homeWinProb ?? match.probabilities.homeWin,
          draw: dossier?.modelEstimates?.drawProb ?? match.probabilities.draw,
          away: dossier?.modelEstimates?.awayWinProb ?? match.probabilities.awayWin,
        },
        stats: {
          homeXg: dossier?.modelEstimates?.expectedGoalsHome ?? match.homeTeam.stats.xG,
          awayXg: dossier?.modelEstimates?.expectedGoalsAway ?? match.awayTeam.stats.xG,
          homeForm: match.homeTeam.stats.form.join('-'),
          awayForm: match.awayTeam.stats.form.join('-'),
        },
        recommendedBet: dossier?.modelEstimates?.recommendedPick?.available
          ? {
              market: dossier.modelEstimates.recommendedPick.market,
              odds: dossier.modelEstimates.recommendedPick.bookmakerOdd,
              expectedValue: `${dossier.modelEstimates.recommendedPick.expectedValue}%`,
            }
          : undefined,
        tacticalKey: dossier?.h2h?.note || match.tacticalPreview,
      },
      queryType,
    }),
  });

  if (!response.ok) {
    throw new Error('Error al conectar con el servidor de análisis');
  }

  return response.json();
}

export async function requestSmartParlay(
  matches: Match[],
  riskLevel: 'conservador' | 'moderado' | 'alto-rendimiento',
  targetOdds: number
): Promise<SmartParlayResponse> {
  const payload = matches.map((m) => ({
    id: m.id,
    homeTeam: m.homeTeam.name,
    awayTeam: m.awayTeam.name,
    league: m.league,
    odds: {
      home: m.odds.home,
      draw: m.odds.draw,
      away: m.odds.away,
      over25: m.odds.over25,
      btts: m.odds.bttsYes,
    },
    probabilities: {
      home: m.probabilities.homeWin,
      draw: m.probabilities.draw,
      away: m.probabilities.awayWin,
    },
    stats: {
      homeXg: m.homeTeam.stats.xG,
      awayXg: m.awayTeam.stats.xG,
    },
    recommendedBet: m.valueBet
      ? {
          market: m.valueBet.market,
          odds: m.valueBet.bookmakerOdd,
          expectedValue: `+${m.valueBet.expectedValue}%`,
        }
      : undefined,
  }));

  const response = await fetch('/api/gemini/smart-parlay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      matches: payload,
      riskLevel,
      targetOdds,
    }),
  });

  if (!response.ok) {
    throw new Error('Error al generar la combinada');
  }

  return response.json();
}
