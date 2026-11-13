import React, { useEffect, useMemo, useState } from 'react';
import { Flame, ShieldCheck, ChevronRight, TrendingUp, AlertCircle } from 'lucide-react';
import { Match, ValidationStatus, VerifiedMatchDossier } from '../types/football';
import { getLeagueMeta } from '../utils/leagueUtils';
import { getDynamicDaysCarousel, getTodayTabInfo, formatColombia12h } from '../utils/dateUtils';
import { getLocalizedTeamName, getLocalizedMarketText } from '../utils/localization';
import {
  fetchRadarDossiers,
  UNAVAILABLE_DATA_MESSAGE,
  validateAndSanitizeDossier,
  validateMatchIdentifiers,
} from '../services/api';
import { CountryFlag } from './CountryFlag';

interface DayRadarBannerProps {
  selectedDate?: string;
  onSelectMatchById?: (matchId: string) => void;
  onOpenRadarAnalysis: (match: Match) => void;
  matches?: Match[];
}

interface RadarPick {
  id: string;
  matchId: string;
  match: Match;
  dossier?: VerifiedMatchDossier;
  teams: string;
  leagueName: string;
  leagueCode: string;
  country: string;
  leagueIcon: string;
  marketName: string;
  marketCategory: string;
  betanoOdd: number | null;
  betplayOdd: number | null;
  averageOdd: number | null;
  fairOdd: number | null;
  evPercent: number | null;
  impliedProb: number | null;
  keyContext: string;
  rationale: string;
  refereeInsight: string;
  validationStatus: ValidationStatus | 'CARGANDO';
  sourceSummary: string;
  statusText: string;
}

