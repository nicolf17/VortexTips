import type {
  DetailedMatchStats,
  Match,
  MatchOdds,
  RefereeInfo,
  SampleAggregateMetrics,
  SourceMeta,
  ValidationStatus,
  VerifiedAbsenceItem,
  VerifiedHistoricalMatch,
  VerifiedMatchDossier,
  VerifiedTeamSummary,
} from '../src/types/football.ts';
import { fetchExactMatchStats, LEAGUES_CONFIG } from './espnService.ts';

const fotmobMatchesCache = new Map<string, { data: any; timestamp: number }>();
const fotmobDetailsCache = new Map<string, { data: any; timestamp: number }>();
const fotmobTeamCache = new Map<string, { data: any; timestamp: number }>();
const espnScheduleCache = new Map<string, { data: any; timestamp: number }>();
const dossierCache = new Map<string, { data: VerifiedMatchDossier; timestamp: number }>();

const USER_AGENT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
};

async function fetchJsonSafe(url: string, timeoutMs = 8000): Promise<any | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: USER_AGENT_HEADERS,
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Team identity canonicalization + strict youth/women/reserve guard to prevent false cross-matches
const TEAM_ALIASES: Record<string, string> = {
  turkiye: 'turkey',
  czechia: 'czech republic',
  'korea republic': 'south korea',
  'republic of ireland': 'ireland',
  'united states': 'usa',
  'bosnia and herzegovina': 'bosnia',
  'cape verde islands': 'cape verde',
  'ivory coast': 'cote divoire',
  'internacional de bogota': 'internacional de bogota',
  'la equidad': 'internacional de bogota',
  'independiente santa fe': 'santa fe',
  'atletico bucaramanga': 'bucaramanga',
  'atletico nacional': 'nacional',
  'deportivo pasto': 'pasto',
  'junior fc': 'junior',
  'atletico junior': 'junior',
  'burgos cf': 'burgos',
  'cd leganes': 'leganes',
  'real betis': 'betis',
  'athletic club': 'athletic bilbao',
  'atletico de madrid': 'atletico madrid',
  'fc barcelona': 'barcelona',
  'man city': 'manchester city',
  'man united': 'manchester united',
  'man utd': 'manchester united',
  'wolverhampton wanderers': 'wolves',
  wolverhampton: 'wolves',
  'tottenham hotspur': 'tottenham',
  'paris saint germain': 'psg',
  'paris saint-germain': 'psg',
  'bayern munchen': 'bayern munich',
  'fc bayern munchen': 'bayern munich',
  'inter milan': 'inter',
  internazionale: 'inter',
  'ac milan': 'milan',
  'brighton hove albion': 'brighton',
  'brighton and hove albion': 'brighton',
};

function extractCategoryMarkers(raw: string): Set<string> {
  const s = raw.toLowerCase();
  const markers = new Set<string>();
  if (/\b(women|woman|femenin[oa]|fem\.?|ladies|\bw\b)\b/i.test(s)) markers.add('WOMEN');
  const uMatch = s.match(/\bu[- ]?(17|18|19|20|21|23)\b/i) || s.match(/\bsub[- ]?(17|18|19|20|21|23)\b/i);
  if (uMatch) markers.add(`U${uMatch[1]}`);
  if (/\b(ii|b|reserves|castilla|promesas|juvenil)\b/i.test(s)) markers.add('RESERVE');
  return markers;
}

function canonicalTeamKey(raw: string): string {
  const noAccents = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\b(fc|cf|cd|ud|sd|rcd|ca|cs|sc|ac|as|ss|fk|sk|nk|afc|sv|vfb|tsg)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return TEAM_ALIASES[noAccents] || noAccents;
}

function teamsUnambiguouslyMatch(a: string, b: string): boolean {
  const markersA = extractCategoryMarkers(a);
  const markersB = extractCategoryMarkers(b);
  if (markersA.size !== markersB.size) return false;
  for (const m of markersA) {
    if (!markersB.has(m)) return false;
  }
  const keyA = canonicalTeamKey(a);
  const keyB = canonicalTeamKey(b);
  if (!keyA || !keyB) return false;
  if (keyA === keyB) return true;
  if (keyA.length >= 5 && keyB.length >= 5) {
    return keyA.includes(keyB) || keyB.includes(keyA);
  }
  return false;
}

async function getFotMobMatchesByDate(utcDateCompact: string): Promise<any | null> {
  const cached = fotmobMatchesCache.get(utcDateCompact);
  if (cached && Date.now() - cached.timestamp < 120000) return cached.data;
  const data = await fetchJsonSafe(`https://www.fotmob.com/api/data/matches?date=${utcDateCompact}`);
  if (data) {
    fotmobMatchesCache.set(utcDateCompact, { data, timestamp: Date.now() });
  }
  return data;
}

async function getFotMobMatchDetails(fotmobMatchId: string): Promise<any | null> {
  const cached = fotmobDetailsCache.get(fotmobMatchId);
  if (cached && Date.now() - cached.timestamp < 120000) return cached.data;
  const data = await fetchJsonSafe(`https://www.fotmob.com/api/data/matchDetails?matchId=${fotmobMatchId}`);
  if (data) {
    fotmobDetailsCache.set(fotmobMatchId, { data, timestamp: Date.now() });
  }
  return data;
}

async function getFotMobTeam(fotmobTeamId: string): Promise<any | null> {
  const cached = fotmobTeamCache.get(fotmobTeamId);
  if (cached && Date.now() - cached.timestamp < 300000) return cached.data;
  const data = await fetchJsonSafe(`https://www.fotmob.com/api/data/teams?id=${fotmobTeamId}`);
  if (data) {
    fotmobTeamCache.set(fotmobTeamId, { data, timestamp: Date.now() });
  }
  return data;
}

async function getEspnTeamSchedule(teamId: string, seasonYear: number): Promise<any | null> {
  const key = `${teamId}_${seasonYear}`;
  const cached = espnScheduleCache.get(key);
  if (cached && Date.now() - cached.timestamp < 180000) return cached.data;
  const data = await fetchJsonSafe(
    `https://site.api.espn.com/apis/site/v2/sports/soccer/all/teams/${teamId}/schedule?season=${seasonYear}`
  );
  if (data) {
    espnScheduleCache.set(key, { data, timestamp: Date.now() });
  }
  return data;
}

async function findFotMobMatchForEspnEvent(
  kickoffUtc: string,
  homeName: string,
  awayName: string
): Promise<{ fotmobMatchId: string; details: any; homeTeamId?: string; awayTeamId?: string } | null> {
  const kickoffMs = new Date(kickoffUtc).getTime();
  if (isNaN(kickoffMs)) return null;

  const dateUtc = new Date(kickoffMs).toISOString().slice(0, 10).replace(/-/g, '');
  const prevDateUtc = new Date(kickoffMs - 86400000).toISOString().slice(0, 10).replace(/-/g, '');
  const nextDateUtc = new Date(kickoffMs + 86400000).toISOString().slice(0, 10).replace(/-/g, '');

  const dateCandidates = Array.from(new Set([dateUtc, nextDateUtc, prevDateUtc]));

  for (const d of dateCandidates) {
    const dayData = await getFotMobMatchesByDate(d);
    if (!dayData?.leagues) continue;

    for (const lg of dayData.leagues) {
      for (const m of lg.matches || []) {
        const fmHome = m.home?.name || '';
        const fmAway = m.away?.name || '';
        const fmTime = new Date(m.status?.utcTime || '').getTime();
        if (isNaN(fmTime)) continue;

        // Require close kickoff timestamp (<= 2 hours) AND exact polarity home/away match
        const timeDiffMin = Math.abs(fmTime - kickoffMs) / 60000;
        if (timeDiffMin > 120) continue;

        if (teamsUnambiguouslyMatch(homeName, fmHome) && teamsUnambiguouslyMatch(awayName, fmAway)) {
          const fmId = String(m.id);
          const details = await getFotMobMatchDetails(fmId);
          if (details) {
            return {
              fotmobMatchId: fmId,
              details,
              homeTeamId: m.home?.id ? String(m.home.id) : undefined,
              awayTeamId: m.away?.id ? String(m.away.id) : undefined,
            };
          }
        }
      }
    }
  }
  return null;
}

