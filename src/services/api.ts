import {
  Match,
  VerifiedHistoricalMatch,
  VerifiedMatchDossier,
  VerifiedTeamSummary,
} from '../types/football';

export const UNAVAILABLE_DATA_MESSAGE = 'Información no disponible';

export interface MatchDataValidationResult {
  isValid: boolean;
  status: 'VERIFICADO' | 'NO DISPONIBLE';
  message: string;
  reasons: string[];
}

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

const PLACEHOLDER_IDS = new Set([
  '',
  '0',
  'null',
  'undefined',
  'nan',
  'n/d',
  'nd',
  'tbd',
  'unknown',
  'none',
]);

function normalizeId(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function isValidEntityId(value: string | number | null | undefined): boolean {
  const id = normalizeId(value);
  if (!id || PLACEHOLDER_IDS.has(id.toLowerCase())) return false;
  return /^[a-zA-Z0-9_-]{1,64}$/.test(id);
}

function isValidDateKey(value?: string | null): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;

  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() + 1 === month &&
    parsed.getUTCDate() === day
  );
}

function isValidTimestamp(value?: string | null): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'Por confirmar' || trimmed === UNAVAILABLE_DATA_MESSAGE) return false;
  // Require date-like structure (not bare integers or random words)
  if (!/\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(trimmed) && !trimmed.includes('GMT') && !trimmed.includes('UTC')) {
    return false;
  }
  const ts = Date.parse(trimmed);
  return !Number.isNaN(ts) && ts > Date.UTC(1990, 0, 1) && ts < Date.UTC(2100, 0, 1);
}

function toBogotaDateKey(isoUtc: string): string | null {
  const ts = Date.parse(isoUtc);
  if (Number.isNaN(ts)) return null;
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(ts));
  } catch {
    return null;
  }
}

function areDatesCoherent(matchDateKey?: string, dossierKickoffUtc?: string): boolean {
  if (!isValidTimestamp(dossierKickoffUtc)) return false;
  if (!isValidDateKey(matchDateKey)) return true;

  const expectedKey = matchDateKey!.trim();
  const dossierCotKey = toBogotaDateKey(dossierKickoffUtc!);
  if (!dossierCotKey || !isValidDateKey(dossierCotKey)) return false;

  if (dossierCotKey === expectedKey) return true;

  // Allow at most +/- 1 day tolerance for UTC midnight / late reschedule shifts
  const expectedTs = Date.parse(`${expectedKey}T12:00:00Z`);
  const actualTs = Date.parse(`${dossierCotKey}T12:00:00Z`);
  const diffDays = Math.abs(actualTs - expectedTs) / (1000 * 60 * 60 * 24);
  return diffDays <= 1;
}

/**
 * Validación estricta previa al procesamiento de cualquier dato de partido:
 * comprueba existencia y validez formal de eventId, IDs de equipo local/visitante y fecha real.
 * Si algún dato no es verificable, retorna explícitamente status 'NO DISPONIBLE' y 'Información no disponible'.
 */
export function validateMatchIdentifiers(match?: Match | null): MatchDataValidationResult {
  const reasons: string[] = [];

  if (!match) {
    return {
      isValid: false,
      status: 'NO DISPONIBLE',
      message: UNAVAILABLE_DATA_MESSAGE,
      reasons: ['Objeto de partido ausente.'],
    };
  }

  const eventId = normalizeId(match.id);
  const homeId = normalizeId(match.homeTeam?.id);
  const awayId = normalizeId(match.awayTeam?.id);
  const hasValidDate = isValidDateKey(match.dateKey) || isValidTimestamp(match.kickoffTime);

  if (!isValidEntityId(eventId)) reasons.push('eventId ausente o inválido');
  if (!isValidEntityId(homeId)) reasons.push('homeTeam.id ausente o inválido');
  if (!isValidEntityId(awayId)) reasons.push('awayTeam.id ausente o inválido');
  if (homeId && awayId && homeId === awayId) {
    reasons.push('IDs de equipo local y visitante duplicados');
  }
  if (!hasValidDate) reasons.push('fecha oficial ausente o inválida');

  if (reasons.length > 0) {
    return {
      isValid: false,
      status: 'NO DISPONIBLE',
      message: UNAVAILABLE_DATA_MESSAGE,
      reasons,
    };
  }

  return {
    isValid: true,
    status: 'VERIFICADO',
    message: 'Identificadores y fecha válidos',
    reasons: [],
  };
}

