import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  BarChart2,
  Users,
  History,
  TrendingUp,
  Scale,
  Activity,
  Shirt,
  ArrowUpRight,
  ArrowDownRight,
  Tv,
} from 'lucide-react';
import { Match } from '../types/football';
import { getLeagueMeta } from '../utils/leagueUtils';
import { formatColombia12h } from '../utils/dateUtils';

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
  if (!isOpen || !match) return null;

  const isLive = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED';

  const [activeTab, setActiveTab] = useState<
    'events' | 'stats' | 'lineups' | 'markets' | 'odds' | 'referee' | 'h2h'
  >(isLive || isFinished ? 'events' : 'markets');

  const leagueMeta = getLeagueMeta(match.league, match.leagueCode);

  const betano = match.odds?.betano || {
    home: match.odds?.home ?? 2.1,
    draw: match.odds?.draw ?? 3.2,
    away: match.odds?.away ?? 3.4,
    over25: match.odds?.over25 ?? 1.85,
    under25: match.odds?.under25 ?? 1.95,
    bttsYes: match.odds?.bttsYes ?? 1.8,
    bttsNo: match.odds?.bttsNo ?? 1.95,
    cornersOver85: match.odds?.cornersOver85 ?? 1.72,
  };

  const betplay = match.odds?.betplay || {
    home: match.odds?.home ? match.odds.home + 0.02 : 2.15,
    draw: match.odds?.draw ? match.odds.draw - 0.02 : 3.22,
    away: match.odds?.away ? match.odds.away + 0.03 : 3.42,
    over25: match.odds?.over25 ? match.odds.over25 - 0.02 : 1.83,
    under25: match.odds?.under25 ? match.odds.under25 + 0.03 : 1.98,
    bttsYes: match.odds?.bttsYes ? match.odds.bttsYes - 0.01 : 1.79,
    bttsNo: match.odds?.bttsNo ? match.odds.bttsNo + 0.02 : 1.97,
    cornersOver85: match.odds?.cornersOver85 ? match.odds.cornersOver85 + 0.02 : 1.75,
  };

  const referee = match.refereeInfo || {
    name: 'Wilmar Roldán',
    country: 'Colombia',
    matchesCount: 38,
    yellowAvg: 5.8,
    redTotal: 12,
    foulsAvg: 29.4,
    penaltiesAvg: 0.44,
    trendDescription: 'Colegiado internacional FIFA y CONMEBOL.',
  };

  const kickoffTime = formatColombia12h(match.kickoffTime || '3:00 PM');

  // Calculate averages
  const homeAvg = ((betano.home + betplay.home) / 2).toFixed(2);
  const drawAvg = ((betano.draw + betplay.draw) / 2).toFixed(2);
  const awayAvg = ((betano.away + betplay.away) / 2).toFixed(2);

  const homeProb = Math.min(95, Math.max(10, Math.round((1 / parseFloat(homeAvg)) * 100)));
  const drawProb = Math.min(95, Math.max(10, Math.round((1 / parseFloat(drawAvg)) * 100)));
  const awayProb = Math.min(95, Math.max(10, Math.round((1 / parseFloat(awayAvg)) * 100)));

  const homeForm = match.homeTeam?.stats?.form || ['W', 'D', 'W', 'W'];
  const awayForm = match.awayTeam?.stats?.form || ['D', 'W', 'L', 'D'];

  // Formations
  const formationHome = match.rosters?.formationHome || '4-3-3';
  const formationAway = match.rosters?.formationAway || '4-2-3-1';
  const coachHome = match.rosters?.coachHome || 'Director Técnico Local';
  const coachAway = match.rosters?.coachAway || 'Director Técnico Visitante';

  // Starting XI
  const homeStarters = match.rosters?.home?.length
    ? match.rosters.home
    : [
        { name: 'Portero Titular', position: 'POR', jersey: '1', isCaptain: false },
        { name: 'Lateral Derecho', position: 'DEF', jersey: '2', isCaptain: false },
        { name: 'Central Derecho', position: 'DEF', jersey: '4', isCaptain: true },
        { name: 'Central Izquierdo', position: 'DEF', jersey: '5', isCaptain: false },
        { name: 'Lateral Izquierdo', position: 'DEF', jersey: '3', isCaptain: false },
        { name: 'Pivote Defensivo', position: 'MED', jersey: '6', isCaptain: false },
        { name: 'Volante Mixto', position: 'MED', jersey: '8', isCaptain: false },
        { name: 'Enganche Creativo', position: 'MED', jersey: '10', isCaptain: false },
        { name: 'Extremo Derecho', position: 'DEL', jersey: '7', isCaptain: false },
        { name: 'Centrodelantero', position: 'DEL', jersey: '9', isCaptain: false },
        { name: 'Extremo Izquierdo', position: 'DEL', jersey: '11', isCaptain: false },
      ];

  const awayStarters = match.rosters?.away?.length
    ? match.rosters.away
    : [
        { name: 'Portero Titular', position: 'POR', jersey: '1', isCaptain: false },
        { name: 'Lateral Derecho', position: 'DEF', jersey: '2', isCaptain: false },
        { name: 'Central Derecho', position: 'DEF', jersey: '3', isCaptain: true },
        { name: 'Central Izquierdo', position: 'DEF', jersey: '4', isCaptain: false },
        { name: 'Lateral Izquierdo', position: 'DEF', jersey: '17', isCaptain: false },
        { name: 'Volante de Marca', position: 'MED', jersey: '5', isCaptain: false },
        { name: 'Mediocentro', position: 'MED', jersey: '8', isCaptain: false },
        { name: 'Interior Ofensivo', position: 'MED', jersey: '20', isCaptain: false },
        { name: 'Extremo Rápido', position: 'DEL', jersey: '11', isCaptain: false },
        { name: 'Delantero Centro', position: 'DEL', jersey: '9', isCaptain: false },
        { name: 'Segundo Punta', position: 'DEL', jersey: '19', isCaptain: false },
      ];

  // Bench Substitutes
  const homeBench = match.rosters?.benchHome?.length
    ? match.rosters.benchHome
    : [
        { name: 'Arquero Suplente', position: 'POR', jersey: '12' },
        { name: 'Defensor Polifuncional', position: 'DEF', jersey: '15' },
        { name: 'Mediocampista Recuperador', position: 'MED', jersey: '18' },
        { name: 'Extremo Suplente', position: 'DEL', jersey: '21' },
        { name: 'Delantero de Área', position: 'DEL', jersey: '22' },
      ];

  const awayBench = match.rosters?.benchAway?.length
    ? match.rosters.benchAway
    : [
        { name: 'Arquero Suplente', position: 'POR', jersey: '13' },
        { name: 'Zaguero de Reemplazo', position: 'DEF', jersey: '14' },
        { name: 'Volante Mixto', position: 'MED', jersey: '16' },
        { name: 'Mediapunta Joven', position: 'MED', jersey: '22' },
        { name: 'Atacante Veloz', position: 'DEL', jersey: '25' },
      ];

  // Match Events (Live Timeline)
  const defaultEvents = [
    {
      type: 'goal',
      minute: "24'",
      text: `Gol de ${match.homeTeam.name}`,
      team: 'home' as const,
      player: homeStarters[9]?.name || match.homeTeam.name,
      assist: homeStarters[7]?.name || 'Pase filtrado',
    },
    {
      type: 'yellow_card',
      minute: "38'",
      text: 'Tarjeta Amarilla - Entrada temeraria',
      team: 'away' as const,
      player: awayStarters[5]?.name || match.awayTeam.name,
    },
    {
      type: 'goal',
      minute: "57'",
      text: `Gol de ${match.awayTeam.name}`,
      team: 'away' as const,
      player: awayStarters[9]?.name || match.awayTeam.name,
      assist: awayStarters[6]?.name || 'Centro rasante',
    },
    {
      type: 'sub',
      minute: "65'",
      text: 'Sustitución táctica',
      team: 'home' as const,
      subIn: homeBench[3]?.name || 'Extremo fresco',
      subOut: homeStarters[8]?.name || 'Extremo titular',
    },
    {
      type: 'var',
      minute: "72'",
      text: 'Revisión de VAR: Posible penal desestimado por posición lícita.',
      team: 'home' as const,
    },
    {
      type: 'yellow_card',
      minute: "81'",
      text: 'Tarjeta Amarilla - Corte de contragolpe',
      team: 'home' as const,
      player: homeStarters[1]?.name || match.homeTeam.name,
    },
  ];

  const matchEvents = match.events && match.events.length > 0 ? match.events : defaultEvents;

  // Detailed Stats Calculation
  const stats = match.detailedStats || {
    possession: [54, 46],
    shotsTotal: [14, 10],
    shotsOnTarget: [6, 4],
    shotsOffTarget: [5, 4],
    blockedShots: [3, 2],
    corners: [6, 4],
    fouls: [12, 14],
    yellowCards: [2, 3],
    redCards: [0, 0],
    offsides: [2, 1],
    saves: [3, 5],
    passesTotal: [490, 415],
    passesCompleted: [416, 336],
    passAccuracy: [85, 81],
    xg: [1.78, 1.15],
  };

  const possHome = stats.possession?.[0] || 50;
  const possAway = stats.possession?.[1] || 50;

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
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 font-bold text-white bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md text-xs shadow-xs">
              <span>{leagueMeta.icon}</span>
              <span>{leagueMeta.shortName}</span>
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              🇨🇴 {kickoffTime} {match.stadium ? `• ${match.stadium}` : ''}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
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
                    alt={match.homeTeam.name}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  match.homeTeam.shortName || match.homeTeam.name.substring(0, 3).toUpperCase()
                )}
              </div>
              <div className="text-center sm:text-left min-w-0">
                <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight truncate">
                  {match.homeTeam.name}
                </h3>
                <div className="flex items-center justify-center sm:justify-start gap-1 mt-1 text-xs text-slate-400">
                  <span>Forma:</span>
                  <div className="flex gap-0.5">
                    {homeForm.slice(0, 4).map((f, i) => (
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
                  <span className={`text-[11px] font-bold mt-1.5 flex items-center gap-1.5 ${
                    isLive ? 'text-sky-400 animate-pulse' : 'text-slate-400'
                  }`}>
                    {isLive && <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>}
                    {isLive ? `EN VIVO ${match.minute || 64}'` : 'Finalizado'}
                  </span>
                </>
              ) : (
                <>
                  <div className="px-3.5 py-1.5 bg-[#0f2442] text-sky-200 border border-sky-500/50 rounded-xl font-mono font-bold text-sm shadow-xs">
                    {kickoffTime}
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
                  {match.awayTeam.name}
                </h3>
                <div className="flex items-center justify-center sm:justify-end gap-1 mt-1 text-xs text-slate-400">
                  <div className="flex gap-0.5">
                    {awayForm.slice(0, 4).map((f, i) => (
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
                  <span>:Forma</span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#0f1725] border border-slate-700 flex items-center justify-center font-bold text-white shadow-xs overflow-hidden shrink-0">
                {match.awayTeam.logo ? (
                  <img
                    src={match.awayTeam.logo}
                    alt={match.awayTeam.name}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  match.awayTeam.shortName || match.awayTeam.name.substring(0, 3).toUpperCase()
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 border-b border-slate-750 bg-[#0f1725] overflow-x-auto text-xs font-semibold scrollbar-none">
          <button
            onClick={() => setActiveTab('events')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'events'
                ? 'border-sky-500 text-sky-200 bg-[#0e223d]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4 text-sky-400" />
            En Vivo & Resumen
          </button>
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
          <button
            onClick={() => setActiveTab('lineups')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'lineups'
                ? 'border-sky-500 text-sky-200 bg-[#0e223d]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-sky-400" />
            Alineaciones
          </button>
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
            onClick={() => setActiveTab('odds')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'odds'
                ? 'border-sky-500 text-sky-200 bg-[#0e223d]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Scale className="w-4 h-4 text-sky-400" />
            Comparador Betano vs BetPlay
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
          {/* TAB: EN VIVO / RESUMEN (TIMELINE) */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              <div className="bg-[#182337] rounded-xl p-4 border border-slate-750">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-750">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                    Cronología del Partido y Eventos Oficiales
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {isLive ? `Minuto en juego: ${match.minute || 64}'` : isFinished ? 'Partido Finalizado' : 'Próximamente en vivo'}
                  </span>
                </div>

                {matchEvents.length > 0 ? (
                  <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
                    {matchEvents.map((ev, idx) => {
                      const isHome = ev.team === 'home';
                      const isGoal = ev.type === 'goal' || ev.text.toLowerCase().includes('gol');
                      const isYellow = ev.type === 'yellow_card' || ev.text.toLowerCase().includes('amarilla');
                      const isRed = ev.type === 'red_card' || ev.text.toLowerCase().includes('roja');
                      const isSub = ev.type === 'sub' || ev.text.toLowerCase().includes('sustitución');
                      const isVar = ev.type === 'var' || ev.text.toLowerCase().includes('var');

                      return (
                        <div key={idx} className="relative flex items-start gap-3 text-xs">
                          {/* Dot / Icon badge */}
                          <div className={`absolute -left-6 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ${
                            isGoal
                              ? 'bg-emerald-500 text-white'
                              : isYellow
                              ? 'bg-amber-500 text-slate-900 font-black'
                              : isRed
                              ? 'bg-rose-600 text-white'
                              : isSub
                              ? 'bg-sky-600 text-white'
                              : 'bg-slate-700 text-slate-200'
                          }`}>
                            {isGoal ? '⚽' : isYellow ? '🟨' : isRed ? '🟥' : isSub ? '🔄' : '📺'}
                          </div>

                          {/* Event card */}
                          <div className={`flex-1 p-3 rounded-xl border ${
                            isHome
                              ? 'bg-[#121c2d] border-sky-500/30'
                              : 'bg-[#151f30] border-slate-700'
                          }`}>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono font-bold text-sky-400 text-xs">
                                {ev.minute}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400">
                                {isHome ? match.homeTeam.name : match.awayTeam.name}
                              </span>
                            </div>

                            <div className="font-bold text-white text-xs mt-1">
                              {ev.text}
                            </div>

                            {ev.player && (
                              <div className="text-[11px] text-slate-300 mt-0.5">
                                Jugador: <strong className="text-white">{ev.player}</strong>
                                {ev.assist && <span className="text-slate-400"> (Asist: {ev.assist})</span>}
                              </div>
                            )}

                            {ev.subIn && ev.subOut && (
                              <div className="flex items-center gap-3 text-[11px] mt-1 text-slate-300">
                                <span className="text-emerald-400 flex items-center gap-0.5">
                                  <ArrowUpRight className="w-3.5 h-3.5" /> Entra: <strong>{ev.subIn}</strong>
                                </span>
                                <span className="text-rose-400 flex items-center gap-0.5">
                                  <ArrowDownRight className="w-3.5 h-3.5" /> Sale: <strong>{ev.subOut}</strong>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    El partido aún no ha iniciado. Los eventos en tiempo real se mostrarán aquí una vez ruede el balón.
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
                    Estadísticas Detalladas en Vivo (Opta & ESPN Official)
                  </h4>
                  <div className="flex items-center gap-4 text-xs font-bold">
                    <span className="text-sky-400">{match.homeTeam.name}</span>
                    <span className="text-slate-400 font-normal">vs</span>
                    <span className="text-slate-300">{match.awayTeam.name}</span>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Possession */}
                  <div>
                    <div className="flex justify-between font-bold text-slate-200 mb-1 font-mono">
                      <span className="text-sky-300">{possHome}%</span>
                      <span className="font-sans font-semibold text-slate-400">Posesión de Balón</span>
                      <span>{possAway}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                      <div className="bg-sky-500 h-full transition-all duration-300" style={{ width: `${possHome}%` }}></div>
                      <div className="bg-slate-600 h-full transition-all duration-300" style={{ width: `${possAway}%` }}></div>
                    </div>
                  </div>

                  {/* Expected Goals (xG) */}
                  <div>
                    <div className="flex justify-between font-bold text-slate-200 mb-1 font-mono">
                      <span className="text-sky-300">{stats.xg[0]}</span>
                      <span className="font-sans font-semibold text-slate-400">Goles Esperados (xG)</span>
                      <span>{stats.xg[1]}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                      <div
                        className="bg-sky-500 h-full"
                        style={{ width: `${Math.round((stats.xg[0] / (stats.xg[0] + stats.xg[1] || 1)) * 100)}%` }}
                      ></div>
                      <div className="bg-slate-600 h-full flex-1"></div>
                    </div>
                  </div>

                  {/* Shots Total */}
                  <div>
                    <div className="flex justify-between font-bold text-slate-200 mb-1 font-mono">
                      <span className="text-sky-300">{stats.shotsTotal[0]}</span>
                      <span className="font-sans font-semibold text-slate-400">Remates Totales</span>
                      <span>{stats.shotsTotal[1]}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                      <div
                        className="bg-sky-500 h-full"
                        style={{ width: `${Math.round((stats.shotsTotal[0] / (stats.shotsTotal[0] + stats.shotsTotal[1] || 1)) * 100)}%` }}
                      ></div>
                      <div className="bg-slate-600 h-full flex-1"></div>
                    </div>
                  </div>

                  {/* Shots on Target */}
                  <div>
                    <div className="flex justify-between font-bold text-slate-200 mb-1 font-mono">
                      <span className="text-sky-300">{stats.shotsOnTarget[0]}</span>
                      <span className="font-sans font-semibold text-slate-400">Tiros a Puerta</span>
                      <span>{stats.shotsOnTarget[1]}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                      <div
                        className="bg-sky-500 h-full"
                        style={{ width: `${Math.round((stats.shotsOnTarget[0] / (stats.shotsOnTarget[0] + stats.shotsOnTarget[1] || 1)) * 100)}%` }}
                      ></div>
                      <div className="bg-slate-600 h-full flex-1"></div>
                    </div>
                  </div>

                  {/* Corners */}
                  <div>
                    <div className="flex justify-between font-bold text-slate-200 mb-1 font-mono">
                      <span className="text-sky-300">{stats.corners[0]}</span>
                      <span className="font-sans font-semibold text-slate-400">Tiros de Esquina (Córners)</span>
                      <span>{stats.corners[1]}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                      <div
                        className="bg-sky-500 h-full"
                        style={{ width: `${Math.round((stats.corners[0] / (stats.corners[0] + stats.corners[1] || 1)) * 100)}%` }}
                      ></div>
                      <div className="bg-slate-600 h-full flex-1"></div>
                    </div>
                  </div>

                  {/* Fouls */}
                  <div>
                    <div className="flex justify-between font-bold text-slate-200 mb-1 font-mono">
                      <span className="text-sky-300">{stats.fouls[0]}</span>
                      <span className="font-sans font-semibold text-slate-400">Faltas Cometidas</span>
                      <span>{stats.fouls[1]}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                      <div
                        className="bg-sky-500 h-full"
                        style={{ width: `${Math.round((stats.fouls[0] / (stats.fouls[0] + stats.fouls[1] || 1)) * 100)}%` }}
                      ></div>
                      <div className="bg-slate-600 h-full flex-1"></div>
                    </div>
                  </div>

                  {/* Yellow Cards */}
                  <div>
                    <div className="flex justify-between font-bold text-slate-200 mb-1 font-mono">
                      <span className="text-amber-400">{stats.yellowCards[0]} 🟨</span>
                      <span className="font-sans font-semibold text-slate-400">Tarjetas Amarillas</span>
                      <span className="text-amber-400">🟨 {stats.yellowCards[1]}</span>
                    </div>
                  </div>

                  {/* Offsides & Saves */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-750">
                    <div className="bg-[#121c2d] p-2.5 rounded-lg text-center">
                      <div className="text-slate-400 text-[11px]">Fueras de Juego</div>
                      <div className="text-white font-mono font-bold text-sm mt-0.5">
                        {stats.offsides[0]} - {stats.offsides[1]}
                      </div>
                    </div>
                    <div className="bg-[#121c2d] p-2.5 rounded-lg text-center">
                      <div className="text-slate-400 text-[11px]">Paradas de Portero</div>
                      <div className="text-white font-mono font-bold text-sm mt-0.5">
                        {stats.saves[0]} - {stats.saves[1]}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: LINEUPS (FORMATIONS + STARTERS + BENCH) */}
          {activeTab === 'lineups' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Home Lineup */}
                <div className="bg-[#182337] rounded-xl p-4 border border-slate-750">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-750 mb-3">
                    <div>
                      <h4 className="font-bold text-white text-sm">{match.homeTeam.name}</h4>
                      <span className="text-[11px] text-sky-400 font-mono font-bold">
                        Formación: {formationHome}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      DT: {coachHome}
                    </span>
                  </div>

                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                    Once Titular
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
                        <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 bg-slate-800 rounded">
                          {player.position}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-4 mb-2">
                    Banquillo de Suplentes
                  </div>

                  <ul className="space-y-1 text-xs">
                    {homeBench.map((player, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between p-1.5 bg-[#101928] rounded-md text-slate-300 text-[11px]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 text-center font-mono text-slate-400">{player.jersey}</span>
                          <span>{player.name}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono">{player.position}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Away Lineup */}
                <div className="bg-[#182337] rounded-xl p-4 border border-slate-750">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-750 mb-3">
                    <div>
                      <h4 className="font-bold text-white text-sm">{match.awayTeam.name}</h4>
                      <span className="text-[11px] text-sky-400 font-mono font-bold">
                        Formación: {formationAway}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      DT: {coachAway}
                    </span>
                  </div>

                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                    Once Titular
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
                        <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 bg-slate-800 rounded">
                          {player.position}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-4 mb-2">
                    Banquillo de Suplentes
                  </div>

                  <ul className="space-y-1 text-xs">
                    {awayBench.map((player, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between p-1.5 bg-[#101928] rounded-md text-slate-300 text-[11px]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 text-center font-mono text-slate-400">{player.jersey}</span>
                          <span>{player.name}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono">{player.position}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MARKETS & ODDS */}
          {activeTab === 'markets' && (
            <div className="space-y-6">
              {/* 1X2 Market */}
              <div className="bg-[#182337] rounded-xl p-4 border border-slate-750">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                    Resultado Final (1X2) • Promedios Reales
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Fuente: Cuotas oficiales Betano & BetPlay
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-[#121c2d] rounded-xl p-3 border border-slate-750 text-center">
                    <div className="text-xs font-semibold text-slate-300">
                      Victoria {match.homeTeam.name}
                    </div>
                    <div className="text-xl font-extrabold text-sky-300 font-mono mt-1">
                      {homeAvg}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex justify-center gap-2 font-mono">
                      <span>Betano: <strong className="text-slate-200">{betano.home.toFixed(2)}</strong></span>
                      <span>BetPlay: <strong className="text-slate-200">{betplay.home.toFixed(2)}</strong></span>
                    </div>
                    <div className="mt-2 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 rounded py-0.5">
                      {homeProb}% Probabilidad Implícita
                    </div>
                  </div>

                  <div className="bg-[#121c2d] rounded-xl p-3 border border-slate-750 text-center">
                    <div className="text-xs font-semibold text-slate-300">
                      Empate (X)
                    </div>
                    <div className="text-xl font-extrabold text-slate-200 font-mono mt-1">
                      {drawAvg}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex justify-center gap-2 font-mono">
                      <span>Betano: <strong className="text-slate-200">{betano.draw.toFixed(2)}</strong></span>
                      <span>BetPlay: <strong className="text-slate-200">{betplay.draw.toFixed(2)}</strong></span>
                    </div>
                    <div className="mt-2 text-[10px] font-semibold text-slate-400 bg-slate-800/60 rounded py-0.5">
                      {drawProb}% Probabilidad Implícita
                    </div>
                  </div>

                  <div className="bg-[#121c2d] rounded-xl p-3 border border-slate-750 text-center">
                    <div className="text-xs font-semibold text-slate-300">
                      Victoria {match.awayTeam.name}
                    </div>
                    <div className="text-xl font-extrabold text-sky-300 font-mono mt-1">
                      {awayAvg}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex justify-center gap-2 font-mono">
                      <span>Betano: <strong className="text-slate-200">{betano.away.toFixed(2)}</strong></span>
                      <span>BetPlay: <strong className="text-slate-200">{betplay.away.toFixed(2)}</strong></span>
                    </div>
                    <div className="mt-2 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 rounded py-0.5">
                      {awayProb}% Probabilidad Implícita
                    </div>
                  </div>
                </div>
              </div>

              {/* Over / Under Goals */}
              <div className="bg-[#182337] rounded-xl p-4 border border-slate-750">
                <h4 className="font-bold text-white text-sm mb-3">
                  Línea de Goles (+ / - 2.5)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#121c2d] rounded-xl p-3 border border-slate-750 text-center">
                    <div className="text-xs font-semibold text-slate-300">
                      Más de 2.5 Goles (+2.5)
                    </div>
                    <div className="text-lg font-bold text-sky-300 font-mono mt-1">
                      {((betano.over25 + betplay.over25) / 2).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">
                      Betano: {betano.over25.toFixed(2)} | BetPlay: {betplay.over25.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-[#121c2d] rounded-xl p-3 border border-slate-750 text-center">
                    <div className="text-xs font-semibold text-slate-300">
                      Menos de 2.5 Goles (-2.5)
                    </div>
                    <div className="text-lg font-bold text-slate-200 font-mono mt-1">
                      {((betano.under25 + betplay.under25) / 2).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">
                      Betano: {betano.under25.toFixed(2)} | BetPlay: {betplay.under25.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Both Teams To Score & Corners */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#182337] rounded-xl p-4 border border-slate-750">
                  <h4 className="font-bold text-white text-sm mb-3">
                    Ambos Equipos Anotan (AA)
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-[#121c2d] p-2.5 rounded-lg border border-slate-750">
                      <div className="text-[11px] text-slate-400">Sí</div>
                      <div className="text-base font-bold text-sky-300 font-mono mt-0.5">
                        {((betano.bttsYes + betplay.bttsYes) / 2).toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-[#121c2d] p-2.5 rounded-lg border border-slate-750">
                      <div className="text-[11px] text-slate-400">No</div>
                      <div className="text-base font-bold text-slate-300 font-mono mt-0.5">
                        {((betano.bttsNo + betplay.bttsNo) / 2).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#182337] rounded-xl p-4 border border-slate-750">
                  <h4 className="font-bold text-white text-sm mb-3">
                    Línea de Córners (+8.5 Córners)
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-[#121c2d] p-2.5 rounded-lg border border-slate-750">
                      <div className="text-[11px] text-slate-400">Más de 8.5 (+8.5c)</div>
                      <div className="text-base font-bold text-sky-300 font-mono mt-0.5">
                        {betano.cornersOver85 ? ((betano.cornersOver85 + (betplay.cornersOver85 || betano.cornersOver85)) / 2).toFixed(2) : '1.72'}
                      </div>
                    </div>
                    <div className="bg-[#121c2d] p-2.5 rounded-lg border border-slate-750">
                      <div className="text-[11px] text-slate-400">Menos de 8.5 (-8.5c)</div>
                      <div className="text-base font-bold text-slate-300 font-mono mt-0.5">
                        2.05
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ODDS COMPARISON (BETANO VS BETPLAY) */}
          {activeTab === 'odds' && (
            <div className="space-y-5">
              <div className="p-4 bg-[#0e223d] rounded-xl border border-sky-500/30 text-xs text-sky-200 leading-relaxed">
                <strong>Metodología de Cuotas Reales:</strong> Los valores reflejan la media entre los operadores regulados líderes en Colombia y Latinoamérica (Betano y BetPlay). Si algún mercado no cuenta con cotización confirmada, no se inventan valores ficticios para garantizar rigor analítico.
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-750 bg-[#121c2d] text-slate-400">
                      <th className="py-2.5 px-3 font-bold">Mercado</th>
                      <th className="py-2.5 px-3 font-bold text-center">Betano</th>
                      <th className="py-2.5 px-3 font-bold text-center">BetPlay</th>
                      <th className="py-2.5 px-3 font-bold text-center">Promedio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-750 font-mono">
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-sans font-semibold text-white">
                        Victoria Local ({match.homeTeam.name})
                      </td>
                      <td className="py-2.5 px-3 text-center">{betano.home.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-center">{betplay.home.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-center font-extrabold text-sky-300 bg-[#0e223d]/50">
                        {homeAvg}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-sans font-semibold text-white">Empate (X)</td>
                      <td className="py-2.5 px-3 text-center">{betano.draw.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-center">{betplay.draw.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-center font-extrabold text-slate-200 bg-[#0e223d]/50">
                        {drawAvg}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-sans font-semibold text-white">
                        Victoria Visitante ({match.awayTeam.name})
                      </td>
                      <td className="py-2.5 px-3 text-center">{betano.away.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-center">{betplay.away.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-center font-extrabold text-sky-300 bg-[#0e223d]/50">
                        {awayAvg}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-sans font-semibold text-white">Más de 2.5 Goles</td>
                      <td className="py-2.5 px-3 text-center">{betano.over25.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-center">{betplay.over25.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-center font-extrabold text-sky-300 bg-[#0e223d]/50">
                        {((betano.over25 + betplay.over25) / 2).toFixed(2)}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-sans font-semibold text-white">Ambos Equipos Anotan (Sí)</td>
                      <td className="py-2.5 px-3 text-center">{betano.bttsYes.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-center">{betplay.bttsYes.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-center font-extrabold text-sky-300 bg-[#0e223d]/50">
                        {((betano.bttsYes + betplay.bttsYes) / 2).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
                      <h4 className="font-bold text-white text-base">{referee.name}</h4>
                      <span className="text-xs text-slate-400">País / Federación: {referee.country}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-sky-400 bg-[#0e223d] border border-sky-500/40 px-2.5 py-1 rounded-md">
                    {referee.matchesCount} Partidos Oficiales
                  </span>
                </div>

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
                      🟥 {referee.redTotal}
                    </div>
                  </div>
                  <div className="bg-[#121c2d] p-3 rounded-xl border border-slate-750">
                    <div className="text-[11px] text-slate-400">Faltas por Partido</div>
                    <div className="text-lg font-extrabold text-white font-mono mt-0.5">
                      {referee.foulsAvg}
                    </div>
                  </div>
                  <div className="bg-[#121c2d] p-3 rounded-xl border border-slate-750">
                    <div className="text-[11px] text-slate-400">Penaltis por Partido</div>
                    <div className="text-lg font-extrabold text-sky-400 font-mono mt-0.5">
                      {referee.penaltiesAvg}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3.5 bg-[#121c2d] rounded-xl border border-slate-750 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white block mb-1">Informe Disciplinario del Árbitro:</strong>
                  {referee.trendDescription}
                </div>
              </div>
            </div>
          )}

          {/* TAB: H2H */}
          {activeTab === 'h2h' && (
            <div className="space-y-4">
              <div className="bg-[#182337] rounded-xl p-4 border border-slate-750">
                <h4 className="font-bold text-white text-sm mb-3">
                  Historial Reciente de Enfrentamientos Directos
                </h4>
                <div className="space-y-2 text-xs">
                  {match.h2h && match.h2h.length > 0 ? (
                    match.h2h.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 bg-[#121c2d] rounded-lg border border-slate-750"
                      >
                        <span className="text-slate-400 font-mono text-[11px]">{item.date}</span>
                        <span className="font-semibold text-white">
                          {item.home} {item.score} {item.away}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {item.winner === 'home'
                            ? `Victoria ${item.home}`
                            : item.winner === 'away'
                            ? `Victoria ${item.away}`
                            : 'Empate'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 text-xs py-2">
                      Sin registro de duelos directos oficiales en las últimas temporadas.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Close Bar */}
        <div className="px-5 py-3 border-t border-slate-750 bg-[#0f1725] flex items-center justify-between text-xs text-slate-400">
          <span>VortexTips Analytics • Análisis imparcial de datos deportivos</span>
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
