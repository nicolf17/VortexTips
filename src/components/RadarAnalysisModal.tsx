import React, { useEffect, useState } from 'react';
import {
  X,
  TrendingUp,
  ShieldCheck,
  BarChart2,
  ShieldAlert,
  History,
  Flame,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Database,
  UserX,
} from 'lucide-react';
import {
  Match,
  ValidationStatus,
  VerifiedHistoricalMatch,
  VerifiedMatchDossier,
} from '../types/football';
import { getLeagueMeta } from '../utils/leagueUtils';
import { formatColombia12h } from '../utils/dateUtils';
import { getLocalizedTeamName, getLocalizedMarketText } from '../utils/localization';
import {
  fetchMatchDossier,
  UNAVAILABLE_DATA_MESSAGE,
  validateAndSanitizeDossier,
  validateMatchIdentifiers,
} from '../services/api';

interface RadarAnalysisModalProps {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleSelection?: (selection: any) => void;
}

const StatusBadge: React.FC<{ status: ValidationStatus }> = ({ status }) => {
  const styles: Record<ValidationStatus, string> = {
    VERIFICADO: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
    'VERIFICADO PARCIALMENTE': 'bg-amber-950/80 text-amber-300 border-amber-500/40',
    'NO DISPONIBLE': 'bg-slate-800 text-slate-300 border-slate-600/60',
    'NO VERIFICADO': 'bg-rose-950/80 text-rose-300 border-rose-500/40',
    DESACTUALIZADO: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
  };
  return (
    <span
      className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${
        styles[status] || styles['NO VERIFICADO']
      }`}
    >
      {status}
    </span>
  );
};

const HistoricalMatchRow: React.FC<{
  item: VerifiedHistoricalMatch;
  focusTeamId?: string;
}> = ({ item, focusTeamId }) => {
  const outcomeColor =
    item.outcomeForTeam === 'W'
      ? 'bg-emerald-600 text-white'
      : item.outcomeForTeam === 'D'
      ? 'bg-amber-600 text-white'
      : item.outcomeForTeam === 'L'
      ? 'bg-rose-600 text-white'
      : 'bg-slate-700 text-slate-200';
  const outcomeLetter =
    item.outcomeForTeam === 'W'
      ? 'V'
      : item.outcomeForTeam === 'D'
      ? 'E'
      : item.outcomeForTeam === 'L'
      ? 'D'
      : '';

  return (
    <div className="flex items-center justify-between gap-2 p-2 bg-[#0b101b] rounded-lg border border-slate-800 text-[11px]">
      <div className="flex items-center gap-2 min-w-0">
        {outcomeLetter && (
          <span
            className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center shrink-0 ${outcomeColor}`}
          >
            {outcomeLetter}
          </span>
        )}
        <div className="min-w-0">
          <div className="text-white font-semibold truncate">
            <span className={item.homeTeamId === focusTeamId ? 'text-sky-300' : ''}>
              {getLocalizedTeamName(item.homeTeamName)}
            </span>{' '}
            <span className="font-mono text-sky-200 font-bold">
              {item.homeScore} - {item.awayScore}
            </span>{' '}
            <span className={item.awayTeamId === focusTeamId ? 'text-sky-300' : ''}>
              {getLocalizedTeamName(item.awayTeamName)}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            {item.dateFormatted} • {item.competition}
            {!item.isOfficial && ' (Amistoso)'}
          </div>
        </div>
      </div>
    </div>
  );
};