/**
 * Función de validación estricta unificada para entradas sueltas o estructuradas
 * (eventId, homeTeamId, awayTeamId, date/dateKey y opcionalmente dossier).
 */
export function validateStrictMatchData(input?: {
  match?: Match | null;
  eventId?: string | number | null;
  homeTeamId?: string | number | null;
  awayTeamId?: string | number | null;
  date?: string | null;
  dateKey?: string | null;
  dossier?: VerifiedMatchDossier | null;
}): {
  isValid: boolean;
  status: 'VERIFICADO' | 'NO DISPONIBLE';
  message: string;
  reasons: string[];
  dossier: VerifiedMatchDossier | null;
} {
  if (!input) {
    return {
      isValid: false,
      status: 'NO DISPONIBLE',
      message: UNAVAILABLE_DATA_MESSAGE,
      reasons: ['Datos del partido ausentes.'],
      dossier: null,
    };
  }

  if (input.match) {
    if (input.dossier !== undefined) {
      const checked = validateAndSanitizeDossier(input.match, input.dossier);
      return {
        isValid: checked.valid,
        status: checked.validation.status,
        message: checked.validation.message,
        reasons: checked.validation.reasons,
        dossier: checked.dossier,
      };
    }
    const idRes = validateMatchIdentifiers(input.match);
    return {
      ...idRes,
      dossier: null,
    };
  }

  const reasons: string[] = [];
  const evId = normalizeId(input.eventId);
  const hId = normalizeId(input.homeTeamId);
  const aId = normalizeId(input.awayTeamId);
  const hasDate = isValidDateKey(input.dateKey) || isValidTimestamp(input.date);

  if (!isValidEntityId(evId)) reasons.push('eventId ausente o inválido');
  if (!isValidEntityId(hId)) reasons.push('homeTeamId ausente o inválido');
  if (!isValidEntityId(aId)) reasons.push('awayTeamId ausente o inválido');
  if (hId && aId && hId === aId) reasons.push('IDs de equipo local y visitante duplicados');
  if (!hasDate) reasons.push('fecha oficial ausente o inválida');

  if (reasons.length > 0) {
    return {
      isValid: false,
      status: 'NO DISPONIBLE',
      message: UNAVAILABLE_DATA_MESSAGE,
      reasons,
      dossier: null,
    };
  }

  return {
    isValid: true,
    status: 'VERIFICADO',
    message: 'Identificadores y fecha válidos',
    reasons: [],
    dossier: null,
  };
}

function filterValidHistoricalMatches(
  items: VerifiedHistoricalMatch[] | undefined,
  kickoffTs: number,
  requiredTeamId: string,
  requiredRole?: 'home' | 'away'
): VerifiedHistoricalMatch[] {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => {
    const evId = normalizeId(item?.eventId);
    const hId = normalizeId(item?.homeTeamId);
    const aId = normalizeId(item?.awayTeamId);
    const itemTs = Date.parse(item?.date || '');
    if (!isValidEntityId(evId) || !isValidEntityId(hId) || !isValidEntityId(aId)) return false;
    if (hId === aId || Number.isNaN(itemTs) || itemTs >= kickoffTs) return false;
    if (!Number.isFinite(item?.homeScore) || !Number.isFinite(item?.awayScore)) return false;
    if (requiredRole === 'home') return hId === requiredTeamId;
    if (requiredRole === 'away') return aId === requiredTeamId;
    return hId === requiredTeamId || aId === requiredTeamId;
  });
}

function emptyMetrics() {
  return {
    sampleSize: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsForAvg: null,
    goalsAgainstAvg: null,
    over25Count: 0,
    bttsCount: 0,
    cleanSheets: 0,
  };
}