function formatDateEsCo(isoDate: string): string {
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function isOfficialCompetitionName(compName: string): boolean {
  return !/(friendly|amistoso|club friendly|exhibition|preseason|pretemporada)/i.test(compName || '');
}

function computeAggregateMetrics(
  matches: VerifiedHistoricalMatch[],
  teamId: string
): SampleAggregateMetrics {
  const n = matches.length;
  if (n === 0) {
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

  let wins = 0;
  let draws = 0;
  let losses = 0;
  let gf = 0;
  let ga = 0;
  let over25Count = 0;
  let bttsCount = 0;
  let cleanSheets = 0;

  for (const m of matches) {
    const isHome = m.homeTeamId === teamId;
    const teamGoals = isHome ? m.homeScore : m.awayScore;
    const oppGoals = isHome ? m.awayScore : m.homeScore;
    gf += teamGoals;
    ga += oppGoals;
    if (teamGoals > oppGoals) wins++;
    else if (teamGoals === oppGoals) draws++;
    else losses++;
    if (teamGoals + oppGoals >= 3) over25Count++;
    if (teamGoals > 0 && oppGoals > 0) bttsCount++;
    if (oppGoals === 0) cleanSheets++;
  }

  return {
    sampleSize: n,
    wins,
    draws,
    losses,
    goalsForAvg: Number((gf / n).toFixed(2)),
    goalsAgainstAvg: Number((ga / n).toFixed(2)),
    over25Count,
    bttsCount,
    cleanSheets,
  };
}

function buildTeamMatchHistory(
  espnTeamId: string,
  espnTeamName: string,
  cutoffIso: string,
  scheduleEvents: any[],
  summaryLastFiveEvents: any[],
  fotmobTeamId: string | undefined,
  fotmobFixtures: any[]
): VerifiedHistoricalMatch[] {
  const cutoffMs = new Date(cutoffIso).getTime();
  const byEventId = new Map<string, VerifiedHistoricalMatch>();

  // 1. Primary ID-verified source: ESPN all/teams/{id}/schedule
  for (const ev of scheduleEvents) {
    const comp = ev.competitions?.[0];
    if (!comp || comp.status?.type?.state !== 'post') continue;
    const evMs = new Date(ev.date).getTime();
    if (isNaN(evMs) || evMs >= cutoffMs) continue;

    const hComp = comp.competitors?.find((c: any) => c.homeAway === 'home');
    const aComp = comp.competitors?.find((c: any) => c.homeAway === 'away');
    if (!hComp || !aComp) continue;

    const hId = String(hComp.team?.id || hComp.id || '');
    const aId = String(aComp.team?.id || aComp.id || '');
    if (hId !== espnTeamId && aId !== espnTeamId) continue;

    const hScore = parseInt(hComp.score?.displayValue ?? hComp.score?.value ?? '', 10);
    const aScore = parseInt(aComp.score?.displayValue ?? aComp.score?.value ?? '', 10);
    if (isNaN(hScore) || isNaN(aScore)) continue;

    const isHome = hId === espnTeamId;
    const outcomeForTeam: 'W' | 'D' | 'L' =
      (isHome ? hScore > aScore : aScore > hScore)
        ? 'W'
        : hScore === aScore
        ? 'D'
        : 'L';

    const compName = ev.league?.name || ev.season?.displayName || 'Competición Oficial';
    byEventId.set(String(ev.id), {
      eventId: String(ev.id),
      date: ev.date,
      dateFormatted: formatDateEsCo(ev.date),
      competition: compName,
      season: String(ev.season?.year || new Date(ev.date).getUTCFullYear()),
      isOfficial: isOfficialCompetitionName(compName),
      homeTeamId: hId,
      homeTeamName: hComp.team?.displayName || 'Local',
      awayTeamId: aId,
      awayTeamName: aComp.team?.displayName || 'Visitante',
      homeScore: hScore,
      awayScore: aScore,
      outcomeForTeam,
      source: 'ESPN Team Schedule API',
    });
  }

  // 2. Supplement with ESPN summary.lastFiveGames (also exact ESPN IDs, sometimes fresher than schedule)
  for (const ev of summaryLastFiveEvents) {
    const evMs = new Date(ev.gameDate).getTime();
    if (isNaN(evMs) || evMs >= cutoffMs) continue;
    const hId = String(ev.homeTeamId || '');
    const aId = String(ev.awayTeamId || '');
    if (hId !== espnTeamId && aId !== espnTeamId) continue;

    const hScore = parseInt(String(ev.homeTeamScore ?? ''), 10);
    const aScore = parseInt(String(ev.awayTeamScore ?? ''), 10);
    if (isNaN(hScore) || isNaN(aScore)) continue;

    const isHome = hId === espnTeamId;
    const oppName = ev.opponent?.displayName || 'Rival';
    const homeTeamName = isHome ? espnTeamName : oppName;
    const awayTeamName = isHome ? oppName : espnTeamName;
    const outcomeForTeam: 'W' | 'D' | 'L' =
      (isHome ? hScore > aScore : aScore > hScore)
        ? 'W'
        : hScore === aScore
        ? 'D'
        : 'L';
    const compName = ev.leagueName || ev.competitionName || 'Competición Oficial';

    if (!byEventId.has(String(ev.id))) {
      byEventId.set(String(ev.id), {
        eventId: String(ev.id),
        date: ev.gameDate,
        dateFormatted: formatDateEsCo(ev.gameDate),
        competition: compName,
        season: String(new Date(ev.gameDate).getUTCFullYear()),
        isOfficial: isOfficialCompetitionName(compName),
        homeTeamId: hId,
        homeTeamName,
        awayTeamId: aId,
        awayTeamName,
        homeScore: hScore,
        awayScore: aScore,
        outcomeForTeam,
        source: 'ESPN Match Summary (lastFiveGames)',
      });
    }
  }

  // 3. Supplement with FotMob fixtures ONLY if missing by date/score (useful for leagues where ESPN schedule omits recent rounds)
  if (fotmobTeamId && Array.isArray(fotmobFixtures)) {
    const existingList = Array.from(byEventId.values());
    for (const f of fotmobFixtures) {
      if (!f.status?.finished || f.status?.cancelled) continue;
      const utc = f.status?.utcTime;
      const fMs = new Date(utc).getTime();
      if (isNaN(fMs) || fMs >= cutoffMs) continue;

      const fmHomeId = String(f.home?.id || '');
      const fmAwayId = String(f.away?.id || '');
      if (fmHomeId !== fotmobTeamId && fmAwayId !== fotmobTeamId) continue;

      const hScore = Number(f.home?.score);
      const aScore = Number(f.away?.score);
      if (isNaN(hScore) || isNaN(aScore)) continue;

      // Avoid duplicates against ESPN entries (same kickoff window <= 6h and same opponent, even if penalties differ from 90' score)
      const fmOppName = fmHomeId === fotmobTeamId ? (f.away?.name || '') : (f.home?.name || '');
      const isDuplicate = existingList.some((ex) => {
        const timeDiff = Math.abs(new Date(ex.date).getTime() - fMs);
        if (timeDiff <= 21600000) {
          const exOppName = ex.homeTeamId === espnTeamId ? ex.awayTeamName : ex.homeTeamName;
          if (teamsUnambiguouslyMatch(exOppName, fmOppName)) return true;
        }
        return timeDiff <= 86400000 && ex.homeScore === hScore && ex.awayScore === aScore;
      });
      if (isDuplicate) continue;

      const isHome = fmHomeId === fotmobTeamId;
      const outcomeForTeam: 'W' | 'D' | 'L' =
        (isHome ? hScore > aScore : aScore > hScore)
          ? 'W'
          : hScore === aScore
          ? 'D'
          : 'L';
      const compName = f.tournament?.name || 'Competición Oficial';

      byEventId.set(`fm_${f.id}`, {
        eventId: `fm_${f.id}`,
        date: utc,
        dateFormatted: formatDateEsCo(utc),
        competition: compName,
        season: String(new Date(utc).getUTCFullYear()),
        isOfficial: isOfficialCompetitionName(compName),
        homeTeamId: isHome ? espnTeamId : `fm_team_${fmHomeId}`,
        homeTeamName: f.home?.name || 'Local',
        awayTeamId: isHome ? `fm_team_${fmAwayId}` : espnTeamId,
        awayTeamName: f.away?.name || 'Visitante',
        homeScore: hScore,
        awayScore: aScore,
        outcomeForTeam,
        source: 'FotMob Team Fixtures API',
      });
    }
  }

  return Array.from(byEventId.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

function buildStrictH2H(
  homeTeamId: string,
  awayTeamId: string,
  cutoffIso: string,
  seasonSeriesEvents: any[],
  homeScheduleEvents: any[],
  fotmobMatch: { homeTeamId?: string; awayTeamId?: string; details: any } | null
): {
  matches: VerifiedHistoricalMatch[];
  officialCount: number;
  friendlyCount: number;
  status: ValidationStatus;
  note: string;
} {
  const cutoffMs = new Date(cutoffIso).getTime();
  const h2hById = new Map<string, VerifiedHistoricalMatch>();

  const tryAddEspnH2H = (
    eventId: string,
    dateIso: string,
    compName: string,
    hId: string,
    hName: string,
    aId: string,
    aName: string,
    hScore: number,
    aScore: number,
    source: string
  ) => {
    const ms = new Date(dateIso).getTime();
    if (isNaN(ms) || ms >= cutoffMs) return;
    if (isNaN(hScore) || isNaN(aScore)) return;

    // Strict ID match of BOTH teams (in either home/away polarity)
    const exactMatch =
      (hId === homeTeamId && aId === awayTeamId) ||
      (hId === awayTeamId && aId === homeTeamId);
    if (!exactMatch) return;

    h2hById.set(eventId, {
      eventId,
      date: dateIso,
      dateFormatted: formatDateEsCo(dateIso),
      competition: compName,
      season: String(new Date(dateIso).getUTCFullYear()),
      isOfficial: isOfficialCompetitionName(compName),
      homeTeamId: hId,
      homeTeamName: hName,
      awayTeamId: aId,
      awayTeamName: aName,
      homeScore: hScore,
      awayScore: aScore,
      source,
    });
  };

  // 1. ESPN summary.seasonseries
  for (const ev of seasonSeriesEvents) {
    if (ev.statusType?.state !== 'post' && ev.status !== 'post') continue;
    const hComp = ev.competitors?.find((c: any) => c.homeAway === 'home');
    const aComp = ev.competitors?.find((c: any) => c.homeAway === 'away');
    if (!hComp || !aComp) continue;
    tryAddEspnH2H(
      String(ev.id),
      ev.date,
      ev.competitionName || 'Competición Oficial',
      String(hComp.team?.id || ''),
      hComp.team?.displayName || 'Local',
      String(aComp.team?.id || ''),
      aComp.team?.displayName || 'Visitante',
      parseInt(String(hComp.score ?? ''), 10),
      parseInt(String(aComp.score ?? ''), 10),
      'ESPN Summary SeasonSeries'
    );
  }

  // 2. ESPN team schedule cross-matches by exact IDs
  for (const ev of homeScheduleEvents) {
    const comp = ev.competitions?.[0];
    if (!comp || comp.status?.type?.state !== 'post') continue;
    const hComp = comp.competitors?.find((c: any) => c.homeAway === 'home');
    const aComp = comp.competitors?.find((c: any) => c.homeAway === 'away');
    if (!hComp || !aComp) continue;
    tryAddEspnH2H(
      String(ev.id),
      ev.date,
      ev.league?.name || ev.season?.displayName || 'Competición Oficial',
      String(hComp.team?.id || hComp.id || ''),
      hComp.team?.displayName || 'Local',
      String(aComp.team?.id || aComp.id || ''),
      aComp.team?.displayName || 'Visitante',
      parseInt(hComp.score?.displayValue ?? hComp.score?.value ?? '', 10),
      parseInt(aComp.score?.displayValue ?? aComp.score?.value ?? '', 10),
      'ESPN Team Schedule API'
    );
  }

  // 3. FotMob H2H (strictly validated by FotMob team IDs & finished status)
  const fmH2h = fotmobMatch?.details?.content?.h2h?.matches;
  const fmHomeId = fotmobMatch?.homeTeamId;
  const fmAwayId = fotmobMatch?.awayTeamId;
  if (Array.isArray(fmH2h) && fmHomeId && fmAwayId) {
    const existingList = Array.from(h2hById.values());
    for (const m of fmH2h) {
      if (!m.status?.finished || m.status?.cancelled) continue;
      const utc = m.status?.utcTime || m.time?.utcTime;
      const ms = new Date(utc).getTime();
      if (isNaN(ms) || ms >= cutoffMs) continue;

      const mhId = String(m.home?.id || '');
      const maId = String(m.away?.id || '');
      const idPairMatches =
        (mhId === fmHomeId && maId === fmAwayId) ||
        (mhId === fmAwayId && maId === fmHomeId);
      if (!idPairMatches) continue;

      const scoreParts = String(m.status?.scoreStr || '').split('-').map((s) => parseInt(s.trim(), 10));
      if (scoreParts.length !== 2 || isNaN(scoreParts[0]) || isNaN(scoreParts[1])) continue;
      const [hScore, aScore] = scoreParts;

      const isDuplicate = existingList.some(
        (ex) =>
          Math.abs(new Date(ex.date).getTime() - ms) <= 86400000 &&
          ex.homeScore === hScore &&
          ex.awayScore === aScore
      );
      if (isDuplicate) continue;

      const matchId = m.matchUrl?.split('#')?.[1] || utc;
      const mappedHomeId = mhId === fmHomeId ? homeTeamId : awayTeamId;
      const mappedAwayId = mhId === fmHomeId ? awayTeamId : homeTeamId;
      const compName = m.league?.name || 'Competición Oficial';

      h2hById.set(`fm_h2h_${matchId}`, {
        eventId: `fm_h2h_${matchId}`,
        date: utc,
        dateFormatted: formatDateEsCo(utc),
        competition: compName,
        season: String(new Date(utc).getUTCFullYear()),
        isOfficial: isOfficialCompetitionName(compName),
        homeTeamId: mappedHomeId,
        homeTeamName: m.home?.name || 'Local',
        awayTeamId: mappedAwayId,
        awayTeamName: m.away?.name || 'Visitante',
        homeScore: hScore,
        awayScore: aScore,
        source: 'FotMob H2H API',
      });
    }
  }

  // Sort newest to oldest, prioritize official competitions if more than 3 exist, cap at 3
  const sortedAll = Array.from(h2hById.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const officialOnly = sortedAll.filter((m) => m.isOfficial);
  const selected = (officialOnly.length >= 3 ? officialOnly : sortedAll).slice(0, 3);

  const officialCount = selected.filter((m) => m.isOfficial).length;
  const friendlyCount = selected.filter((m) => !m.isOfficial).length;

  if (selected.length === 0) {
    return {
      matches: [],
      officialCount: 0,
      friendlyCount: 0,
      status: 'NO DISPONIBLE',
      note: 'Historial de enfrentamientos directos no disponible o insuficiente para este encuentro.',
    };
  }

  return {
    matches: selected,
    officialCount,
    friendlyCount,
    status: selected.length >= 3 ? 'VERIFICADO' : 'VERIFICADO PARCIALMENTE',
    note:
      selected.length >= 3
        ? `Últimos ${selected.length} enfrentamientos directos verificados por ID (${officialCount} oficiales${friendlyCount > 0 ? `, ${friendlyCount} amistosos` : ''}).`
        : `Muestra parcial: ${selected.length} enfrentamiento(s) directo(s) verificado(s) por ID.`,
  };
}

function resolveAbsencesFromSources(
  espnSummary: any,
  espnTeamId: string,
  fotmobTeamLineup: any,
  fetchedAt: string
): VerifiedTeamSummary['absences'] {
  // 1. Check ESPN summary.injuries first
  if (Array.isArray(espnSummary?.injuries)) {
    const teamInjBlock = espnSummary.injuries.find(
      (b: any) => String(b.team?.id) === String(espnTeamId)
    );
    if (teamInjBlock && Array.isArray(teamInjBlock.injuries)) {
      const items: VerifiedAbsenceItem[] = teamInjBlock.injuries.map((inj: any) => ({
        playerName: inj.athlete?.displayName || 'Jugador',
        type: 'injury',
        reasonLabel: inj.status || inj.type?.description || 'Lesión / Baja',
        expectedReturn: inj.details?.returnDate,
        source: 'ESPN Injuries Feed',
      }));
      return {
        status: 'VERIFICADO',
        note:
          items.length > 0
            ? `${items.length} baja(s) reportada(s) en fuente oficial ESPN.`
            : 'Sin bajas registradas en el reporte oficial consultado.',
        items,
        sourceMeta: {
          source: 'ESPN Match Summary Injuries',
          fetchedAt,
          status: 'VERIFICADO',
        },
      };
    }
  }

  // 2. Check FotMob lineup.unavailable array (only verified when unavailable array explicitly exists!)
  if (Array.isArray(fotmobTeamLineup?.unavailable)) {
    const typeMap: Record<string, { type: VerifiedAbsenceItem['type']; label: string }> = {
      injury: { type: 'injury', label: 'Lesión' },
      suspension: { type: 'suspension', label: 'Suspensión' },
      internationalduty: { type: 'internationalDuty', label: 'Convocatoria Selección' },
      doubtful: { type: 'doubtful', label: 'En duda' },
    };

    const items: VerifiedAbsenceItem[] = fotmobTeamLineup.unavailable.map((p: any) => {
      const rawType = String(p.unavailability?.type || '').toLowerCase();
      const mapped = typeMap[rawType] || { type: 'other' as const, label: p.unavailability?.type || 'No disponible' };
      return {
        playerName: p.name || 'Jugador',
        type: mapped.type,
        reasonLabel: mapped.label,
        expectedReturn: p.unavailability?.expectedReturn,
        source: 'FotMob Match Details',
      };
    });

    return {
      status: 'VERIFICADO',
      note:
        items.length > 0
          ? `${items.length} baja(s)/duda(s) verificada(s) en reporte de disponibilidad.`
          : 'Sin bajas reportadas en la lista oficial de disponibilidad consultada.',
      items,
      sourceMeta: {
        source: 'FotMob Lineup Unavailable Feed',
        fetchedAt,
        status: 'VERIFICADO',
      },
    };
  }

  return {
    status: 'NO DISPONIBLE',
    note: 'No hay información verificable sobre bajas o recuperaciones para este encuentro.',
    items: [],
    sourceMeta: {
      source: 'ESPN / FotMob Availability Feeds',
      fetchedAt,
      status: 'NO DISPONIBLE',
      note: 'Las fuentes consultadas no publicaron parte médico o de bajas para este partido.',
    },
  };
}

function extractStandingsForTeam(espnSummary: any, teamId: string, fetchedAt: string) {
  const groups = espnSummary?.standings?.groups || [];
  for (const grp of groups) {
    const entries = grp.standings?.entries || [];
    const idx = entries.findIndex((e: any) => String(e.id) === String(teamId));
    if (idx !== -1) {
      const entry = entries[idx];
      const getVal = (name: string): number => {
        const s = (entry.stats || []).find((st: any) => st.name === name);
        return s && !isNaN(Number(s.value)) ? Number(s.value) : 0;
      };
      return {
        rank: getVal('rank') || idx + 1,
        played: getVal('gamesPlayed'),
        wins: getVal('wins'),
        draws: getVal('ties'),
        losses: getVal('losses'),
        goalsFor: getVal('pointsFor'),
        goalsAgainst: getVal('pointsAgainst'),
        points: getVal('points'),
        groupName: grp.header || espnSummary?.standings?.header,
        sourceMeta: {
          source: 'ESPN Standings Feed',
          fetchedAt,
          status: 'VERIFICADO' as ValidationStatus,
        },
      };
    }
  }
  return null;
}

function poissonPmf(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let fact = 1;
  for (let i = 2; i <= k; i++) fact *= i;
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / fact;
}

function computeInternalModel(
  homeName: string,
  awayName: string,
  home: VerifiedTeamSummary,
  away: VerifiedTeamSummary,
  h2h: VerifiedMatchDossier['h2h'],
  referee: RefereeInfo,
  odds?: MatchOdds
): VerifiedMatchDossier['modelEstimates'] {
  const hSample = home.overallMetrics.sampleSize;
  const aSample = away.overallMetrics.sampleSize;
  const sampleAdequate = hSample >= 3 && aSample >= 3;

  if (!sampleAdequate) {
    return {
      isOfficial: false,
      disclaimer:
        'Cálculo interno del modelo VORTEXTIPS (No oficial). Muestra insuficiente para estimación fiable.',
      sampleAdequate: false,
      sampleNote: `Muestra verificada insuficiente (${homeName}: ${hSample} juegos, ${awayName}: ${aSample} juegos; mínimo requerido: 3).`,
      homeWinProb: null,
      drawProb: null,
      awayWinProb: null,
      over25Prob: null,
      bttsProb: null,
      expectedGoalsHome: null,
      expectedGoalsAway: null,
      recommendedPick: {
        available: false,
        abstainReason:
          'No es posible generar una proyección con valor esperado (+EV) sin al menos 3 partidos recientes verificados por equipo.',
      },
    };
  }

  // Blend verified overall & home/away split averages cleanly
  const hAttack =
    home.splitMetrics.sampleSize >= 2 && home.splitMetrics.goalsForAvg !== null
      ? home.overallMetrics.goalsForAvg! * 0.55 + home.splitMetrics.goalsForAvg * 0.45
      : home.overallMetrics.goalsForAvg!;
  const aConcede =
    away.splitMetrics.sampleSize >= 2 && away.splitMetrics.goalsAgainstAvg !== null
      ? away.overallMetrics.goalsAgainstAvg! * 0.55 + away.splitMetrics.goalsAgainstAvg * 0.45
      : away.overallMetrics.goalsAgainstAvg!;

  const aAttack =
    away.splitMetrics.sampleSize >= 2 && away.splitMetrics.goalsForAvg !== null
      ? away.overallMetrics.goalsForAvg! * 0.55 + away.splitMetrics.goalsForAvg * 0.45
      : away.overallMetrics.goalsForAvg!;
  const hConcede =
    home.splitMetrics.sampleSize >= 2 && home.splitMetrics.goalsAgainstAvg !== null
      ? home.overallMetrics.goalsAgainstAvg! * 0.55 + home.splitMetrics.goalsAgainstAvg * 0.45
      : home.overallMetrics.goalsAgainstAvg!;

  const lambdaHome = Math.max(0.35, Math.min(3.5, Number(((hAttack + aConcede) / 2).toFixed(2))));
  const lambdaAway = Math.max(0.25, Math.min(3.2, Number(((aAttack + hConcede) / 2).toFixed(2))));

  let pHome = 0;
  let pDraw = 0;
  let pAway = 0;
  let pOver25 = 0;
  let pBtts = 0;

  for (let gh = 0; gh <= 7; gh++) {
    const ph = poissonPmf(gh, lambdaHome);
    for (let ga = 0; ga <= 7; ga++) {
      const p = ph * poissonPmf(ga, lambdaAway);
      if (gh > ga) pHome += p;
      else if (gh === ga) pDraw += p;
      else pAway += p;
      if (gh + ga >= 3) pOver25 += p;
      if (gh >= 1 && ga >= 1) pBtts += p;
    }
  }

  const total1x2 = pHome + pDraw + pAway || 1;
  const rawPoissonHome = pHome / total1x2;
  const rawPoissonDraw = pDraw / total1x2;
  const rawPoissonAway = pAway / total1x2;

  // When real bookmaker odds exist, anchor the small-sample Poisson with de-vigged market prior
  // so 5-game goal variance adjusts probabilities realistically rather than fabricating extreme edges
  let homeWinProb = Math.round(rawPoissonHome * 100);
  let drawProb = Math.round(rawPoissonDraw * 100);
  let awayWinProb = Math.max(1, 100 - homeWinProb - drawProb);
  let over25Prob = Math.round(pOver25 * 100);
  let bttsProb = Math.round(pBtts * 100);

  if (odds?.hasRealOdds && odds.home > 1.01 && odds.draw > 1.01 && odds.away > 1.01) {
    const invH = 1 / odds.home;
    const invD = 1 / odds.draw;
    const invA = 1 / odds.away;
    const sum1x2 = invH + invD + invA;
    const mktH = invH / sum1x2;
    const mktD = invD / sum1x2;
    const mktA = invA / sum1x2;

    const adjH = mktH * 0.7 + rawPoissonHome * 0.3;
    const adjD = mktD * 0.7 + rawPoissonDraw * 0.3;
    const adjA = mktA * 0.7 + rawPoissonAway * 0.3;
    const sumAdj = adjH + adjD + adjA;
    homeWinProb = Math.round((adjH / sumAdj) * 100);
    drawProb = Math.round((adjD / sumAdj) * 100);
    awayWinProb = Math.max(1, 100 - homeWinProb - drawProb);

    if (odds.over25 > 1.01 && odds.under25 > 1.01) {
      const invO = 1 / odds.over25;
      const invU = 1 / odds.under25;
      const mktO = invO / (invO + invU);
      over25Prob = Math.round((mktO * 0.65 + pOver25 * 0.35) * 100);
    }
    if (odds.bttsYes > 1.01 && odds.bttsNo > 1.01) {
      const invY = 1 / odds.bttsYes;
      const invN = 1 / odds.bttsNo;
      const mktY = invY / (invY + invN);
      bttsProb = Math.round((mktY * 0.65 + pBtts * 0.35) * 100);
    }
  }

  const sampleNote = `Modelo Poisson interno calculado sobre ${hSample} partidos recientes de ${homeName} y ${aSample} de ${awayName}${
    home.splitMetrics.sampleSize > 0 ? ` (incluye ${home.splitMetrics.sampleSize} de local y ${away.splitMetrics.sampleSize} de visita)` : ''
  }.`;

  if (!odds?.hasRealOdds || !odds.home || !odds.away) {
    return {
      isOfficial: false,
      disclaimer:
        'Cálculo interno del modelo VORTEXTIPS basado en resultados históricos verificados (no constituye dato oficial).',
      sampleAdequate: true,
      sampleNote,
      homeWinProb,
      drawProb,
      awayWinProb,
      over25Prob,
      bttsProb,
      expectedGoalsHome: lambdaHome,
      expectedGoalsAway: lambdaAway,
      recommendedPick: {
        available: false,
        abstainReason:
          'Las casas de apuestas consultadas no han publicado cuotas oficiales para calcular el valor esperado (+EV).',
      },
    };
  }

  const betano = odds.betano;
  const betplay = odds.betplay;

  interface Candidate {
    market: string;
    marketCategory: string;
    selection: string;
    probPct: number;
    betanoOdd: number;
    betplayOdd: number;
    avgOdd: number;
    rationale: string;
    contextTag: string;
  }

  const candidates: Candidate[] = [];

  if (odds.over25 > 1.05) {
    const totalGoalAvg = Number(
      ((home.overallMetrics.goalsForAvg! + home.overallMetrics.goalsAgainstAvg! + away.overallMetrics.goalsForAvg! + away.overallMetrics.goalsAgainstAvg!) / 2).toFixed(2)
    );
    const h2hOver25 = h2h.matches.filter((m) => m.homeScore + m.awayScore >= 3).length;
    const h2hSnippet =
      h2h.matches.length > 0
        ? `H2H verificado: ${h2hOver25}/${h2h.matches.length} duelos con +2.5 goles.`
        : 'H2H insuficiente; proyección basada en últimos partidos verificados.';
    candidates.push({
      market: 'Más de 2.5 Goles Totales',
      marketCategory: 'Modelo Goles • Muestra Verificada',
      selection: 'Más de 2.5 Goles',
      probPct: over25Prob,
      betanoOdd: betano?.over25 || odds.over25,
      betplayOdd: betplay?.over25 || odds.over25,
      avgOdd: odds.over25,
      contextTag: `Prom. combinado ${totalGoalAvg} goles/p (${hSample}+${aSample} juegos) • ${h2h.matches.length > 0 ? `H2H ${h2hOver25}/${h2h.matches.length} +2.5G` : 'Sin H2H'}`,
      rationale: `${homeName} promedia ${home.overallMetrics.goalsForAvg} GF y ${home.overallMetrics.goalsAgainstAvg} GC en ${hSample} juegos; ${awayName} promedia ${away.overallMetrics.goalsForAvg} GF y ${away.overallMetrics.goalsAgainstAvg} GC en ${aSample} juegos. ${h2hSnippet}`,
    });
  }

  if (odds.bttsYes > 1.05) {
    candidates.push({
      market: 'Ambos Equipos Marcan (Sí)',
      marketCategory: 'Tendencia Anotadora • Verificada',
      selection: 'Ambos Marcan: Sí',
      probPct: bttsProb,
      betanoOdd: betano?.bttsYes || odds.bttsYes,
      betplayOdd: betplay?.bttsYes || odds.bttsYes,
      avgOdd: odds.bttsYes,
      contextTag: `AA en muestra: ${home.overallMetrics.bttsCount}/${hSample} (L) y ${away.overallMetrics.bttsCount}/${aSample} (V)`,
      rationale: `En sus últimos partidos verificados, ambos anotaron en ${home.overallMetrics.bttsCount}/${hSample} juegos de ${homeName} y en ${away.overallMetrics.bttsCount}/${aSample} de ${awayName}.`,
    });
  }

  candidates.push({
    market: `Victoria ${homeName}`,
    marketCategory: 'Resultado 1X2 • Modelo Poisson',
    selection: homeName,
    probPct: homeWinProb,
    betanoOdd: betano?.home || odds.home,
    betplayOdd: betplay?.home || odds.home,
    avgOdd: odds.home,
    contextTag: `Forma verificada: ${home.overallMetrics.wins}V-${home.overallMetrics.draws}E-${home.overallMetrics.losses}D vs ${away.overallMetrics.wins}V-${away.overallMetrics.draws}E-${away.overallMetrics.losses}D`,
    rationale: `${homeName} registra ${home.overallMetrics.wins}V-${home.overallMetrics.draws}E-${home.overallMetrics.losses}D en ${hSample} partidos recientes frente a ${away.overallMetrics.wins}V-${away.overallMetrics.draws}E-${away.overallMetrics.losses}D de ${awayName}.`,
  });

  candidates.push({
    market: `Victoria ${awayName}`,
    marketCategory: 'Resultado 1X2 • Modelo Poisson',
    selection: awayName,
    probPct: awayWinProb,
    betanoOdd: betano?.away || odds.away,
    betplayOdd: betplay?.away || odds.away,
    avgOdd: odds.away,
    contextTag: `Visitante: ${away.overallMetrics.wins}V-${away.overallMetrics.draws}E-${away.overallMetrics.losses}D en últimos ${aSample}`,
    rationale: `${awayName} suma ${away.overallMetrics.wins} victorias y ${away.overallMetrics.goalsForAvg} goles/p en sus últimos ${aSample} juegos verificados.`,
  });

  const scored = candidates
    .map((c) => {
      const probDec = c.probPct / 100;
      const ev = (probDec * c.avgOdd - 1) * 100;
      const fairOdd = probDec > 0.05 ? Number((1 / probDec).toFixed(2)) : 10;
      return { ...c, ev: Number(ev.toFixed(1)), fairOdd };
    })
    .sort((a, b) => b.ev - a.ev);

  const best = scored[0];
  if (!best) {
    return {
      isOfficial: false,
      disclaimer:
        'Cálculo interno del modelo VORTEXTIPS basado en resultados históricos verificados (no constituye dato oficial).',
      sampleAdequate: true,
      sampleNote,
      homeWinProb,
      drawProb,
      awayWinProb,
      over25Prob,
      bttsProb,
      expectedGoalsHome: lambdaHome,
      expectedGoalsAway: lambdaAway,
      recommendedPick: {
        available: false,
        abstainReason: 'Sin mercados evaluables con las cuotas disponibles.',
      },
    };
  }

  return {
    isOfficial: false,
    disclaimer:
      'Cálculo interno del modelo VORTEXTIPS basado en resultados históricos verificados (no constituye dato oficial).',
    sampleAdequate: true,
    sampleNote,
    homeWinProb,
    drawProb,
    awayWinProb,
    over25Prob,
    bttsProb,
    expectedGoalsHome: lambdaHome,
    expectedGoalsAway: lambdaAway,
    recommendedPick: {
      available: true,
      market: best.market,
      marketCategory:
        best.ev > 0
          ? best.marketCategory
          : `${best.marketCategory} (Sin +EV positivo)`,
      selection: best.selection,
      betanoOdd: best.betanoOdd,
      betplayOdd: best.betplayOdd,
      bookmakerOdd: best.avgOdd,
      fairOdd: best.fairOdd,
      expectedValue: best.ev,
      impliedProb: best.probPct,
      rationale:
        best.ev > 0
          ? best.rationale
          : `${best.rationale} Nota: la cuota actual (${best.avgOdd.toFixed(2)}) no supera el umbral de valor positivo frente a la cuota justa calculada (${best.fairOdd.toFixed(2)}).`,
      contextTag:
        referee.state === 'VERIFIED' && referee.name
          ? `${best.contextTag} • Árb: ${referee.name}`
          : best.contextTag,
      confidenceLabel:
        best.ev >= 5 && best.probPct >= 50
          ? 'Alta coherencia estadística'
          : best.ev > 0
          ? 'Valor moderado detectado'
          : 'Sin ventaja (+EV) clara',
    },
  };
}

export async function buildVerifiedMatchDossier(params: {
  leagueSlug: string;
  eventId: string;
  homeTeamId?: string;
  awayTeamId?: string;
  odds?: MatchOdds;
}): Promise<VerifiedMatchDossier | null> {
  const { leagueSlug, eventId, odds } = params;
  const cacheKey = `${leagueSlug}_${eventId}`;
  const cached = dossierCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 120000 && !odds) {
    return cached.data;
  }

  const fetchedAt = new Date().toISOString();
  const exactSummary = await fetchExactMatchStats(leagueSlug, eventId);
  const rawSummary = exactSummary?.rawSummary;
  if (!rawSummary?.header?.competitions?.[0]) {
    return null;
  }

  const headerComp = rawSummary.header.competitions[0];
  const hComp = headerComp.competitors?.find((c: any) => c.homeAway === 'home');
  const aComp = headerComp.competitors?.find((c: any) => c.homeAway === 'away');
  if (!hComp || !aComp) return null;

  const homeTeamId = String(hComp.team?.id || hComp.id || params.homeTeamId || '');
  const awayTeamId = String(aComp.team?.id || aComp.id || params.awayTeamId || '');
  const homeTeamName = hComp.team?.displayName || 'Local';
  const awayTeamName = aComp.team?.displayName || 'Visitante';

  // Cross-check if caller specified expected team IDs
  if (params.homeTeamId && params.homeTeamId !== homeTeamId) return null;
  if (params.awayTeamId && params.awayTeamId !== awayTeamId) return null;

  const kickoffUtc = headerComp.date || new Date().toISOString();
  const kickoffDateObj = new Date(kickoffUtc);
  const kickoffCot = kickoffDateObj.toLocaleTimeString('es-CO', {
    timeZone: 'America/Bogota',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }) + ' COT';

  const state = headerComp.status?.type?.state;
  const status: Match['status'] =
    state === 'in'
      ? 'LIVE'
      : state === 'post'
      ? 'FINISHED'
      : state === 'postponed'
      ? 'POSTPONED'
      : 'SCHEDULED';

  const leagueMeta = LEAGUES_CONFIG.find((l) => l.slug === leagueSlug);
  const seasonYear = Number(rawSummary.header?.season?.year) || kickoffDateObj.getUTCFullYear();
  const seasonDisplay = String(rawSummary.header?.season?.displayName || seasonYear);

  // Fetch ESPN schedules (current + previous year for full 5-home / 5-away coverage), ESPN core officials, and FotMob match details in parallel
  const [
    homeSchedCur,
    homeSchedPrev,
    awaySchedCur,
    awaySchedPrev,
    coreOfficials,
    fotmobMatch,
  ] = await Promise.all([
    getEspnTeamSchedule(homeTeamId, seasonYear),
    getEspnTeamSchedule(homeTeamId, seasonYear - 1),
    getEspnTeamSchedule(awayTeamId, seasonYear),
    getEspnTeamSchedule(awayTeamId, seasonYear - 1),
    fetchJsonSafe(
      `https://sports.core.api.espn.com/v2/sports/soccer/leagues/${leagueSlug}/events/${eventId}/competitions/${eventId}/officials`
    ),
    findFotMobMatchForEspnEvent(kickoffUtc, homeTeamName, awayTeamName),
  ]);

  // If FotMob matched, also fetch FotMob team fixtures if ESPN schedule was short
  const [fmHomeTeam, fmAwayTeam] = await Promise.all([
    fotmobMatch?.homeTeamId ? getFotMobTeam(fotmobMatch.homeTeamId) : Promise.resolve(null),
    fotmobMatch?.awayTeamId ? getFotMobTeam(fotmobMatch.awayTeamId) : Promise.resolve(null),
  ]);

  const homeSchedEvents = [
    ...(homeSchedCur?.events || []),
    ...(homeSchedPrev?.events || []),
  ];
  const awaySchedEvents = [
    ...(awaySchedCur?.events || []),
    ...(awaySchedPrev?.events || []),
  ];

  // Extract ESPN summary.lastFiveGames per exact team ID
  const l5Blocks = Array.isArray(rawSummary.lastFiveGames) ? rawSummary.lastFiveGames : [];
  const homeL5Events = l5Blocks.find((b: any) => String(b.team?.id) === homeTeamId)?.events || [];
  const awayL5Events = l5Blocks.find((b: any) => String(b.team?.id) === awayTeamId)?.events || [];

  const homeHistoryAll = buildTeamMatchHistory(
    homeTeamId,
    homeTeamName,
    kickoffUtc,
    homeSchedEvents,
    homeL5Events,
    fotmobMatch?.homeTeamId,
    fmHomeTeam?.fixtures?.allFixtures?.fixtures || []
  );

  const awayHistoryAll = buildTeamMatchHistory(
    awayTeamId,
    awayTeamName,
    kickoffUtc,
    awaySchedEvents,
    awayL5Events,
    fotmobMatch?.awayTeamId,
    fmAwayTeam?.fixtures?.allFixtures?.fixtures || []
  );

  const homeLast5Overall = homeHistoryAll.slice(0, 5);
  const homeLast5Home = homeHistoryAll.filter((m) => m.homeTeamId === homeTeamId).slice(0, 5);

  const awayLast5Overall = awayHistoryAll.slice(0, 5);
  const awayLast5Away = awayHistoryAll.filter((m) => m.awayTeamId === awayTeamId).slice(0, 5);

  const calcRestDays = (hist: VerifiedHistoricalMatch[]) => {
    if (!hist.length) return null;
    const prevMs = new Date(hist[0].date).getTime();
    if (isNaN(prevMs)) return null;
    return Math.max(0, Math.round((kickoffDateObj.getTime() - prevMs) / 86400000));
  };

  // Referee 4-state resolution
  const espnOfficial =
    rawSummary.gameInfo?.officials?.[0]?.displayName ||
    headerComp.officials?.[0]?.displayName ||
    coreOfficials?.items?.[0]?.displayName ||
    null;

  const fmRef = fotmobMatch?.details?.content?.matchFacts?.infoBox?.Referee;
  const fmRefName: string | null = fmRef?.text || null;

  let referee: RefereeInfo;
  if (espnOfficial) {
    const statsList: any[] = Array.isArray(fmRef?.stats) && fmRefName ? fmRef.stats : [];
    const getFmRefStat = (t: string) => statsList.find((s) => s.type === t)?.value;
    const refMatches = getFmRefStat('matches');
    const refPenTotal = getFmRefStat('penalties');

    referee = {
      name: espnOfficial,
      country: fmRef?.country || leagueMeta?.name || leagueSlug,
      league: fmRef?.leagueName,
      state: 'VERIFIED',
      matchesCount: typeof refMatches === 'number' ? refMatches : null,
      yellowAvg: typeof getFmRefStat('yellowCards') === 'number' ? Number(getFmRefStat('yellowCards').toFixed(2)) : null,
      redTotal: typeof getFmRefStat('redCards') === 'number' ? getFmRefStat('redCards') : null,
      foulsAvg: typeof getFmRefStat('fouls') === 'number' ? Number(getFmRefStat('fouls').toFixed(2)) : null,
      penaltiesAvg:
        typeof refPenTotal === 'number' && typeof refMatches === 'number' && refMatches > 0
          ? Number((refPenTotal / refMatches).toFixed(2))
          : null,
      trendDescription: fmRefName
        ? `Designación oficial verificada en ESPN y FotMob (${fmRef?.leagueName || 'Competición'}).`
        : 'Designación oficial confirmada en ESPN; métricas históricas arbitrales no incluidas en este feed.',
      sourceMeta: {
        source: fmRefName ? 'ESPN GameInfo + FotMob InfoBox' : 'ESPN GameInfo Officials',
        resourceId: eventId,
        fetchedAt,
        status: 'VERIFICADO',
      },
    };
  } else if (fmRefName) {
    const statsList: any[] = Array.isArray(fmRef?.stats) ? fmRef.stats : [];
    const getFmRefStat = (t: string) => statsList.find((s) => s.type === t)?.value;
    const refMatches = getFmRefStat('matches');
    const refPenTotal = getFmRefStat('penalties');

    referee = {
      name: fmRefName,
      country: fmRef?.country || 'Oficial',
      league: fmRef?.leagueName,
      state: 'VERIFIED',
      matchesCount: typeof refMatches === 'number' ? refMatches : null,
      yellowAvg: typeof getFmRefStat('yellowCards') === 'number' ? Number(getFmRefStat('yellowCards').toFixed(2)) : null,
      redTotal: typeof getFmRefStat('redCards') === 'number' ? getFmRefStat('redCards') : null,
      foulsAvg: typeof getFmRefStat('fouls') === 'number' ? Number(getFmRefStat('fouls').toFixed(2)) : null,
      penaltiesAvg:
        typeof refPenTotal === 'number' && typeof refMatches === 'number' && refMatches > 0
          ? Number((refPenTotal / refMatches).toFixed(2))
          : null,
      trendDescription: `Árbitro oficial verificado en FotMob (ESPN no publicó el campo officials para este encuentro).`,
      sourceMeta: {
        source: 'FotMob Match Details InfoBox',
        resourceId: fotmobMatch?.fotmobMatchId,
        fetchedAt,
        status: 'VERIFICADO',
      },
    };
  } else {
    const hoursUntilKickoff = (kickoffDateObj.getTime() - Date.now()) / 3600000;
    const isPendingFuture = status === 'SCHEDULED' && hoursUntilKickoff > 24;
    referee = {
      name: isPendingFuture
        ? 'Designación pendiente'
        : 'Designación arbitral no accesible desde las fuentes disponibles',
      state: isPendingFuture ? 'PENDING_DESIGNATION' : 'NOT_ACCESSIBLE',
      matchesCount: null,
      yellowAvg: null,
      redTotal: null,
      foulsAvg: null,
      penaltiesAvg: null,
      trendDescription: isPendingFuture
        ? 'El partido aún supera el margen habitual de publicación de designaciones arbitrales.'
        : 'Se consultaron ESPN (Summary, Scoreboard, Core API) y FotMob sin hallar designación arbitral publicada.',
      sourceMeta: {
        source: 'ESPN API + FotMob API',
        resourceId: eventId,
        fetchedAt,
        status: 'NO DISPONIBLE',
      },
    };
  }

  // Absences / Injuries / Recoveries
  const homeAbsences = resolveAbsencesFromSources(
    rawSummary,
    homeTeamId,
    fotmobMatch?.details?.content?.lineup?.homeTeam,
    fetchedAt
  );
  const awayAbsences = resolveAbsencesFromSources(
    rawSummary,
    awayTeamId,
    fotmobMatch?.details?.content?.lineup?.awayTeam,
    fetchedAt
  );

  // Strict H2H (max 3)
  const seasonSeriesEvents = rawSummary.seasonseries?.[0]?.events || [];
  const h2hResult = buildStrictH2H(
    homeTeamId,
    awayTeamId,
    kickoffUtc,
    seasonSeriesEvents,
    homeSchedEvents,
    fotmobMatch
  );

  const homeSummary: VerifiedTeamSummary = {
    teamId: homeTeamId,
    teamName: homeTeamName,
    standings: extractStandingsForTeam(rawSummary, homeTeamId, fetchedAt),
    last5Overall: homeLast5Overall,
    last5Home: homeLast5Home,
    last5Away: [],
    restDays: calcRestDays(homeLast5Overall),
    overallMetrics: computeAggregateMetrics(homeLast5Overall, homeTeamId),
    splitMetrics: {
      split: 'home',
      ...computeAggregateMetrics(homeLast5Home, homeTeamId),
    },
    absences: homeAbsences,
    sourceMeta: {
      source: fotmobMatch ? 'ESPN Schedule/Summary + FotMob' : 'ESPN Schedule/Summary',
      resourceId: homeTeamId,
      fetchedAt,
      dataDate: homeLast5Overall[0]?.date,
      status: homeLast5Overall.length >= 3 ? 'VERIFICADO' : homeLast5Overall.length > 0 ? 'VERIFICADO PARCIALMENTE' : 'NO DISPONIBLE',
    },
  };

  const awaySummary: VerifiedTeamSummary = {
    teamId: awayTeamId,
    teamName: awayTeamName,
    standings: extractStandingsForTeam(rawSummary, awayTeamId, fetchedAt),
    last5Overall: awayLast5Overall,
    last5Home: [],
    last5Away: awayLast5Away,
    restDays: calcRestDays(awayLast5Overall),
    overallMetrics: computeAggregateMetrics(awayLast5Overall, awayTeamId),
    splitMetrics: {
      split: 'away',
      ...computeAggregateMetrics(awayLast5Away, awayTeamId),
    },
    absences: awayAbsences,
    sourceMeta: {
      source: fotmobMatch ? 'ESPN Schedule/Summary + FotMob' : 'ESPN Schedule/Summary',
      resourceId: awayTeamId,
      fetchedAt,
      dataDate: awayLast5Overall[0]?.date,
      status: awayLast5Overall.length >= 3 ? 'VERIFICADO' : awayLast5Overall.length > 0 ? 'VERIFICADO PARCIALMENTE' : 'NO DISPONIBLE',
    },
  };

  // Real match stats & lineups (include FotMob real expected_goals ONLY if FotMob actually provides it!)
  let mergedStats: DetailedMatchStats | null = exactSummary?.detailedStats || null;
  let hasXg = Boolean(mergedStats?.xg);

  const fmTopStats: any[] =
    fotmobMatch?.details?.content?.stats?.Periods?.All?.stats?.[0]?.stats || [];
  const fmXgRow = fmTopStats.find((s: any) => s.key === 'expected_goals');
  if (fmXgRow && Array.isArray(fmXgRow.stats) && fmXgRow.stats.length >= 2) {
    const xg0 = parseFloat(String(fmXgRow.stats[0]));
    const xg1 = parseFloat(String(fmXgRow.stats[1]));
    if (!isNaN(xg0) && !isNaN(xg1)) {
      mergedStats = {
        ...(mergedStats || {}),
        xg: [Number(xg0.toFixed(2)), Number(xg1.toFixed(2))],
        source: mergedStats?.source
          ? `${mergedStats.source} + FotMob xG`
          : 'FotMob Official Match Stats',
      };
      hasXg = true;
    }
  }

  // Also check FotMob lineups if ESPN didn't include confirmed rosters yet
  let rosters = exactSummary?.rosters;
  let lineupConfirmed = Boolean(rosters?.confirmed);
  const fmLineup = fotmobMatch?.details?.content?.lineup;
  if (!rosters && fmLineup?.homeTeam?.starters?.length && fmLineup?.awayTeam?.starters?.length) {
    const isConfirmed = String(fmLineup.lineupType || '').toLowerCase() === 'confirmed';
    const mapFmPlayers = (arr: any[]) =>
      arr.map((p: any) => ({
        name: p.name || 'Jugador',
        position: p.usualPlayingPositionId !== undefined ? String(p.positionId || '') : '',
        jersey: String(p.shirtNumber || '-'),
        isCaptain: Boolean(p.isCaptain),
      }));
    rosters = {
      confirmed: isConfirmed,
      formationHome: fmLineup.homeTeam.formation,
      formationAway: fmLineup.awayTeam.formation,
      coachHome: fmLineup.homeTeam.coach?.name,
      coachAway: fmLineup.awayTeam.coach?.name,
      home: mapFmPlayers(fmLineup.homeTeam.starters),
      away: mapFmPlayers(fmLineup.awayTeam.starters),
      benchHome: mapFmPlayers(fmLineup.homeTeam.subs || []),
      benchAway: mapFmPlayers(fmLineup.awayTeam.subs || []),
    };
    lineupConfirmed = isConfirmed;
  } else if (rosters && fmLineup?.homeTeam) {
    rosters = {
      ...rosters,
      formationHome: rosters.formationHome || fmLineup.homeTeam.formation,
      formationAway: rosters.formationAway || fmLineup.awayTeam?.formation,
      coachHome: fmLineup.homeTeam.coach?.name,
      coachAway: fmLineup.awayTeam?.coach?.name,
    };
  }

  const h2hData: VerifiedMatchDossier['h2h'] = {
    status: h2hResult.status,
    note: h2hResult.note,
    matches: h2hResult.matches,
    officialCount: h2hResult.officialCount,
    friendlyCount: h2hResult.friendlyCount,
    sourceMeta: {
      source: 'ESPN SeasonSeries / Team Schedule' + (fotmobMatch ? ' + FotMob H2H' : ''),
      resourceId: `${homeTeamId}_vs_${awayTeamId}`,
      fetchedAt,
      dataDate: h2hResult.matches[0]?.date,
      status: h2hResult.status,
    },
  };

  const modelEstimates = computeInternalModel(
    homeTeamName,
    awayTeamName,
    homeSummary,
    awaySummary,
    h2hData,
    referee,
    odds
  );

  const dossier: VerifiedMatchDossier = {
    identity: {
      eventId: String(eventId),
      leagueSlug,
      leagueName: leagueMeta?.name || rawSummary.header?.league?.name || leagueSlug,
      leagueCode: leagueMeta?.code || leagueSlug.toUpperCase(),
      season: seasonDisplay,
      kickoffUtc,
      kickoffCot,
      homeTeamId,
      homeTeamName,
      awayTeamId,
      awayTeamName,
      venue: exactSummary?.venue || rawSummary.gameInfo?.venue?.fullName,
      status,
      verified: true,
      fotmobMatchId: fotmobMatch?.fotmobMatchId,
      sourceMeta: {
        source: 'ESPN Summary Header',
        resourceId: String(eventId),
        fetchedAt,
        dataDate: kickoffUtc,
        status: 'VERIFICADO',
      },
    },
    referee,
    home: homeSummary,
    away: awaySummary,
    h2h: h2hData,
    officialMatchStats: {
      status: mergedStats ? 'VERIFICADO' : 'NO DISPONIBLE',
      sourceMeta: {
        source: mergedStats?.source || 'ESPN Match Summary',
        resourceId: String(eventId),
        fetchedAt,
        status: mergedStats ? 'VERIFICADO' : 'NO DISPONIBLE',
      },
      stats: mergedStats,
      hasXg,
      events: exactSummary?.events || [],
      rosters,
      lineupConfirmed,
    },
    modelEstimates,
  };

  dossierCache.set(cacheKey, { data: dossier, timestamp: Date.now() });
  return dossier;
}
