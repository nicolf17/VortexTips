import React, { useEffect, useState } from 'react';
import {
  X,
  ShieldAlert,
  BarChart2,
  Users,
  History,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import { Match, VerifiedMatchDossier } from '../types/football';
import { getLeagueMeta } from '../utils/leagueUtils';
import { formatColombia12h } from '../utils/dateUtils';
import { getLocalizedTeamName } from '../utils/localization';
import { fetchMatchDossier } from '../services/api';

interface FlashscoreDetailModalProps {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleSelection?: (selection: any) => void;
  selectedSelections?: any[];
}

export const FlashscoreDetailModal: React.FC<FlashscoreDetailModalProps> = ({
  match,
  isOpen,
  onClose,
}) => {
  const [dossier, setDossier] = useState<VerifiedMatchDossier | null>(
    () => match?.verifiedDossier ?? null
  );
  const [loadingDossier, setLoadingDossier] = useState<boolean>(false);

  const isLive = match?.status === 'LIVE';
  const isFinished = match?.status === 'FINISHED';

  const [activeTab, setActiveTab] = useState<
    'events' | 'stats' | 'lineups' | 'markets' | 'referee' | 'h2h'
  >(isLive || isFinished ? 'events' : 'markets');

  useEffect(() => {
    if (!match) return;
    setActiveTab(match.status === 'LIVE' || match.status === 'FINISHED' ? 'events' : 'markets');
  }, [match?.id]);

  useEffect(() => {
    if (!isOpen || !match) return;
    if (match.verifiedDossier) {
      setDossier(match.verifiedDossier);
      setLoadingDossier(false);
      return;
    }
    if (!match.leagueSlug) {
      setDossier(null);
      setLoadingDossier(false);
      return;
    }
    let cancelled = false;
    setLoadingDossier(true);
    fetchMatchDossier(match)
      .then((res) => {
        if (!cancelled) setDossier(res);
      })
      .finally(() => {
        if (!cancelled) setLoadingDossier(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, match?.id, match?.leagueSlug, match?.verifiedDossier]);

  if (!isOpen || !match) return null;

  const leagueMeta = getLeagueMeta(match.league, match.leagueCode);
  const homeTeamName = getLocalizedTeamName(
    dossier?.identity?.homeTeamName || match.homeTeam.name
  );
  const awayTeamName = getLocalizedTeamName(
    dossier?.identity?.awayTeamName || match.awayTeam.name
  );
  const homeTeamShort = getLocalizedTeamName(match.homeTeam.shortName);
  const awayTeamShort = getLocalizedTeamName(match.awayTeam.shortName);

  const hasRealOdds = Boolean(match.odds?.hasRealOdds && match.odds.home > 0);
  const betano = match.odds?.betano;
  const betplay = match.odds?.betplay;

  const referee = dossier?.referee || match.refereeInfo;
  const kickoffTime = dossier?.identity?.kickoffCot || formatColombia12h(match.kickoffTime || '');

  const homeAvg =
    hasRealOdds && betano && betplay
      ? ((betano.home + betplay.home) / 2).toFixed(2)
      : hasRealOdds
      ? match.odds.home.toFixed(2)
      : 'N/D';
  const drawAvg =
    hasRealOdds && betano && betplay
      ? ((betano.draw + betplay.draw) / 2).toFixed(2)
      : hasRealOdds && match.odds.draw > 0
      ? match.odds.draw.toFixed(2)
      : 'N/D';
  const awayAvg =
    hasRealOdds && betano && betplay
      ? ((betano.away + betplay.away) / 2).toFixed(2)
      : hasRealOdds
      ? match.odds.away.toFixed(2)
      : 'N/D';

  const homeProb =
    homeAvg !== 'N/D' ? Math.min(95, Math.max(5, Math.round((1 / parseFloat(homeAvg)) * 100))) : null;
  const drawProb =
    drawAvg !== 'N/D' ? Math.min(95, Math.max(5, Math.round((1 / parseFloat(drawAvg)) * 100))) : null;
  const awayProb =
    awayAvg !== 'N/D' ? Math.min(95, Math.max(5, Math.round((1 / parseFloat(awayAvg)) * 100))) : null;

  // Derive real form from verified dossier last5Overall first, else scoreboard form
  const homeForm: ('W' | 'D' | 'L')[] = dossier?.home?.last5Overall?.length
    ? dossier.home.last5Overall
        .map((m) => m.outcomeForTeam)
        .filter((x): x is 'W' | 'D' | 'L' => Boolean(x))
    : match.homeTeam?.stats?.form || [];

  const awayForm: ('W' | 'D' | 'L')[] = dossier?.away?.last5Overall?.length
    ? dossier.away.last5Overall
        .map((m) => m.outcomeForTeam)
        .filter((x): x is 'W' | 'D' | 'L' => Boolean(x))
    : match.awayTeam?.stats?.form || [];

  const rosters = dossier?.officialMatchStats?.rosters || match.rosters;
  const lineupConfirmed = Boolean(dossier?.officialMatchStats?.lineupConfirmed || rosters?.confirmed);
  const homeStarters = rosters?.home || [];
  const awayStarters = rosters?.away || [];
  const homeBench = rosters?.benchHome || [];
  const awayBench = rosters?.benchAway || [];

  const matchEvents =
    (dossier?.officialMatchStats?.events?.length
      ? dossier.officialMatchStats.events
      : match.events) || [];

  const stats = dossier?.officialMatchStats?.stats ?? match.detailedStats ?? null;
  const possHome = stats?.possession?.[0];
  const possAway = stats?.possession?.[1];

  const h2hMatches = dossier?.h2h?.matches || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#141d2e] rounded-2xl border border-slate-750 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-750 flex items-center justify-between bg-[#0f1725]">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex items-center gap-1.5 font-bold text-white bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md text-xs shadow-xs shrink-0">
              <span>{leagueMeta.icon}</span>
              <span>{leagueMeta.shortName}</span>
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline truncate">
              🇨🇴 {kickoffTime} {match.stadium ? `• ${match.stadium}` : ''} • ID {match.id}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Match Scoreboard Banner */}
        <div className="px-6 py-5 bg-[#162236] border-b border-slate-750">
          <div className="grid grid-cols-12 items-center">
            {/* Home Team */}
            <div className="col-span-5 flex flex-col items-center sm:flex-row sm:items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#0f1725] border border-slate-700 flex items-center justify-center font-bold text-white shadow-xs overflow-hidden shrink-0">
                {match.homeTeam.logo ? (
                  <img
                    src={match.homeTeam.logo}
                    alt={homeTeamName}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  homeTeamShort || homeTeamName.substring(0, 3).toUpperCase()
                )}
              </div>
              <div className="text-center sm:text-left min-w-0">
                <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight truncate">
                  {homeTeamName}
                </h3>
                <div className="flex items-center justify-center sm:justify-start gap-1 mt-1 text-xs text-slate-400">
                  <span>Forma:</span>
                  {homeForm.length > 0 ? (
                    <div className="flex gap-0.5">
                      {homeForm.slice(0, 5).map((f, i) => (
                        <span
                          key={i}
                          className={`w-3.5 h-3.5 rounded text-[8px] font-bold flex items-center justify-center text-white ${
                            f === 'W'
                              ? 'bg-emerald-600'
                              : f === 'D'
                              ? 'bg-amber-600'
                              : 'bg-rose-600'
                          }`}
                        >
                          {f === 'W' ? 'V' : f === 'D' ? 'E' : 'D'}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">N/D</span>
                  )}
                </div>
              </div>
            </div>

            {/* Center Status / Score */}
            <div className="col-span-2 text-center flex flex-col items-center">
              {isLive || isFinished ? (
                <>
                  <div className="px-4 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-xl font-mono font-extrabold text-2xl shadow-inner tracking-wider">
                    {match.homeScore ?? 0} - {match.awayScore ?? 0}
                  </div>
                  <span
                    className={`text-[11px] font-bold mt-1.5 flex items-center gap-1.5 ${
                      isLive ? 'text-sky-400 animate-pulse' : 'text-slate-400'
                    }`}
                  >
                    {isLive && <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>}
                    {isLive ? `EN VIVO ${match.minute ? `${match.minute}'` : ''}` : 'Finalizado'}
                  </span>
                </>
              ) : (
                <>
                  <div className="px-3.5 py-1.5 bg-[#0f2442] text-sky-200 border border-sky-500/50 rounded-xl font-mono font-bold text-xs shadow-xs flex flex-col items-center">
                    <span className="text-[10px] text-sky-300 font-extrabold tracking-wider">
                      PROGRAMADO
                    </span>
                    <span className="text-white text-sm mt-0.5">{kickoffTime}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium mt-1">
                    🇨🇴 Hora Colombia
                  </span>
                </>
              )}
            </div>

            {/* Away Team */}
            <div className="col-span-5 flex flex-col-reverse items-center sm:flex-row sm:items-center sm:justify-end gap-3 text-center sm:text-right">
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight truncate">
                  {awayTeamName}
                </h3>
                <div className="flex items-center justify-center sm:justify-end gap-1 mt-1 text-xs text-slate-400">
                  {awayForm.length > 0 ? (
                    <div className="flex gap-0.5">
                      {awayForm.slice(0, 5).map((f, i) => (
                        <span
                          key={i}
                          className={`w-3.5 h-3.5 rounded text-[8px] font-bold flex items-center justify-center text-white ${
                            f === 'W'
                              ? 'bg-emerald-600'
                              : f === 'D'
                              ? 'bg-amber-600'
                              : 'bg-rose-600'
                          }`}
                        >
                          {f === 'W' ? 'V' : f === 'D' ? 'E' : 'D'}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">N/D</span>
                  )}
                  <span>:Forma</span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#0f1725] border border-slate-700 flex items-center justify-center font-bold text-white shadow-xs overflow-hidden shrink-0">
                {match.awayTeam.logo ? (
                  <img
                    src={match.awayTeam.logo}
                    alt={awayTeamName}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  awayTeamShort || awayTeamName.substring(0, 3).toUpperCase()
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 border-b border-slate-750 bg-[#0f1725] overflow-x-auto text-xs font-semibold scrollbar-none">
          {(isLive || isFinished) && (
            <button
              onClick={() => setActiveTab('events')}
              className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'events'
                  ? 'border-sky-500 text-sky-200 bg-[#0e223d]'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4 text-sky-400" />
              Eventos Oficiales
            </button>
          )}
          {(isLive || isFinished) && (
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'stats'
                  ? 'border-sky-500 text-sky-200 bg-[#0e223d]'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-sky-400" />
              Estadísticas
            </button>
          )}
          <button
            onClick={() => setActiveTab('markets')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'markets'
                ? 'border-sky-500 text-sky-200 bg-[#0e223d]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-sky-400" />
            Mercados & Cuotas
          </button>
          <button
            onClick={() => setActiveTab('lineups')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'lineups'
                ? 'border-sky-500 text-sky-200 bg-[#0e223d]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-sky-400" />
            Alineaciones & Bajas
          </button>
          <button
            onClick={() => setActiveTab('referee')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'referee'
                ? 'border-sky-500 text-sky-200 bg-[#0e223d]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-sky-400" />
            Árbitro & Disciplina
          </button>
          <button
            onClick={() => setActiveTab('h2h')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'h2h'
                ? 'border-sky-500 text-sky-200 bg-[#0e223d]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4 text-sky-400" />
            Cara a Cara (H2H)
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loadingDossier && (
            <div className="flex items-center gap-2 text-xs text-sky-300 bg-[#0f1725] border border-sky-500/30 rounded-lg px-3 py-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Verificando árbitro, bajas, H2H y últimos partidos en fuentes oficiales...</span>
            </div>
          )}

          {/* TAB: EVENTS */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              <div className="bg-[#182337] rounded-xl p-4 border border-slate-750">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-750">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                    Cronología de Eventos Oficiales (ESPN Summary)
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {isLive
                      ? `Minuto: ${match.minute || ''}'`
                      : isFinished
                      ? 'Partido Finalizado'
                      : 'Programado'}
                  </span>
                </div>

                {matchEvents.length > 0 ? (
                  <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
                    {matchEvents.map((ev, idx) => {
                      const isHome = ev.team === 'home';
                      const lower = `${ev.type} ${ev.text}`.toLowerCase();
                      const isGoal = lower.includes('goal') || lower.includes('gol');
                      const isYellow = lower.includes('yellow') || lower.includes('amarilla');
                      const isRed = lower.includes('red') || lower.includes('roja');
                      const isSub = lower.includes('sub') || lower.includes('sustitu');

                      return (
                        <div key={idx} className="relative flex items-start gap-3 text-xs">
                          <div
                            className={`absolute -left-6 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ${
                              isGoal
                                ? 'bg-emerald-500 text-white'
                                : isYellow
                                ? 'bg-amber-500 text-slate-900 font-black'
                                : isRed
                                ? 'bg-rose-600 text-white'
                                : isSub
                                ? 'bg-sky-600 text-white'
                                : 'bg-slate-700 text-slate-200'
                            }`}
                          >
                            {isGoal ? '⚽' : isYellow ? '🟨' : isRed ? '🟥' : isSub ? '🔄' : '📺'}
                          </div>

                          <div
                            className={`flex-1 p-3 rounded-xl border ${
                              isHome
                                ? 'bg-[#121c2d] border-sky-500/30'
                                : 'bg-[#151f30] border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono font-bold text-sky-400 text-xs">
                                {ev.minute}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400">
                                {ev.team === 'home'
                                  ? homeTeamName
                                  : ev.team === 'away'
                                  ? awayTeamName
                                  : ''}
                              </span>
                            </div>

                            <div className="font-bold text-white text-xs mt-1">{ev.text}</div>

                            {ev.player && (
                              <div className="text-[11px] text-slate-300 mt-0.5">
                                Jugador: <strong className="text-white">{ev.player}</strong>
                              </div>
                            )}

                            {ev.subIn && ev.subOut && (
                              <div className="flex items-center gap-3 text-[11px] mt-1 text-slate-300">
                                <span className="text-emerald-400 flex items-center gap-0.5">
                                  <ArrowUpRight className="w-3.5 h-3.5" /> Entra:{' '}
                                  <strong>{ev.subIn}</strong>
                                </span>
                                <span className="text-rose-400 flex items-center gap-0.5">
                                  <ArrowDownRight className="w-3.5 h-3.5" /> Sale:{' '}
                                  <strong>{ev.subOut}</strong>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    No hay eventos oficiales registrados en la fuente consultada para este encuentro.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: STATS COMPARISON */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <div className="bg-[#182337] rounded-xl p-4 border border-slate-750">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-white text-sm">
                    Estadísticas Oficiales del Partido
                  </h4>
                  <div className="flex items-center gap-4 text-xs font-bold">
                    <span className="text-sky-400">{homeTeamName}</span>
                    <span className="text-slate-400 font-normal">vs</span>
                    <span className="text-slate-300">{awayTeamName}</span>
                  </div>
                </div>

                {!stats ? (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    Estadísticas detalladas de boxscore no disponibles en las fuentes consultadas para este partido.
                  </div>
                ) : (
                  <div className="space-y-4 text-xs">
                    {possHome !== undefined && possAway !== undefined && (
                      <div>
                        <div className="flex justify-between font-bold text-slate-200 mb-1 font-mono">
                          <span className="text-sky-300">{possHome}%</span>
                          <span className="font-sans font-semibold text-slate-400">
                            Posesión de Balón
                          </span>
                          <span>{possAway}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                          <div className="bg-sky-500 h-full" style={{ width: `${possHome}%` }}></div>
                          <div className="bg-slate-600 h-full" style={{ width: `${possAway}%` }}></div>
                        </div>
                      </div>
                    )}

                    {stats.xg && (
                      <div>
                        <div className="flex justify-between font-bold text-slate-200 mb-1 font-mono">
                          <span className="text-sky-300">{stats.xg[0]}</span>
                          <span className="font-sans font-semibold text-slate-400">
                            Goles Esperados (xG Oficial)
                          </span>
                          <span>{stats.xg[1]}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                          <div
                            className="bg-sky-500 h-full"
                            style={{
                              width: `${Math.round(
                                (stats.xg[0] / (stats.xg[0] + stats.xg[1] || 1)) * 100
                              )}%`,
                            }}
                          ></div>
                          <div className="bg-slate-600 h-full flex-1"></div>
                        </div>
                      </div>
                    )}

                    {stats.shotsTotal && (
                      <div>
                        <div className="flex justify-between font-bold text-slate-200 mb-1 font-mono">
                          <span className="text-sky-300">{stats.shotsTotal[0]}</span>
                          <span className="font-sans font-semibold text-slate-400">Remates Totales</span>
                          <span>{stats.shotsTotal[1]}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                          <div
                            className="bg-sky-500 h-full"
                            style={{
                              width: `${Math.round(
                                (stats.shotsTotal[0] /
                                  (stats.shotsTotal[0] + stats.shotsTotal[1] || 1)) *
                                  100
                              )}%`,
                            }}
                          ></div>
                          <div className="bg-slate-600 h-full flex-1"></div>
                        </div>
                      </div>
                    )}

                    {stats.shotsOnTarget && (
                      <div>
                        <div className="flex justify-between font-bold text-slate-200 mb-1 font-mono">
                          <span className="text-sky-300">{stats.shotsOnTarget[0]}</span>
                          <span className="font-sans font-semibold text-slate-400">Tiros a Puerta</span>
                          <span>{stats.shotsOnTarget[1]}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                          <div
                            className="bg-sky-500 h-full"
                            style={{
                              width: `${Math.round(
                                (stats.shotsOnTarget[0] /
                                  (stats.shotsOnTarget[0] + stats.shotsOnTarget[1] || 1)) *
                                  100
                              )}%`,
                            }}
                          ></div>
                          <div className="bg-slate-600 h-full flex-1"></div>
                        </div>
                      </div>
                    )}

                    {stats.corners && (
                      <div>
                        <div className="flex justify-between font-bold text-slate-200 mb-1 font-mono">
                          <span className="text-sky-300">{stats.corners[0]}</span>
                          <span className="font-sans font-semibold text-slate-400">
                            Tiros de Esquina
                          </span>
                          <span>{stats.corners[1]}</span>
                        </div>
                      </div>
                    )}

                    {stats.fouls && (
                      <div>
                        <div className="flex justify-between font-bold text-slate-200 mb-1 font-mono">
                          <span className="text-sky-300">{stats.fouls[0]}</span>
                          <span className="font-sans font-semibold text-slate-400">
                            Faltas Cometidas
                          </span>
                          <span>{stats.fouls[1]}</span>
                        </div>
                      </div>
                    )}

                    {stats.yellowCards && (
                      <div className="flex justify-between font-bold text-slate-200 mb-1 font-mono">
                        <span className="text-amber-400">{stats.yellowCards[0]} 🟨</span>
                        <span className="font-sans font-semibold text-slate-400">
                          Tarjetas Amarillas
                        </span>
                        <span className="text-amber-400">🟨 {stats.yellowCards[1]}</span>
                      </div>
                    )}

                    {stats.source && (
                      <div className="text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-750">
                        Fuente: {stats.source}
                        {!stats.xg ? ' • xG oficial no incluido en la fuente para esta competición.' : ''}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: LINEUPS & ABSENCES */}
          {activeTab === 'lineups' && (
            <div className="space-y-4">
              {/* Verified Absences Block */}
              {dossier && (
                <div className="bg-[#182337] rounded-xl p-4 border border-slate-750 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">
                      Bajas, Lesiones y Suspensiones Verificadas
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      {dossier.home.absences.sourceMeta.source}
                    </span>
                  </div>
                  {dossier.home.absences.status === 'NO DISPONIBLE' &&
                  dossier.away.absences.status === 'NO DISPONIBLE' ? (
                    <p className="text-xs text-slate-400">
                      No hay información verificable sobre bajas o recuperaciones para este encuentro.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-[#121c2d] p-3 rounded-lg border border-slate-750">
                        <div className="font-bold text-sky-300 mb-1">{homeTeamName}</div>
                        {dossier.home.absences.items.length > 0 ? (
                          <ul className="space-y-1">
                            {dossier.home.absences.items.map((ab, idx) => (
                              <li key={idx} className="flex justify-between gap-2 text-[11px]">
                                <span className="text-white">{ab.playerName}</span>
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
                      <div className="bg-[#121c2d] p-3 rounded-lg border border-slate-750">
                        <div className="font-bold text-sky-300 mb-1">{awayTeamName}</div>
                        {dossier.away.absences.items.length > 0 ? (
                          <ul className="space-y-1">
                            {dossier.away.absences.items.map((ab, idx) => (
                              <li key={idx} className="flex justify-between gap-2 text-[11px]">
                                <span className="text-white">{ab.playerName}</span>
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
                </div>
              )}

              {/* Lineups */}
              {homeStarters.length === 0 && awayStarters.length === 0 ? (
                <div className="bg-[#182337] rounded-xl p-6 border border-slate-750 text-center text-xs text-slate-400">
                  Alineaciones oficiales aún no confirmadas ni publicadas en las fuentes consultadas.
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400">
                    Estado:{' '}
                    <strong className={lineupConfirmed ? 'text-emerald-400' : 'text-amber-300'}>
                      {lineupConfirmed
                        ? 'Alineación oficial confirmada'
                        : 'Alineación probable / preliminar (no oficial confirmada)'}
                    </strong>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#182337] rounded-xl p-4 border border-slate-750">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-750 mb-3">
                        <div>
                          <h4 className="font-bold text-white text-sm">{homeTeamName}</h4>
                          {rosters?.formationHome && (
                            <span className="text-[11px] text-sky-400 font-mono font-bold">
                              Formación: {rosters.formationHome}
                            </span>
                          )}
                        </div>
                        {rosters?.coachHome && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            DT: {rosters.coachHome}
                          </span>
                        )}
                      </div>
                      <ul className="space-y-1.5 text-xs">
                        {homeStarters.map((player, idx) => (
                          <li
                            key={idx}
                            className="flex items-center justify-between p-2 bg-[#121c2d] rounded-lg border border-slate-750"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-5 text-center font-mono font-bold text-sky-300">
                                {player.jersey}
                              </span>
                              <span className="font-medium text-white truncate">{player.name}</span>
                              {player.isCaptain && (
                                <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 rounded font-bold">
                                  C
                                </span>
                              )}
                            </div>
                            {player.position && (
                              <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 bg-slate-800 rounded">
                                {player.position}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                      {homeBench.length > 0 && (
                        <>
                          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-4 mb-2">
                            Suplentes
                          </div>
                          <ul className="space-y-1 text-xs">
                            {homeBench.map((player, idx) => (
                              <li
                                key={idx}
                                className="flex items-center justify-between p-1.5 bg-[#101928] rounded-md text-slate-300 text-[11px]"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-5 text-center font-mono text-slate-400">
                                    {player.jersey}
                                  </span>
                                  <span>{player.name}</span>
                                </div>
                                {player.position && (
                                  <span className="text-[9px] text-slate-400 font-mono">
                                    {player.position}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>

                    <div className="bg-[#182337] rounded-xl p-4 border border-slate-750">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-750 mb-3">
                        <div>
                          <h4 className="font-bold text-white text-sm">{awayTeamName}</h4>
                          {rosters?.formationAway && (
                            <span className="text-[11px] text-sky-400 font-mono font-bold">
                              Formación: {rosters.formationAway}
                            </span>
                          )}
                        </div>
                        {rosters?.coachAway && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            DT: {rosters.coachAway}
                          </span>
                        )}
                      </div>
                      <ul className="space-y-1.5 text-xs">
                        {awayStarters.map((player, idx) => (
                          <li
                            key={idx}
                            className="flex items-center justify-between p-2 bg-[#121c2d] rounded-lg border border-slate-750"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-5 text-center font-mono font-bold text-sky-300">
                                {player.jersey}
                              </span>
                              <span className="font-medium text-white truncate">{player.name}</span>
                              {player.isCaptain && (
                                <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 rounded font-bold">
                                  C
                                </span>
                              )}
                            </div>
                            {player.position && (
                              <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 bg-slate-800 rounded">
                                {player.position}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                      {awayBench.length > 0 && (
                        <>
                          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-4 mb-2">
                            Suplentes
                          </div>
                          <ul className="space-y-1 text-xs">
                            {awayBench.map((player, idx) => (
                              <li
                                key={idx}
                                className="flex items-center justify-between p-1.5 bg-[#101928] rounded-md text-slate-300 text-[11px]"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-5 text-center font-mono text-slate-400">
                                    {player.jersey}
                                  </span>
                                  <span>{player.name}</span>
                                </div>
                                {player.position && (
                                  <span className="text-[9px] text-slate-400 font-mono">
                                    {player.position}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: MARKETS & ODDS */}
          {activeTab === 'markets' && (
            <div className="space-y-6">
              {!hasRealOdds ? (
                <div className="bg-[#182337] rounded-xl p-6 border border-slate-750 text-center text-xs text-slate-400">
                  Las fuentes consultadas aún no han publicado cuotas oficiales para este partido.
                </div>
              ) : (
                <>
                  <div className="bg-[#182337] rounded-xl p-4 border border-slate-750">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                        Resultado Final (1X2)
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        Fuente: {match.odds.provider}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-[#121c2d] rounded-xl p-3 border border-slate-750 text-center">
                        <div className="text-xs font-semibold text-slate-300">
                          Victoria {homeTeamName}
                        </div>
                        <div className="text-xl font-extrabold text-sky-300 font-mono mt-1">
                          {homeAvg}
                        </div>
                        {betano && betplay && (
                          <div className="text-[10px] text-slate-400 mt-1 flex justify-center gap-2 font-mono">
                            <span>
                              Betano: <strong className="text-slate-200">{betano.home.toFixed(2)}</strong>
                            </span>
                            <span>
                              BetPlay: <strong className="text-slate-200">{betplay.home.toFixed(2)}</strong>
                            </span>
                          </div>
                        )}
                        {homeProb !== null && (
                          <div className="mt-2 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 rounded py-0.5">
                            {homeProb}% Probabilidad Implícita
                          </div>
                        )}
                      </div>

                      <div className="bg-[#121c2d] rounded-xl p-3 border border-slate-750 text-center">
                        <div className="text-xs font-semibold text-slate-300">Empate (X)</div>
                        <div className="text-xl font-extrabold text-slate-200 font-mono mt-1">
                          {drawAvg}
                        </div>
                        {betano && betplay && (
                          <div className="text-[10px] text-slate-400 mt-1 flex justify-center gap-2 font-mono">
                            <span>
                              Betano: <strong className="text-slate-200">{betano.draw.toFixed(2)}</strong>
                            </span>
                            <span>
                              BetPlay: <strong className="text-slate-200">{betplay.draw.toFixed(2)}</strong>
                            </span>
                          </div>
                        )}
                        {drawProb !== null && (
                          <div className="mt-2 text-[10px] font-semibold text-slate-400 bg-slate-800/60 rounded py-0.5">
                            {drawProb}% Probabilidad Implícita
                          </div>
                        )}
                      </div>

                      <div className="bg-[#121c2d] rounded-xl p-3 border border-slate-750 text-center">
                        <div className="text-xs font-semibold text-slate-300">
                          Victoria {awayTeamName}
                        </div>
                        <div className="text-xl font-extrabold text-sky-300 font-mono mt-1">
                          {awayAvg}
                        </div>
                        {betano && betplay && (
                          <div className="text-[10px] text-slate-400 mt-1 flex justify-center gap-2 font-mono">
                            <span>
                              Betano: <strong className="text-slate-200">{betano.away.toFixed(2)}</strong>
                            </span>
                            <span>
                              BetPlay: <strong className="text-slate-200">{betplay.away.toFixed(2)}</strong>
                            </span>
                          </div>
                        )}
                        {awayProb !== null && (
                          <div className="mt-2 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 rounded py-0.5">
                            {awayProb}% Probabilidad Implícita
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {match.odds.over25 > 0 && (
                    <div className="bg-[#182337] rounded-xl p-4 border border-slate-750">
                      <h4 className="font-bold text-white text-sm mb-3">Línea de Goles (+ / - 2.5)</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#121c2d] rounded-xl p-3 border border-slate-750 text-center">
                          <div className="text-xs font-semibold text-slate-300">Más de 2.5 Goles</div>
                          <div className="text-lg font-bold text-sky-300 font-mono mt-1">
                            {match.odds.over25.toFixed(2)}
                          </div>
                        </div>
                        <div className="bg-[#121c2d] rounded-xl p-3 border border-slate-750 text-center">
                          <div className="text-xs font-semibold text-slate-300">Menos de 2.5 Goles</div>
                          <div className="text-lg font-bold text-slate-200 font-mono mt-1">
                            {match.odds.under25 > 0 ? match.odds.under25.toFixed(2) : 'N/D'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB: REFEREE */}
          {activeTab === 'referee' && (
            <div className="space-y-4">
              <div className="bg-[#182337] rounded-xl p-4 border border-slate-750">
                <div className="flex items-center justify-between pb-3 border-b border-slate-750">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0e223d] text-sky-300 border border-sky-500/40 flex items-center justify-center font-bold text-lg">
                      ⚖️
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">
                        {referee?.name || 'Designación arbitral no accesible desde las fuentes disponibles'}
                      </h4>
                      <span className="text-xs text-slate-400">
                        {referee?.country ? `Federación / País: ${referee.country}` : 'Estado arbitral'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-sky-400 bg-[#0e223d] border border-sky-500/40 px-2.5 py-1 rounded-md">
                    {referee?.state === 'VERIFIED'
                      ? 'VERIFICADO'
                      : referee?.state === 'PENDING_DESIGNATION'
                      ? 'PENDIENTE'
                      : 'NO DISPONIBLE'}
                  </span>
                </div>

                {referee?.state === 'VERIFIED' &&
                referee.yellowAvg !== null &&
                referee.yellowAvg !== undefined ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-center">
                    <div className="bg-[#121c2d] p-3 rounded-xl border border-slate-750">
                      <div className="text-[11px] text-slate-400">Media Amarillas</div>
                      <div className="text-lg font-extrabold text-amber-400 font-mono mt-0.5">
                        🟨 {referee.yellowAvg}
                      </div>
                    </div>
                    <div className="bg-[#121c2d] p-3 rounded-xl border border-slate-750">
                      <div className="text-[11px] text-slate-400">Rojas Totales</div>
                      <div className="text-lg font-extrabold text-rose-500 font-mono mt-0.5">
                        🟥 {referee.redTotal ?? 'N/D'}
                      </div>
                    </div>
                    <div className="bg-[#121c2d] p-3 rounded-xl border border-slate-750">
                      <div className="text-[11px] text-slate-400">Faltas / Partido</div>
                      <div className="text-lg font-extrabold text-white font-mono mt-0.5">
                        {referee.foulsAvg ?? 'N/D'}
                      </div>
                    </div>
                    <div className="bg-[#121c2d] p-3 rounded-xl border border-slate-750">
                      <div className="text-[11px] text-slate-400">Partidos Fuente</div>
                      <div className="text-lg font-extrabold text-sky-400 font-mono mt-0.5">
                        {referee.matchesCount ?? 'N/D'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-[#121c2d] rounded-xl border border-slate-750 text-xs text-slate-400">
                    Estadísticas históricas del árbitro no disponibles en las fuentes consultadas.
                  </div>
                )}

                <div className="mt-4 p-3.5 bg-[#121c2d] rounded-xl border border-slate-750 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white block mb-1">Trazabilidad Arbitral:</strong>
                  {referee?.trendDescription ||
                    'No fue posible obtener una designación arbitral verificable para este encuentro.'}
                  {referee?.sourceMeta?.source && (
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      Fuente: {referee.sourceMeta.source}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: H2H */}
          {activeTab === 'h2h' && (
            <div className="space-y-4">
              <div className="bg-[#182337] rounded-xl p-4 border border-slate-750 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">
                    Historial Reciente de Enfrentamientos Directos (Máx. 3 Verificados)
                  </h4>
                  {dossier?.h2h && (
                    <span className="text-[10px] font-mono text-sky-300">
                      {dossier.h2h.status}
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  {h2hMatches.length > 0 ? (
                    h2hMatches.map((item) => (
                      <div
                        key={item.eventId}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 bg-[#121c2d] rounded-lg border border-slate-750"
                      >
                        <div className="text-slate-400 font-mono text-[11px]">
                          {item.dateFormatted} • {item.competition}
                          {!item.isOfficial ? ' (Amistoso)' : ''}
                        </div>
                        <span className="font-semibold text-white">
                          {getLocalizedTeamName(item.homeTeamName)} {item.homeScore} -{' '}
                          {item.awayScore} {getLocalizedTeamName(item.awayTeamName)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 text-xs py-2">
                      {dossier?.h2h?.note ||
                        'Historial de enfrentamientos directos no disponible o insuficiente para este encuentro.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Close Bar */}
        <div className="px-5 py-3 border-t border-slate-750 bg-[#0f1725] flex items-center justify-between text-xs text-slate-400">
          <span>VortexTips Analytics • Veracidad y Trazabilidad de Datos</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