function sanitizeTeamSummary(
  team: VerifiedTeamSummary | undefined,
  expectedTeamId: string,
  kickoffTs: number,
  role: 'home' | 'away'
): VerifiedTeamSummary | null {
  if (!team || normalizeId(team.teamId) !== expectedTeamId) return null;

  const overall = filterValidHistoricalMatches(team.last5Overall, kickoffTs, expectedTeamId).slice(0, 5);
  const homeOnly = filterValidHistoricalMatches(team.last5Home, kickoffTs, expectedTeamId, 'home').slice(0, 5);
  const awayOnly = filterValidHistoricalMatches(team.last5Away, kickoffTs, expectedTeamId, 'away').slice(0, 5);

  const hasValidSample = overall.length > 0;
  const splitList = role === 'home' ? homeOnly : awayOnly;

  return {
    ...team,
    last5Overall: overall,
    last5Home: homeOnly,
    last5Away: awayOnly,
    overallMetrics: hasValidSample ? team.overallMetrics : emptyMetrics(),
    splitMetrics:
      splitList.length > 0
        ? team.splitMetrics
        : { ...emptyMetrics(), split: role },
    restDays: hasValidSample ? team.restDays : null,
    absences:
      team.absences?.status === 'VERIFICADO' || team.absences?.status === 'VERIFICADO PARCIALMENTE'
        ? team.absences
        : {
            ...team.absences,
            status: 'NO DISPONIBLE',
            note: team.absences?.note || UNAVAILABLE_DATA_MESSAGE,
            items: [],
          },
    sourceMeta: hasValidSample
      ? team.sourceMeta
      : {
          ...team.sourceMeta,
          status: 'NO DISPONIBLE',
          note: UNAVAILABLE_DATA_MESSAGE,
        },
  };
}

/**
 * Capa de validación obligatoria entre el partido seleccionado y el dossier recibido:
 * verifica coincidencia exacta de eventId, IDs de equipos (local/visitante), fecha coherente
 * y depura cualquier registro de H2H o historial que no corresponda inequívocamente.
 */