export const RadarAnalysisModal: React.FC<RadarAnalysisModalProps> = ({
  match,
  isOpen,
  onClose,
  onToggleSelection,
}) => {
  const [rawDossier, setRawDossier] = useState<VerifiedMatchDossier | null>(
    () => match?.verifiedDossier ?? null
  );
  const [loading, setLoading] = useState<boolean>(false);

  const idValidation = React.useMemo(() => validateMatchIdentifiers(match), [match]);
  const dossierValidation = React.useMemo(
    () => validateAndSanitizeDossier(match, rawDossier),
    [match, rawDossier]
  );
  const dossier = dossierValidation.valid ? dossierValidation.dossier : null;

  useEffect(() => {
    if (!isOpen || !match) return;
    if (!idValidation.isValid || !match.leagueSlug) {
      setRawDossier(null);
      setLoading(false);
      return;
    }
    if (match.verifiedDossier) {
      const check = validateAndSanitizeDossier(match, match.verifiedDossier);
      if (check.valid && check.dossier) {
        setRawDossier(check.dossier);
        setLoading(false);
        return;
      }
    }
    let cancelled = false;
    setLoading(true);
    fetchMatchDossier(match)
      .then((res) => {
        if (!cancelled) setRawDossier(res);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, match?.id, match?.leagueSlug, match?.verifiedDossier, idValidation.isValid]);

  if (!isOpen || !match) return null;

  const leagueMeta = getLeagueMeta(match.league, match.leagueCode);
  const kickoffTime = dossier?.identity?.kickoffCot || formatColombia12h(match.kickoffTime || '');
  const homeTeamName = getLocalizedTeamName(
    dossier?.identity?.homeTeamName || match.homeTeam.name
  );
  const awayTeamName = getLocalizedTeamName(
    dossier?.identity?.awayTeamName || match.awayTeam.name
  );

  const hasRealOdds = Boolean(match.odds?.hasRealOdds && match.odds.home > 0);
  const pick = dossier?.modelEstimates?.recommendedPick;
  const referee = dossier?.referee || (idValidation.isValid ? match.refereeInfo : undefined);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#0b101b] rounded-2xl border border-sky-500/30 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#070b14]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-sky-950 border border-sky-500/40 flex items-center justify-center text-sky-400 font-bold shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-extrabold text-sky-200 bg-sky-950/80 border border-sky-500/30 px-2 py-0.5 rounded">
                  Análisis Auditado • Radar VORTEXTIPS
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  🇨🇴 {kickoffTime}
                </span>
                {dossier?.identity?.verified ? (
                  <StatusBadge status="VERIFICADO" />
                ) : (
                  <StatusBadge status="NO DISPONIBLE" />
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5 truncate">
                {homeTeamName} vs {awayTeamName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Exact Match Identification Strip */}
          <div className="bg-[#0f1726] rounded-xl p-3.5 border border-slate-800 text-[11px] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-300 flex-wrap">
              <Database className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>
                <strong>ID Evento:</strong>{' '}
                <span className="font-mono text-sky-300">
                  {dossier?.identity?.eventId || match.id || 'N/D'}
                </span>
              </span>
              <span>•</span>
              <span>
                <strong>Equipos ID:</strong>{' '}
                <span className="font-mono text-slate-200">
                  {dossier?.identity?.homeTeamId || match.homeTeam.id || 'N/D'} vs{' '}
                  {dossier?.identity?.awayTeamId || match.awayTeam.id || 'N/D'}
                </span>
              </span>
              <span>•</span>
              <span>
                <strong>Competición:</strong> {leagueMeta.name} (
                {dossier?.identity?.season || 'Temporada actual'})
              </span>
            </div>
            {dossier?.identity?.sourceMeta && (
              <span className="text-[10px] text-slate-400 font-mono">
                Consulta: {new Date(dossier.identity.sourceMeta.fetchedAt).toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit' })} COT
              </span>
            )}
          </div>

          {loading ? (
            <div className="p-10 rounded-xl bg-[#0f1726] border border-slate-800 flex flex-col items-center justify-center gap-2 text-xs text-slate-300">
              <RefreshCw className="w-6 h-6 animate-spin text-sky-400" />
              <span>Consultando y validando fuentes oficiales (ESPN & FotMob)...</span>
            </div>
          ) : !idValidation.isValid || !dossier ? (
            <div className="p-6 rounded-xl bg-[#0f1726] border border-amber-500/30 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <AlertTriangle className="w-4 h-4" />
                <span>{UNAVAILABLE_DATA_MESSAGE}</span>
              </div>
              <p>
                {!idValidation.isValid
                  ? `${UNAVAILABLE_DATA_MESSAGE}: no se pudo comprobar la presencia o coherencia de eventId, IDs de equipo o fecha (${idValidation.reasons.join(', ')}).`
                  : `${UNAVAILABLE_DATA_MESSAGE}: los identificadores o fechas de las fuentes externas no coinciden con este encuentro o el historial no pudo verificarse.`}
              </p>
            </div>
          ) : (
            <>
              {/* SECTION A: MODEL ESTIMATE (EXPLICITLY MARKED INTERNAL, NOT OFFICIAL) */}
              <div className="bg-gradient-to-r from-[#0d2342] to-[#09172e] rounded-xl p-5 border border-sky-500/40 shadow-lg space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
                    <TrendingUp className="w-4 h-4 text-sky-400" />
                    <span>CÁLCULO INTERNO DEL MODELO VORTEXTIPS (NO ES DATO OFICIAL)</span>
                  </div>
                  <span className="text-[10px] font-semibold text-sky-200 bg-sky-950/90 border border-sky-500/30 px-2 py-0.5 rounded">
                    {dossier.modelEstimates.sampleAdequate
                      ? 'Muestra suficiente'
                      : 'Muestra insuficiente'}
                  </span>
                </div>

                {pick?.available ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-extrabold text-white">
                        {getLocalizedMarketText(pick.market || '')} •{' '}
                        <span className="text-sky-300">
                          {getLocalizedTeamName(pick.selection || '')}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">{pick.rationale}</p>
                      <p className="text-[11px] text-slate-400">
                        {dossier.modelEstimates.sampleNote}
                      </p>
                    </div>

                    <div className="bg-[#070e1a] p-3.5 rounded-xl border border-sky-500/40 text-center shrink-0 min-w-[140px]">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Cuota Promedio
                      </div>
                      <div className="text-2xl font-black text-sky-300 font-mono mt-0.5">
                        {pick.bookmakerOdd ? pick.bookmakerOdd.toFixed(2) : 'N/D'}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-bold mt-1 font-mono">
                        {typeof pick.expectedValue === 'number'
                          ? `${pick.expectedValue > 0 ? '+' : ''}${pick.expectedValue}% EV (Modelo)`
                          : 'EV N/D'}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        Justa: {pick.fairOdd?.toFixed(2) || 'N/D'} • {pick.impliedProb}% est.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#070e1a]/80 p-3.5 rounded-xl border border-slate-700 text-xs text-slate-300">
                    <strong className="text-white block mb-1">
                      Sin proyección de valor (+EV) emitida:
                    </strong>
                    {pick?.abstainReason || dossier.modelEstimates.sampleNote}
                  </div>
                )}

                {dossier.modelEstimates.sampleAdequate && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-sky-500/20 text-center text-[11px] font-mono">
                    <div className="bg-[#070e1a]/70 p-2 rounded-lg">
                      <div className="text-[9px] text-slate-400 font-sans">1 (Modelo)</div>
                      <div className="font-bold text-white">{dossier.modelEstimates.homeWinProb}%</div>
                    </div>
                    <div className="bg-[#070e1a]/70 p-2 rounded-lg">
                      <div className="text-[9px] text-slate-400 font-sans">X (Modelo)</div>
                      <div className="font-bold text-white">{dossier.modelEstimates.drawProb}%</div>
                    </div>
                    <div className="bg-[#070e1a]/70 p-2 rounded-lg">
                      <div className="text-[9px] text-slate-400 font-sans">2 (Modelo)</div>
                      <div className="font-bold text-white">{dossier.modelEstimates.awayWinProb}%</div>
                    </div>
                    <div className="bg-[#070e1a]/70 p-2 rounded-lg">
                      <div className="text-[9px] text-slate-400 font-sans">+2.5G (Modelo)</div>
                      <div className="font-bold text-sky-300">{dossier.modelEstimates.over25Prob}%</div>
                    </div>
                    <div className="bg-[#070e1a]/70 p-2 rounded-lg">
                      <div className="text-[9px] text-slate-400 font-sans">BTTS (Modelo)</div>
                      <div className="font-bold text-sky-300">{dossier.modelEstimates.bttsProb}%</div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION B: OFFICIAL VERIFIED LAST 5 MATCHES (GENERAL + HOME/AWAY SPLITS) */}
              <div className="bg-[#0f1726] rounded-xl p-5 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Datos Oficiales: Últimos Partidos Verificados por ID</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Fuente: {dossier.home.sourceMeta.source}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Home Team Official Recent History */}
                  <div className="bg-[#0b101b] p-3.5 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-sky-300 text-xs">{homeTeamName} (Local)</div>
                        <div className="text-[10px] text-slate-400">
                          {dossier.home.standings?.rank
                            ? `Posición #${dossier.home.standings.rank} (${dossier.home.standings.points} pts) • `
                            : ''}
                          {dossier.home.restDays !== null
                            ? `Descanso: ${dossier.home.restDays} días`
                            : 'Descanso: N/D'}
                        </div>
                      </div>
                      <StatusBadge status={dossier.home.sourceMeta.status} />
                    </div>

                    {dossier.home.overallMetrics.sampleSize > 0 ? (
                      <>
                        <div className="text-[11px] text-slate-300 bg-[#0f1726] p-2 rounded-lg border border-slate-800 flex flex-wrap gap-x-3 gap-y-1 font-mono">
                          <span>
                            General ({dossier.home.overallMetrics.sampleSize}):{' '}
                            <strong className="text-white">
                              {dossier.home.overallMetrics.wins}V-{dossier.home.overallMetrics.draws}E-{dossier.home.overallMetrics.losses}D
                            </strong>
                          </span>
                          <span>
                            GF/GC:{' '}
                            <strong className="text-sky-300">
                              {dossier.home.overallMetrics.goalsForAvg} / {dossier.home.overallMetrics.goalsAgainstAvg}
                            </strong>
                          </span>
                          <span>
                            +2.5G:{' '}
                            <strong>
                              {dossier.home.overallMetrics.over25Count}/{dossier.home.overallMetrics.sampleSize}
                            </strong>
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="text-[10px] font-bold uppercase text-slate-400">
                            Últimos {dossier.home.last5Overall.length} Generales
                          </div>
                          {dossier.home.last5Overall.map((hm) => (
                            <HistoricalMatchRow
                              key={hm.eventId}
                              item={hm}
                              focusTeamId={dossier.home.teamId}
                            />
                          ))}
                        </div>
                        <div className="space-y-1.5 pt-2 border-t border-slate-800">
                          <div className="text-[10px] font-bold uppercase text-slate-400">
                            Últimos {dossier.home.last5Home.length} en Casa
                          </div>
                          {dossier.home.last5Home.length > 0 ? (
                            dossier.home.last5Home.map((hm) => (
                              <HistoricalMatchRow
                                key={`home-${hm.eventId}`}
                                item={hm}
                                focusTeamId={dossier.home.teamId}
                              />
                            ))
                          ) : (
                            <p className="text-[11px] text-slate-400">
                              Sin registros recientes como local en la muestra consultada.
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-slate-400">
                        Información no disponible en las fuentes consultadas.
                      </p>
                    )}
                  </div>

                  {/* Away Team Official Recent History */}
                  <div className="bg-[#0b101b] p-3.5 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-sky-300 text-xs">{awayTeamName} (Visitante)</div>
                        <div className="text-[10px] text-slate-400">
                          {dossier.away.standings?.rank
                            ? `Posición #${dossier.away.standings.rank} (${dossier.away.standings.points} pts) • `
                            : ''}
                          {dossier.away.restDays !== null
                            ? `Descanso: ${dossier.away.restDays} días`
                            : 'Descanso: N/D'}
                        </div>
                      </div>
                      <StatusBadge status={dossier.away.sourceMeta.status} />
                    </div>

                    {dossier.away.overallMetrics.sampleSize > 0 ? (
                      <>
                        <div className="text-[11px] text-slate-300 bg-[#0f1726] p-2 rounded-lg border border-slate-800 flex flex-wrap gap-x-3 gap-y-1 font-mono">
                          <span>
                            General ({dossier.away.overallMetrics.sampleSize}):{' '}
                            <strong className="text-white">
                              {dossier.away.overallMetrics.wins}V-{dossier.away.overallMetrics.draws}E-{dossier.away.overallMetrics.losses}D
                            </strong>
                          </span>
                          <span>
                            GF/GC:{' '}
                            <strong className="text-sky-300">
                              {dossier.away.overallMetrics.goalsForAvg} / {dossier.away.overallMetrics.goalsAgainstAvg}
                            </strong>
                          </span>
                          <span>
                            +2.5G:{' '}
                            <strong>
                              {dossier.away.overallMetrics.over25Count}/{dossier.away.overallMetrics.sampleSize}
                            </strong>
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="text-[10px] font-bold uppercase text-slate-400">
                            Últimos {dossier.away.last5Overall.length} Generales
                          </div>
                          {dossier.away.last5Overall.map((am) => (
                            <HistoricalMatchRow
                              key={am.eventId}
                              item={am}
                              focusTeamId={dossier.away.teamId}
                            />
                          ))}
                        </div>
                        <div className="space-y-1.5 pt-2 border-t border-slate-800">
                          <div className="text-[10px] font-bold uppercase text-slate-400">
                            Últimos {dossier.away.last5Away.length} de Visitante
                          </div>
                          {dossier.away.last5Away.length > 0 ? (
                            dossier.away.last5Away.map((am) => (
                              <HistoricalMatchRow
                                key={`away-${am.eventId}`}
                                item={am}
                                focusTeamId={dossier.away.teamId}
                              />
                            ))
                          ) : (
                            <p className="text-[11px] text-slate-400">
                              Sin registros recientes como visitante en la muestra consultada.
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-slate-400">
                        Información no disponible en las fuentes consultadas.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION C: VERIFIED H2H (MAX 3) & VERIFIED ABSENCES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* H2H */}
                <div className="bg-[#0f1726] rounded-xl p-4 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-white text-xs flex items-center gap-2">
                      <History className="w-4 h-4 text-sky-400" />
                      <span>Enfrentamientos Directos (H2H • Máx. 3)</span>
                    </h4>
                    <StatusBadge status={dossier.h2h.status} />
                  </div>
                  <p className="text-[11px] text-slate-400">{dossier.h2h.note}</p>
                  {dossier.h2h.matches.length > 0 ? (
                    <div className="space-y-1.5">
                      {dossier.h2h.matches.map((h) => (
                        <HistoricalMatchRow key={h.eventId} item={h} />
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-[#0b101b] rounded-lg border border-slate-800 text-xs text-slate-400">
                      Historial de enfrentamientos directos no disponible o insuficiente para este encuentro.
                    </div>
                  )}
                  <div className="text-[10px] text-slate-500 font-mono">
                    Fuente: {dossier.h2h.sourceMeta.source}
                  </div>
                </div>

                {/* Absences / Injuries / Recoveries */}
                <div className="bg-[#0f1726] rounded-xl p-4 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-white text-xs flex items-center gap-2">
                      <UserX className="w-4 h-4 text-rose-400" />
                      <span>Bajas, Lesiones y Suspensiones</span>
                    </h4>
                    <StatusBadge status={dossier.home.absences.status} />
                  </div>

                  {dossier.home.absences.status === 'NO DISPONIBLE' &&
                  dossier.away.absences.status === 'NO DISPONIBLE' ? (
                    <div className="p-3 bg-[#0b101b] rounded-lg border border-slate-800 text-xs text-slate-300">
                      No hay información verificable sobre bajas o recuperaciones para este encuentro en las fuentes consultadas.
                    </div>
                  ) : (
                    <div className="space-y-2.5 text-xs">
                      <div className="bg-[#0b101b] p-2.5 rounded-lg border border-slate-800">
                        <div className="font-bold text-sky-300 mb-1">{homeTeamName}</div>
                        {dossier.home.absences.items.length > 0 ? (
                          <ul className="space-y-1">
                            {dossier.home.absences.items.map((ab, idx) => (
                              <li key={idx} className="flex justify-between gap-2 text-[11px]">
                                <span className="text-white font-medium">{ab.playerName}</span>
                                <span className="text-rose-300 font-mono">
                                  {ab.reasonLabel}
                                  {ab.expectedReturn ? ` (${ab.expectedReturn})` : ''}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            {dossier.home.absences.note}
                          </span>
                        )}
                      </div>

                      <div className="bg-[#0b101b] p-2.5 rounded-lg border border-slate-800">
                        <div className="font-bold text-sky-300 mb-1">{awayTeamName}</div>
                        {dossier.away.absences.items.length > 0 ? (
                          <ul className="space-y-1">
                            {dossier.away.absences.items.map((ab, idx) => (
                              <li key={idx} className="flex justify-between gap-2 text-[11px]">
                                <span className="text-white font-medium">{ab.playerName}</span>
                                <span className="text-rose-300 font-mono">
                                  {ab.reasonLabel}
                                  {ab.expectedReturn ? ` (${ab.expectedReturn})` : ''}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            {dossier.away.absences.note}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="text-[10px] text-slate-500 font-mono">
                    Fuente: {dossier.home.absences.sourceMeta.source}
                  </div>
                </div>
              </div>

              {/* SECTION D: REFEREE (4 STATES) & REAL ODDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0f1726] rounded-xl p-4 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-white text-xs flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <span>Designación Arbitral Verificada</span>
                    </h4>
                    <StatusBadge
                      status={referee?.sourceMeta?.status || 'NO DISPONIBLE'}
                    />
                  </div>

                  <div className="bg-[#0b101b] p-3 rounded-lg border border-slate-800 text-xs space-y-2">
                    <div className="flex justify-between font-bold text-white gap-2">
                      <span>{referee?.name || 'Designación arbitral no accesible desde las fuentes disponibles'}</span>
                      {referee?.country && (
                        <span className="text-amber-400 font-mono shrink-0">
                          {referee.country}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {referee?.trendDescription}
                    </p>
                    {referee?.state === 'VERIFIED' &&
                    (referee.yellowAvg !== null && referee.yellowAvg !== undefined) ? (
                      <div className="pt-2 border-t border-slate-800 grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-400">
                        <span>
                          Amarillas/p: <strong className="text-white">{referee.yellowAvg}</strong>
                        </span>
                        <span>
                          Faltas/p:{' '}
                          <strong className="text-white">{referee.foulsAvg ?? 'N/D'}</strong>
                        </span>
                        <span>
                          Partidos:{' '}
                          <strong className="text-white">{referee.matchesCount ?? 'N/D'}</strong>
                        </span>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                        Métricas históricas del árbitro no disponibles en las fuentes consultadas.
                      </div>
                    )}
                    {referee?.sourceMeta && (
                      <div className="text-[10px] text-slate-500 font-mono">
                        Fuente: {referee.sourceMeta.source}
                      </div>
                    )}
                  </div>
                </div>

                {/* Odds Comparison Grid */}
                <div className="bg-[#0f1726] rounded-xl p-4 border border-slate-800 space-y-3">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-sky-400" />
                    <span>Cuotas Consultadas</span>
                  </h4>

                  {hasRealOdds ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 bg-[#0b101b] rounded-lg border border-slate-800 font-mono">
                        <span className="text-slate-300">Betano (Ref.)</span>
                        <span className="font-bold text-sky-300">
                          {(pick?.betanoOdd ?? match.odds.betano?.home ?? match.odds.home).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-[#0b101b] rounded-lg border border-slate-800 font-mono">
                        <span className="text-slate-300">BetPlay (Ref.)</span>
                        <span className="font-bold text-sky-300">
                          {(pick?.betplayOdd ?? match.odds.betplay?.home ?? match.odds.home).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-[#070e1a] rounded-lg border border-sky-500/30 font-mono">
                        <span className="text-slate-300 font-semibold font-sans">
                          Cuota Justa (Modelo Interno)
                        </span>
                        <span className="font-bold text-emerald-400">
                          {pick?.fairOdd ? pick.fairOdd.toFixed(2) : 'N/D'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-[#0b101b] rounded-lg border border-slate-800 text-xs text-slate-400">
                      Sin cuotas oficiales publicadas para este partido en las fuentes consultadas.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Action button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cerrar Análisis
            </button>
            {onToggleSelection && pick?.available && pick.bookmakerOdd && (
              <button
                type="button"
                onClick={() => {
                  onToggleSelection({
                    id: `${match.id}-${pick.market}`,
                    matchId: match.id,
                    matchTitle: `${homeTeamName} vs ${awayTeamName}`,
                    league: leagueMeta.name,
                    marketName: getLocalizedMarketText(pick.market || ''),
                    selectionName: getLocalizedTeamName(pick.selection || ''),
                    odd: pick.bookmakerOdd,
                    modelProb: pick.impliedProb || 50,
                    hasValue: (pick.expectedValue || 0) > 0,
                    expectedValue: pick.expectedValue,
                  });
                  onClose();
                }}
                className="py-2.5 px-6 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-lg shadow-sky-600/20 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Añadir Selección al Slip</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