export const DayRadarBanner: React.FC<DayRadarBannerProps> = ({
  selectedDate,
  onSelectMatchById,
  onOpenRadarAnalysis,
  matches = [],
}) => {
  const currentDayInfo = useMemo(() => {
    const today = getTodayTabInfo();
    if (!selectedDate) return today;
    const days = getDynamicDaysCarousel();
    return days.find((d) => d.label === selectedDate) || today;
  }, [selectedDate]);

  const [dossiersMap, setDossiersMap] = useState<Record<string, VerifiedMatchDossier>>({});
  const [isLoadingDossiers, setIsLoadingDossiers] = useState<boolean>(false);
  const fetchedBatchKeysRef = React.useRef<Set<string>>(new Set());

  // Select up to 4 candidate matches strictly from the active day (or fallback pool if empty)
  const selectedMatches = useMemo(() => {
    const dayMatches = matches.filter((m) => {
      if (m.dateKey && currentDayInfo.dateKey) {
        return m.dateKey === currentDayInfo.dateKey;
      }
      return m.dateFormatted.includes(currentDayInfo.label);
    });

    const basePool = dayMatches.length > 0 ? dayMatches : matches;

    const leaguePriority: Record<string, number> = {
      UCL: 1,
      COL: 2,
      EPL: 3,
      ESP: 4,
      ITA: 5,
      GER: 6,
      FRA: 7,
      UNL: 8,
      LIB: 9,
      ESP2: 10,
    };

    const sortedPool = [...basePool].sort((a, b) => {
      // Prefer matches with valid identifiers, real odds, and real leagueSlug
      const validA = validateMatchIdentifiers(a).isValid ? 0 : 1;
      const validB = validateMatchIdentifiers(b).isValid ? 0 : 1;
      if (validA !== validB) return validA - validB;
      const oddsA = a.odds?.hasRealOdds ? 0 : 1;
      const oddsB = b.odds?.hasRealOdds ? 0 : 1;
      if (oddsA !== oddsB) return oddsA - oddsB;
      const prioA = leaguePriority[a.leagueCode] || 99;
      const prioB = leaguePriority[b.leagueCode] || 99;
      if (prioA !== prioB) return prioA - prioB;
      return (a.id || '').localeCompare(b.id || '');
    });

    const chosen: Match[] = [];
    for (const m of sortedPool) {
      if (chosen.length < 4 && !chosen.some((sm) => sm.id === m.id)) {
        chosen.push(m);
      }
    }
    return chosen;
  }, [matches, currentDayInfo]);

  const fetchableSignature = useMemo(
    () =>
      selectedMatches
        .filter((m) => Boolean(m.leagueSlug) && validateMatchIdentifiers(m).isValid)
        .map((m) => `${m.leagueSlug}:${m.id}:${m.homeTeam?.id || ''}:${m.awayTeam?.id || ''}:${m.dateKey || ''}`)
        .join('|'),
    [selectedMatches]
  );

  // Fetch verified dossiers for the selected 4 matches (only when valid match identifiers signature changes)
  useEffect(() => {
    if (!fetchableSignature) return;
    if (fetchedBatchKeysRef.current.has(fetchableSignature)) return;

    const fetchable = selectedMatches.filter(
      (m) => Boolean(m.leagueSlug) && validateMatchIdentifiers(m).isValid
    );
    if (fetchable.length === 0) return;

    fetchedBatchKeysRef.current.add(fetchableSignature);
    let cancelled = false;
    setIsLoadingDossiers(true);

    fetchRadarDossiers(fetchable)
      .then((res) => {
        if (!cancelled && res && Object.keys(res).length > 0) {
          setDossiersMap((prev) => ({ ...prev, ...res }));
        }
      })
      .catch(() => {
        fetchedBatchKeysRef.current.delete(fetchableSignature);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDossiers(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchableSignature]);

  const top4Picks: RadarPick[] = useMemo(() => {
    return selectedMatches.map((m) => {
      const idCheck = validateMatchIdentifiers(m);
      const rawDossier = dossiersMap[m.id] || m.verifiedDossier;
      const dossierCheck = idCheck.isValid
        ? validateAndSanitizeDossier(m, rawDossier)
        : { valid: false, dossier: null, validation: idCheck };
      const dossier = dossierCheck.valid ? dossierCheck.dossier : null;

      const leagueMeta = getLeagueMeta(m.league, m.leagueCode);
      const homeTeamName = getLocalizedTeamName(m.homeTeam.name);
      const awayTeamName = getLocalizedTeamName(m.awayTeam.name);
      const time12h = formatColombia12h(m.kickoffTime);

      if (!idCheck.isValid) {
        return {
          id: `radar-pick-${m.id}`,
          matchId: m.id,
          match: m,
          teams: `${homeTeamName} vs ${awayTeamName}`,
          leagueName: leagueMeta.shortName,
          leagueCode: m.leagueCode,
          country: leagueMeta.country,
          leagueIcon: leagueMeta.icon,
          marketName: UNAVAILABLE_DATA_MESSAGE,
          marketCategory: UNAVAILABLE_DATA_MESSAGE,
          betanoOdd: null,
          betplayOdd: null,
          averageOdd: null,
          fairOdd: null,
          evPercent: null,
          impliedProb: null,
          keyContext: `${UNAVAILABLE_DATA_MESSAGE}: faltan identificadores o fecha coherente.`,
          rationale: `${UNAVAILABLE_DATA_MESSAGE} (${idCheck.reasons.join(', ')}).`,
          refereeInsight: `Árbitro: ${UNAVAILABLE_DATA_MESSAGE}`,
          validationStatus: 'NO DISPONIBLE',
          sourceSummary: 'Validación de identidad',
          statusText: `🇨🇴 ${time12h}`,
        };
      }

      if (!dossier) {
        const hasRealOdds = Boolean(m.odds?.hasRealOdds && m.odds.home > 0);
        return {
          id: `radar-pick-${m.id}`,
          matchId: m.id,
          match: m,
          teams: `${homeTeamName} vs ${awayTeamName}`,
          leagueName: leagueMeta.shortName,
          leagueCode: m.leagueCode,
          country: leagueMeta.country,
          leagueIcon: leagueMeta.icon,
          marketName: isLoadingDossiers
            ? 'Verificando datos oficiales...'
            : UNAVAILABLE_DATA_MESSAGE,
          marketCategory: isLoadingDossiers ? 'Auditoría de Fuentes' : UNAVAILABLE_DATA_MESSAGE,
          betanoOdd: hasRealOdds ? (m.odds?.betano?.home ?? m.odds.home) : null,
          betplayOdd: hasRealOdds ? (m.odds?.betplay?.home ?? m.odds.home) : null,
          averageOdd: hasRealOdds ? m.odds.home : null,
          fairOdd: null,
          evPercent: null,
          impliedProb: null,
          keyContext:
            isLoadingDossiers && m.leagueSlug
              ? 'Validando eventId, IDs de equipo, fecha, H2H y estadísticas...'
              : `${UNAVAILABLE_DATA_MESSAGE} para H2H y estadísticas.`,
          rationale: isLoadingDossiers
            ? 'Validando últimos partidos oficiales, enfrentamientos directos y designación arbitral antes de emitir proyección.'
            : `${UNAVAILABLE_DATA_MESSAGE}: no fue posible validar de forma coherente los datos de este encuentro.`,
          refereeInsight: `Árbitro: ${isLoadingDossiers ? 'Verificando fuentes...' : UNAVAILABLE_DATA_MESSAGE}`,
          validationStatus: isLoadingDossiers ? 'CARGANDO' : 'NO DISPONIBLE',
          sourceSummary: 'ESPN API • FotMob API',
          statusText: `🇨🇴 ${time12h}`,
        };
      }

      const pick = dossier.modelEstimates.recommendedPick;
      const hasRealOdds = Boolean(m.odds?.hasRealOdds && pick.bookmakerOdd && pick.bookmakerOdd > 0);

      const ref = dossier.referee;
      let refereeInsight = '';
      if (ref.state === 'VERIFIED') {
        refereeInsight =
          ref.yellowAvg !== null && ref.yellowAvg !== undefined
            ? `Árbitro verificado: ${ref.name} (${ref.yellowAvg} amarillas/p)`
            : `Árbitro verificado: ${ref.name}`;
      } else if (ref.state === 'PENDING_DESIGNATION') {
        refereeInsight = 'Árbitro: Designación pendiente';
      } else {
        refereeInsight = 'Árbitro: No accesible en fuentes disponibles';
      }

      const hSample = dossier.home.overallMetrics.sampleSize;
      const aSample = dossier.away.overallMetrics.sampleSize;
      const validationStatus: ValidationStatus =
        hSample >= 3 && aSample >= 3 && dossier.h2h.matches.length > 0 && ref.state === 'VERIFIED'
          ? 'VERIFICADO'
          : hSample > 0 || aSample > 0
          ? 'VERIFICADO PARCIALMENTE'
          : 'NO DISPONIBLE';

      const bOdd = hasRealOdds ? (pick.betanoOdd ?? pick.bookmakerOdd ?? null) : null;
      const bpOdd = hasRealOdds ? (pick.betplayOdd ?? pick.bookmakerOdd ?? null) : null;
      const avgOdd = hasRealOdds ? (pick.bookmakerOdd ?? null) : null;

      return {
        id: `radar-pick-${m.id}`,
        matchId: m.id,
        match: { ...m, verifiedDossier: dossier, refereeInfo: ref },
        dossier,
        teams: `${homeTeamName} vs ${awayTeamName}`,
        leagueName: leagueMeta.shortName,
        leagueCode: m.leagueCode,
        country: leagueMeta.country,
        leagueIcon: leagueMeta.icon,
        marketName: pick.available && pick.market
          ? getLocalizedMarketText(pick.market)
          : 'Sin pick con valor verificable',
        marketCategory: pick.available && pick.marketCategory
          ? pick.marketCategory
          : 'Abstención por Veracidad',
        betanoOdd: bOdd,
        betplayOdd: bpOdd,
        averageOdd: avgOdd,
        fairOdd: pick.available && pick.fairOdd ? pick.fairOdd : null,
        evPercent: pick.available && typeof pick.expectedValue === 'number' ? pick.expectedValue : null,
        impliedProb: pick.available && typeof pick.impliedProb === 'number' ? pick.impliedProb : null,
        keyContext:
          pick.contextTag ||
          `Muestra verificada: ${hSample} juegos (L) • ${aSample} juegos (V) • H2H: ${dossier.h2h.matches.length}`,
        rationale:
          pick.available && pick.rationale
            ? pick.rationale
            : pick.abstainReason || dossier.modelEstimates.sampleNote,
        refereeInsight,
        validationStatus,
        sourceSummary: `${dossier.identity.sourceMeta.source}${dossier.identity.fotmobMatchId ? ' + FotMob' : ''}`,
        statusText: `🇨🇴 ${time12h}`,
      };
    });
  }, [selectedMatches, dossiersMap, isLoadingDossiers]);

  const statusBadgeClass = (status: RadarPick['validationStatus']) => {
    if (status === 'VERIFICADO') {
      return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
    }
    if (status === 'VERIFICADO PARCIALMENTE') {
      return 'bg-amber-950/80 text-amber-300 border-amber-500/40';
    }
    if (status === 'CARGANDO') {
      return 'bg-sky-950/80 text-sky-300 border-sky-500/40';
    }
    return 'bg-slate-800 text-slate-300 border-slate-600/50';
  };

  return (
    <div className="bg-[#172032] rounded-2xl border border-slate-750 shadow-sm p-4 sm:p-5 mb-6 text-slate-100">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-750">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0c1f38] text-sky-300 border border-sky-500/40 flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Flame className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Radar de la Jornada • Análisis Verificado
              </h2>
              <span className="text-[11px] font-semibold bg-[#0f2442] text-sky-200 border border-sky-500/40 px-2 py-0.5 rounded-md">
                {currentDayInfo.dayName} ({currentDayInfo.label})
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Datos oficiales validados por ID (ESPN & FotMob) separados del cálculo interno del modelo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Trazabilidad & Validación Activa</span>
        </div>
      </div>

      {/* 4 Pick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
        {top4Picks.map((pick, index) => (
          <div
            key={pick.id}
            className="bg-[#1a2436] rounded-xl border border-slate-700/80 p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-[10px] font-bold text-sky-200 bg-[#0e223d] border border-sky-500/30 px-2 py-0.5 rounded truncate max-w-[165px]">
                  #{index + 1} {pick.marketCategory}
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-semibold shrink-0">
                  {pick.statusText}
                </span>
              </div>

              <div className="flex items-center justify-between gap-1.5 text-[11px] text-slate-400 font-medium">
                <div className="flex items-center gap-1.5 truncate">
                  <CountryFlag
                    country={pick.country}
                    leagueCode={pick.leagueCode}
                    icon={pick.leagueIcon}
                    className="w-4 h-2.5 shadow-2xs shrink-0"
                  />
                  <span className="truncate">{pick.leagueName}</span>
                </div>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${statusBadgeClass(
                    pick.validationStatus
                  )}`}
                >
                  {pick.validationStatus}
                </span>
              </div>

              <h3 className="font-bold text-white text-sm mt-1 line-clamp-1">
                {pick.teams}
              </h3>

              {/* Market Name & EV Badge */}
              <div className="mt-2.5 p-2 bg-[#0a182d] rounded-lg border border-sky-500/30 flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-slate-200 truncate">
                  {pick.marketName}
                </span>
                {pick.evPercent !== null ? (
                  <span
                    className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono shrink-0 border ${
                      pick.evPercent > 0
                        ? 'text-sky-200 bg-sky-950/80 border-sky-500/40'
                        : 'text-slate-300 bg-slate-800 border-slate-600/40'
                    }`}
                  >
                    <TrendingUp className="w-3 h-3 text-sky-300" />
                    {pick.evPercent > 0 ? `+${pick.evPercent}%` : `${pick.evPercent}%`} EV
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-400 bg-slate-800/80 border border-slate-700 px-1.5 py-0.5 rounded font-mono shrink-0">
                    <AlertCircle className="w-3 h-3" />
                    N/D
                  </span>
                )}
              </div>

              {/* Key context strip */}
              <div className="mt-2 text-[10px] font-semibold text-slate-300 bg-slate-850/80 border border-slate-700/70 px-2 py-1 rounded line-clamp-2">
                ⚡ {pick.keyContext}
              </div>

              {/* Rationale & Referee insight */}
              <p className="text-[11px] text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                {pick.rationale}
              </p>
              <p className="text-[10px] text-slate-400 mt-1.5 italic line-clamp-1">
                ⚖️ {pick.refereeInsight}
              </p>
            </div>

            {/* Bottom: Odds Comparison & Action Button */}
            <div className="mt-4 pt-3 border-t border-slate-700/70">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-bold uppercase text-sky-300/80 tracking-wider">
                    Cuota Promedio
                  </div>
                  <div className="text-base font-extrabold text-white font-mono">
                    {pick.averageOdd !== null ? pick.averageOdd.toFixed(2) : 'N/D'}
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-400 font-mono">
                  <div>
                    Betano:{' '}
                    <strong className="text-slate-200">
                      {pick.betanoOdd !== null ? pick.betanoOdd.toFixed(2) : 'N/D'}
                    </strong>
                  </div>
                  <div>
                    BetPlay:{' '}
                    <strong className="text-slate-200">
                      {pick.betplayOdd !== null ? pick.betplayOdd.toFixed(2) : 'N/D'}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] font-medium text-slate-400">
                <span className="text-slate-400" title="Cálculo interno del modelo VORTEXTIPS">
                  Cuota Justa (Modelo):{' '}
                  <strong className="text-slate-200 font-mono">
                    {pick.fairOdd !== null ? pick.fairOdd.toFixed(2) : 'N/D'}
                  </strong>
                </span>
                <span className="text-emerald-400 font-mono font-bold">
                  {pick.impliedProb !== null ? `${pick.impliedProb}% est.` : 'Muestra N/D'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (pick.match) {
                    onOpenRadarAnalysis(pick.match);
                  } else if (onSelectMatchById) {
                    onSelectMatchById(pick.matchId);
                  }
                }}
                className="w-full mt-3 py-2 px-3 bg-[#0e2747] hover:bg-[#153866] border border-sky-500/50 text-sky-100 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer active:scale-98"
                title={`Ver análisis estadístico de ${pick.teams}`}
              >
                <span>Ver Análisis Estadístico</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