export function validateAndSanitizeDossier(
  match?: Match | null,
  dossier?: VerifiedMatchDossier | null
): {
  valid: boolean;
  dossier: VerifiedMatchDossier | null;
  validation: MatchDataValidationResult;
} {
  const baseCheck = validateMatchIdentifiers(match);
  if (!baseCheck.isValid || !match) {
    return { valid: false, dossier: null, validation: baseCheck };
  }

  if (!dossier || !dossier.identity) {
    return {
      valid: false,
      dossier: null,
      validation: {
        isValid: false,
        status: 'NO DISPONIBLE',
        message: UNAVAILABLE_DATA_MESSAGE,
        reasons: ['Dossier de partido no disponible'],
      },
    };
  }

  const reasons: string[] = [];
  const matchEventId = normalizeId(match.id);
  const matchHomeId = normalizeId(match.homeTeam?.id);
  const matchAwayId = normalizeId(match.awayTeam?.id);

  const dossierEventId = normalizeId(dossier.identity.eventId);
  const dossierHomeId = normalizeId(dossier.identity.homeTeamId);
  const dossierAwayId = normalizeId(dossier.identity.awayTeamId);

  if (!dossier.identity.verified) reasons.push('identidad del dossier no verificada');
  if (!isValidEntityId(dossierEventId) || dossierEventId !== matchEventId) {
    reasons.push(`eventId no coincide (${dossierEventId || 'N/D'} !== ${matchEventId})`);
  }
  if (!isValidEntityId(dossierHomeId) || dossierHomeId !== matchHomeId) {
    reasons.push(`homeTeamId no coincide (${dossierHomeId || 'N/D'} !== ${matchHomeId})`);
  }
  if (!isValidEntityId(dossierAwayId) || dossierAwayId !== matchAwayId) {
    reasons.push(`awayTeamId no coincide (${dossierAwayId || 'N/D'} !== ${matchAwayId})`);
  }
  if (!areDatesCoherent(match.dateKey, dossier.identity.kickoffUtc)) {
    reasons.push('fecha del dossier incoherente con la fecha del partido');
  }

  const kickoffTs = Date.parse(dossier.identity.kickoffUtc || '');
  const sanitizedHome = sanitizeTeamSummary(dossier.home, matchHomeId, kickoffTs, 'home');
  const sanitizedAway = sanitizeTeamSummary(dossier.away, matchAwayId, kickoffTs, 'away');

  if (!sanitizedHome || !sanitizedAway) {
    reasons.push('IDs internos de resumen de equipo incoherentes');
  }

  if (reasons.length > 0 || !sanitizedHome || !sanitizedAway) {
    return {
      valid: false,
      dossier: null,
      validation: {
        isValid: false,
        status: 'NO DISPONIBLE',
        message: UNAVAILABLE_DATA_MESSAGE,
        reasons,
      },
    };
  }

  // Strict validation on H2H matches: both team IDs must match and match date must predate kickoffUtc
  const validH2hMatches = (dossier.h2h?.matches || [])
    .filter((h) => {
      const hEvId = normalizeId(h?.eventId);
      const hHomeId = normalizeId(h?.homeTeamId);
      const hAwayId = normalizeId(h?.awayTeamId);
      const hTs = Date.parse(h?.date || '');
      if (
        !isValidEntityId(hEvId) ||
        !isValidEntityId(hHomeId) ||
        !isValidEntityId(hAwayId) ||
        hEvId === matchEventId ||
        hHomeId === hAwayId ||
        Number.isNaN(hTs)
      ) {
        return false;
      }
      if (!Number.isFinite(h?.homeScore) || !Number.isFinite(h?.awayScore)) return false;
      if (hTs >= kickoffTs) return false;
      return (
        (hHomeId === matchHomeId && hAwayId === matchAwayId) ||
        (hHomeId === matchAwayId && hAwayId === matchHomeId)
      );
    })
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .slice(0, 3);

  const h2hValid = validH2hMatches.length > 0;

  const hasOfficialStats = Boolean(
    dossier.officialMatchStats?.stats ||
      (dossier.officialMatchStats?.events && dossier.officialMatchStats.events.length > 0) ||
      dossier.officialMatchStats?.rosters
  );

  const sanitizedDossier: VerifiedMatchDossier = {
    ...dossier,
    home: sanitizedHome,
    away: sanitizedAway,
    h2h: {
      ...dossier.h2h,
      status: h2hValid ? dossier.h2h.status : 'NO DISPONIBLE',
      note: h2hValid ? dossier.h2h.note : UNAVAILABLE_DATA_MESSAGE,
      matches: validH2hMatches,
      officialCount: validH2hMatches.filter((m) => m.isOfficial).length,
      friendlyCount: validH2hMatches.filter((m) => !m.isOfficial).length,
    },
    officialMatchStats: dossier.officialMatchStats
      ? {
          ...dossier.officialMatchStats,
          status: hasOfficialStats ? dossier.officialMatchStats.status : 'NO DISPONIBLE',
        }
      : undefined,
  };

  return {
    valid: true,
    dossier: sanitizedDossier,
    validation: {
      isValid: true,
      status: 'VERIFICADO',
      message: 'Identidad, equipos y fecha validados',
      reasons: [],
    },
  };
}

export async function fetchLiveFootballMatches(dateStr?: string): Promise<Match[]> {
  try {
    if (dateStr && !isValidDateKey(dateStr)) {
      console.warn('Fecha inválida solicitada en fetchLiveFootballMatches:', dateStr);
      return [];
    }

    const url = dateStr ? `/api/football/real-matches?date=${dateStr}` : '/api/football/real-matches';
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network error');
    const data = await response.json();
    if (data.matches && Array.isArray(data.matches)) {
      return data.matches
        .filter((raw: any) => Boolean(isValidEntityId(raw?.id) && raw?.homeTeam?.name && raw?.awayTeam?.name))
        .map((raw: any) => {
          const eventId = normalizeId(raw.id);
          const homeId = normalizeId(raw.homeTeam?.id);
          const awayId = normalizeId(raw.awayTeam?.id);
          const hasValidDate = isValidDateKey(raw.dateKey) || isValidTimestamp(raw.date);
          const hasCoherentIdentity = Boolean(
            isValidEntityId(eventId) &&
              isValidEntityId(homeId) &&
              isValidEntityId(awayId) &&
              homeId !== awayId &&
              hasValidDate
          );

          const hasRealOdds = Boolean(hasCoherentIdentity && raw.odds?.hasRealOdds && raw.odds?.home > 0);
          const hOdd = hasRealOdds ? raw.odds.home : 0;
          const dOdd = hasRealOdds ? raw.odds.draw : 0;
          const aOdd = hasRealOdds ? raw.odds.away : 0;
          const o25Odd = hasRealOdds ? raw.odds.over25 : 0;

          return {
            id: eventId,
            league: raw.league,
            leagueCode: raw.leagueCode,
            leagueSlug: raw.leagueSlug,
            round: raw.round || 'Jornada',
            status: raw.status || 'SCHEDULED',
            minute: raw.minute,
            homeScore: hasCoherentIdentity ? (raw.homeTeam?.score ?? null) : null,
            awayScore: hasCoherentIdentity ? (raw.awayTeam?.score ?? null) : null,
            kickoffTime: hasCoherentIdentity ? (raw.timeDisplay || UNAVAILABLE_DATA_MESSAGE) : UNAVAILABLE_DATA_MESSAGE,
            dateKey: isValidDateKey(raw.dateKey) ? raw.dateKey : '',
            dateFormatted: hasCoherentIdentity ? (raw.dateFormatted || '') : UNAVAILABLE_DATA_MESSAGE,
            stadium: raw.stadium || 'Estadio por confirmar',
            refereeInfo: hasCoherentIdentity ? raw.refereeInfo || undefined : undefined,
            dataIntegrity: hasCoherentIdentity
              ? {
                  status: 'VERIFIED' as const,
                  validationStatus: 'VERIFICADO' as const,
                  source: 'ESPN Live Scoreboards',
                  lastSync: data.timestamp || new Date().toISOString(),
                }
              : {
                  status: 'WARNING' as const,
                  validationStatus: 'NO DISPONIBLE' as const,
                  source: 'Validación local de integridad',
                  lastSync: data.timestamp || new Date().toISOString(),
                  discrepancyNote: UNAVAILABLE_DATA_MESSAGE,
                },
            homeTeam: {
              id: isValidEntityId(homeId) ? homeId : undefined,
              name: raw.homeTeam?.name || 'Local',
              shortName: raw.homeTeam?.shortName || 'LOC',
              logo: raw.homeTeam?.logo || '',
              rank: null,
              record: hasCoherentIdentity ? raw.homeTeam?.record : undefined,
              stats: {
                xG: hasCoherentIdentity ? (raw.detailedStats?.xg?.[0] ?? null) : null,
                xGA: hasCoherentIdentity ? (raw.detailedStats?.xg?.[1] ?? null) : null,
                possession: hasCoherentIdentity ? (raw.detailedStats?.possession?.[0] ?? null) : null,
                shotsOnTarget: hasCoherentIdentity ? (raw.detailedStats?.shotsOnTarget?.[0] ?? null) : null,
                cornersAvg: hasCoherentIdentity ? (raw.detailedStats?.corners?.[0] ?? null) : null,
                cleanSheets: null,
                goalsScoredAvg: null,
                goalsConcededAvg: null,
                form:
                  hasCoherentIdentity && Array.isArray(raw.homeTeam?.form)
                    ? raw.homeTeam.form
                    : [],
                isModelDerived: false,
              },
            },
            awayTeam: {
              id: isValidEntityId(awayId) ? awayId : undefined,
              name: raw.awayTeam?.name || 'Visitante',
              shortName: raw.awayTeam?.shortName || 'VIS',
              logo: raw.awayTeam?.logo || '',
              rank: null,
              record: hasCoherentIdentity ? raw.awayTeam?.record : undefined,
              stats: {
                xG: hasCoherentIdentity ? (raw.detailedStats?.xg?.[1] ?? null) : null,
                xGA: hasCoherentIdentity ? (raw.detailedStats?.xg?.[0] ?? null) : null,
                possession: hasCoherentIdentity ? (raw.detailedStats?.possession?.[1] ?? null) : null,
                shotsOnTarget: hasCoherentIdentity ? (raw.detailedStats?.shotsOnTarget?.[1] ?? null) : null,
                cornersAvg: hasCoherentIdentity ? (raw.detailedStats?.corners?.[1] ?? null) : null,
                cleanSheets: null,
                goalsScoredAvg: null,
                goalsConcededAvg: null,
                form:
                  hasCoherentIdentity && Array.isArray(raw.awayTeam?.form)
                    ? raw.awayTeam.form
                    : [],
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
              cornersOver85: hasRealOdds ? raw.odds?.cornersOver85 : undefined,
              provider: raw.odds?.provider || (hasRealOdds ? 'ESPN Odds' : 'Sin cuota publicada'),
              hasRealOdds,
              betano: hasRealOdds ? raw.odds?.betano : undefined,
              betplay: hasRealOdds ? raw.odds?.betplay : undefined,
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
            detailedStats: hasCoherentIdentity ? raw.detailedStats || null : null,
            events: hasCoherentIdentity ? raw.events || [] : [],
            rosters: hasCoherentIdentity ? raw.rosters : undefined,
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
  const cleanLeague = (leagueSlug || '').trim();
  const cleanEventId = normalizeId(eventId);
  if (!cleanLeague || !isValidEntityId(cleanEventId)) return null;

  try {
    const res = await fetch(
      `/api/football/match-summary?leagueSlug=${encodeURIComponent(cleanLeague)}&eventId=${encodeURIComponent(cleanEventId)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const summary = data?.summary;
    if (!summary) return null;
    if (summary.eventId && normalizeId(summary.eventId) !== cleanEventId) {
      return null;
    }
    return summary;
  } catch (err) {
    console.error('Error fetching match summary:', err);
    return null;
  }
}

export async function fetchValidatedMatchDossier(match: Match): Promise<{
  status: 'VERIFICADO' | 'NO DISPONIBLE';
  message: string;
  dossier: VerifiedMatchDossier | null;
  validation: MatchDataValidationResult;
}> {
  const idCheck = validateMatchIdentifiers(match);
  if (!idCheck.isValid || !match?.leagueSlug) {
    return {
      status: 'NO DISPONIBLE',
      message: UNAVAILABLE_DATA_MESSAGE,
      dossier: null,
      validation: idCheck.isValid
        ? {
            isValid: false,
            status: 'NO DISPONIBLE',
            message: UNAVAILABLE_DATA_MESSAGE,
            reasons: ['leagueSlug ausente'],
          }
        : idCheck,
    };
  }

  const key = `${match.leagueSlug}_${match.id}`;
  const cached = clientDossierCache.get(key);
  if (cached) {
    const cachedCheck = validateAndSanitizeDossier(match, cached);
    if (cachedCheck.valid && cachedCheck.dossier) {
      return {
        status: 'VERIFICADO',
        message: cachedCheck.validation.message,
        dossier: cachedCheck.dossier,
        validation: cachedCheck.validation,
      };
    }
    clientDossierCache.delete(key);
  }

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
    if (!res.ok) {
      return {
        status: 'NO DISPONIBLE',
        message: UNAVAILABLE_DATA_MESSAGE,
        dossier: null,
        validation: {
          isValid: false,
          status: 'NO DISPONIBLE',
          message: UNAVAILABLE_DATA_MESSAGE,
          reasons: [`HTTP ${res.status}`],
        },
      };
    }
    const data = await res.json();
    const check = validateAndSanitizeDossier(
      match,
      (data?.dossier as VerifiedMatchDossier | undefined) ?? null
    );
    if (check.valid && check.dossier) {
      clientDossierCache.set(key, check.dossier);
      return {
        status: 'VERIFICADO',
        message: check.validation.message,
        dossier: check.dossier,
        validation: check.validation,
      };
    }
    return {
      status: 'NO DISPONIBLE',
      message: UNAVAILABLE_DATA_MESSAGE,
      dossier: null,
      validation: check.validation,
    };
  } catch (err) {
    console.error('Error fetching match dossier:', err);
    return {
      status: 'NO DISPONIBLE',
      message: UNAVAILABLE_DATA_MESSAGE,
      dossier: null,
      validation: {
        isValid: false,
        status: 'NO DISPONIBLE',
        message: UNAVAILABLE_DATA_MESSAGE,
        reasons: ['Error de red al consultar el dossier'],
      },
    };
  }
}

export async function fetchMatchDossier(match: Match): Promise<VerifiedMatchDossier | null> {
  const result = await fetchValidatedMatchDossier(match);
  return result.status === 'VERIFICADO' ? result.dossier : null;
}

export async function fetchRadarDossiers(
  matches: Match[]
): Promise<Record<string, VerifiedMatchDossier>> {
  const result: Record<string, VerifiedMatchDossier> = {};
  const toFetch: Match[] = [];
  const inputById = new Map<string, Match>();

  for (const m of matches.slice(0, 4)) {
    const idCheck = validateMatchIdentifiers(m);
    if (!idCheck.isValid || !m.leagueSlug) continue;

    inputById.set(m.id, m);
    const key = `${m.leagueSlug}_${m.id}`;
    const cached = clientDossierCache.get(key);
    if (cached) {
      const cachedCheck = validateAndSanitizeDossier(m, cached);
      if (cachedCheck.valid && cachedCheck.dossier) {
        result[m.id] = cachedCheck.dossier;
        continue;
      }
      clientDossierCache.delete(key);
    }
    toFetch.push(m);
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
      for (const [id, rawDossier] of Object.entries(data.dossiers)) {
        const sourceMatch = inputById.get(id);
        if (!sourceMatch) continue;
        const check = validateAndSanitizeDossier(
          sourceMatch,
          rawDossier as VerifiedMatchDossier
        );
        if (check.valid && check.dossier) {
          clientDossierCache.set(`${sourceMatch.leagueSlug}_${id}`, check.dossier);
          result[id] = check.dossier;
        }
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
  const idCheck = validateMatchIdentifiers(match);
  if (!idCheck.isValid) {
    return {
      analysis: UNAVAILABLE_DATA_MESSAGE,
      isGeneratedByAI: false,
      warning: UNAVAILABLE_DATA_MESSAGE,
    };
  }

  const dossierCheck = match.verifiedDossier
    ? validateAndSanitizeDossier(match, match.verifiedDossier)
    : { valid: false, dossier: null };
  const dossier = dossierCheck.valid ? dossierCheck.dossier : null;

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
  const validMatches = matches.filter((m) => validateMatchIdentifiers(m).isValid);
  if (validMatches.length === 0) {
    return {
      recommendation: UNAVAILABLE_DATA_MESSAGE,
      isGeneratedByAI: false,
    };
  }

  const payload = validMatches.map((m) => {
    const dossierCheck = m.verifiedDossier
      ? validateAndSanitizeDossier(m, m.verifiedDossier)
      : { valid: false, dossier: null };
    const dossier = dossierCheck.valid ? dossierCheck.dossier : null;

    return {
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
        home: dossier?.modelEstimates?.homeWinProb ?? m.probabilities.homeWin,
        draw: dossier?.modelEstimates?.drawProb ?? m.probabilities.draw,
        away: dossier?.modelEstimates?.awayWinProb ?? m.probabilities.awayWin,
      },
      stats: {
        homeXg: dossier?.modelEstimates?.expectedGoalsHome ?? m.homeTeam.stats.xG,
        awayXg: dossier?.modelEstimates?.expectedGoalsAway ?? m.awayTeam.stats.xG,
      },
      recommendedBet: m.valueBet
        ? {
            market: m.valueBet.market,
            odds: m.valueBet.bookmakerOdd,
            expectedValue: `+${m.valueBet.expectedValue}%`,
          }
        : undefined,
    };
  });

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
