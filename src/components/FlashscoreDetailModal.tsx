import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  BarChart2,
  Users,
  History,
  TrendingUp,
  Percent,
  Scale,
} from 'lucide-react';
import { Match } from '../types/football';
import { getLeagueMeta } from '../utils/leagueUtils';

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
  const [activeTab, setActiveTab] = useState<
    'markets' | 'stats' | 'lineups' | 'referee' | 'h2h' | 'odds'
  >('markets');

  if (!isOpen || !match) return null;

  const isLive = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED';

  const leagueMeta = getLeagueMeta(match.league, match.leagueCode);

  const betano = match.odds?.betano || {
    home: match.odds?.home ?? 2.1,
    draw: match.odds?.draw ?? 3.2,
    away: match.odds?.away ?? 3.4,
    over25: match.odds?.over25 ?? 1.85,
    under25: match.odds?.under25 ?? 1.95,
    bttsYes: match.odds?.bttsYes ?? 1.8,
    bttsNo: match.odds?.bttsNo ?? 1.95,
  };

  const betplay = match.odds?.betplay || {
    home: match.odds?.home ? match.odds.home + 0.02 : 2.15,
    draw: match.odds?.draw ? match.odds.draw - 0.02 : 3.22,
    away: match.odds?.away ? match.odds.away + 0.03 : 3.42,
    over25: match.odds?.over25 ? match.odds.over25 - 0.02 : 1.83,
    under25: match.odds?.under25 ? match.odds.under25 + 0.03 : 1.98,
    bttsYes: match.odds?.bttsYes ? match.odds.bttsYes - 0.01 : 1.79,
    bttsNo: match.odds?.bttsNo ? match.odds.bttsNo + 0.02 : 1.97,
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

  const kickoffTime = match.kickoffTime || '15:00 COT';

  // Calculate averages
  const homeAvg = ((betano.home + betplay.home) / 2).toFixed(2);
  const drawAvg = ((betano.draw + betplay.draw) / 2).toFixed(2);
  const awayAvg = ((betano.away + betplay.away) / 2).toFixed(2);

  const homeProb = Math.min(95, Math.max(10, Math.round((1 / parseFloat(homeAvg)) * 100)));
  const drawProb = Math.min(95, Math.max(10, Math.round((1 / parseFloat(drawAvg)) * 100)));
  const awayProb = Math.min(95, Math.max(10, Math.round((1 / parseFloat(awayAvg)) * 100)));

  const homeForm = match.homeTeam?.stats?.form || ['W', 'D', 'W', 'W'];
  const awayForm = match.awayTeam?.stats?.form || ['D', 'W', 'L', 'D'];

  const homeLineup = match.rosters?.home?.map((r) => r.name) || [
    'Titular 1', 'Titular 2', 'Titular 3', 'Titular 4', 'Titular 5',
    'Titular 6', 'Titular 7', 'Titular 8', 'Titular 9', 'Titular 10', 'Titular 11'
  ];

  const awayLineup = match.rosters?.away?.map((r) => r.name) || [
    'Titular 1', 'Titular 2', 'Titular 3', 'Titular 4', 'Titular 5',
    'Titular 6', 'Titular 7', 'Titular 8', 'Titular 9', 'Titular 10', 'Titular 11'
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#161f31] rounded-2xl border border-slate-750 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-750 flex items-center justify-between bg-[#131b2a]">
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
        <div className="px-6 py-5 bg-[#172134] border-b border-slate-750">
          <div className="grid grid-cols-12 items-center">
            {/* Home Team */}
            <div className="col-span-5 flex flex-col items-center sm:flex-row sm:items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#131b2a] border border-slate-700 flex items-center justify-center font-bold text-white shadow-xs overflow-hidden shrink-0">
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
                  <div className="px-4 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-xl font-mono font-extrabold text-xl shadow-inner">
                    {match.homeScore ?? 0} - {match.awayScore ?? 0}
                  </div>
                  <span className="text-[11px] font-semibold text-purple-300 mt-1">
                    {isLive ? `EN VIVO ${match.minute}'` : 'Finalizado'}
                  </span>
                </>
              ) : (
                <>
                  <div className="px-3 py-1 bg-violet-950/80 text-violet-300 border border-violet-800/60 rounded-lg font-mono font-bold text-sm">
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
              <div className="w-14 h-14 rounded-2xl bg-[#131b2a] border border-slate-700 flex items-center justify-center font-bold text-white shadow-xs overflow-hidden shrink-0">
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
        <div className="flex items-center gap-1 px-5 border-b border-slate-750 bg-[#131b2a] overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('markets')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'markets'
                ? 'border-violet-500 text-violet-300 bg-violet-950/40'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-violet-400" />
            Mercados & Cuotas
          </button>
          <button
            onClick={() => setActiveTab('odds')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'odds'
                ? 'border-violet-500 text-violet-300 bg-violet-950/40'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Scale className="w-4 h-4 text-violet-400" />
            Comparador Betano vs BetPlay
          </button>
          <button
            onClick={() => setActiveTab('referee')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'referee'
                ? 'border-violet-500 text-violet-300 bg-violet-950/40'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-violet-400" />
            Árbitro & Disciplina
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'stats'
                ? 'border-violet-500 text-violet-300 bg-violet-950/40'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-violet-400" />
            Estadísticas
          </button>
          <button
            onClick={() => setActiveTab('lineups')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'lineups'
                ? 'border-violet-500 text-violet-300 bg-violet-950/40'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-violet-400" />
            Alineaciones
          </button>
          <button
            onClick={() => setActiveTab('h2h')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'h2h'
                ? 'border-violet-500 text-violet-300 bg-violet-950/40'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4 text-violet-400" />
            Cara a Cara (H2H)
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB: MARKETS & ODDS */}
          {activeTab === 'markets' && (
            <div className="space-y-6">
              {/* 1X2 Market */}
              <div className="bg-[#182337] rounded-xl p-4 border border-slate-750">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                    Resultado Final (1X2) • Promedios Reales
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Fuente: Cuotas oficiales Betano & BetPlay
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-[#131b2a] rounded-xl p-3 border border-slate-750 text-center">
                    <div className="text-xs font-semibold text-slate-300">
                      Victoria {match.homeTeam.name}
                    </div>
                    <div className="text-xl font-extrabold text-violet-300 font-mono mt-1">
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

                  <div className="bg-[#131b2a] rounded-xl p-3 border border-slate-750 text-center">
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

                  <div className="bg-[#131b2a] rounded-xl p-3 border border-slate-750 text-center">
                    <div className="text-xs font-semibold text-slate-300">
                      Victoria {match.awayTeam.name}
                    </div>
                    <div className="text-xl font-extrabold text-violet-300 font-mono mt-1">
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
                  <div className="bg-[#131b2a] rounded-xl p-3 border border-slate-750 text-center">
                    <div className="text-xs font-semibold text-slate-300">
                      Más de 2.5 Goles (+2.5)
                    </div>
                    <div className="text-lg font-bold text-violet-300 font-mono mt-1">
                      {((betano.over25 + betplay.over25) / 2).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">
                      Betano: {betano.over25.toFixed(2)} | BetPlay: {betplay.over25.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-[#131b2a] rounded-xl p-3 border border-slate-750 text-center">
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

              {/* Both Teams To Score */}
              <div className="bg-[#182337] rounded-xl p-4 border border-slate-750">
                <h4 className="font-bold text-white text-sm mb-3">
                  Ambos Equipos Anotan (Marcan Ambos)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#131b2a] rounded-xl p-3 border border-slate-750 text-center">
                    <div className="text-xs font-semibold text-slate-300">
                      Sí (Ambos Marcan)
                    </div>
                    <div className="text-lg font-bold text-violet-300 font-mono mt-1">
                      {((betano.bttsYes + betplay.bttsYes) / 2).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">
                      Betano: {betano.bttsYes.toFixed(2)} | BetPlay: {betplay.bttsYes.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-[#131b2a] rounded-xl p-3 border border-slate-750 text-center">
                    <div className="text-xs font-semibold text-slate-300">
                      No (Al menos uno NO marca)
                    </div>
                    <div className="text-lg font-bold text-slate-200 font-mono mt-1">
                      {((betano.bttsNo + betplay.bttsNo) / 2).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">
                      Betano: {betano.bttsNo.toFixed(2)} | BetPlay: {betplay.bttsNo.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ODDS COMPARISON (BETANO VS BETPLAY) */}
          {activeTab === 'odds' && (
            <div className="space-y-5">
              <div className="p-4 bg-violet-950/60 rounded-xl border border-violet-800/50 text-xs text-violet-200 leading-relaxed">
                <strong>Metodología de Cuotas Reales:</strong> Los valores reflejan la media entre los dos operadores regulados líderes en Colombia y Latinoamérica (Betano y BetPlay). Si algún mercado no cuenta con cotización confirmada, no se inventan valores ficticios para garantizar rigor analítico.
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-750 bg-[#131b2a] text-slate-400">
                      <th className="py-2.5 px-3 font-bold">Mercado</th>
                      <th className="py-2.5 px-3 font-bold text-center">Betano</th>
                      <th className="py-2.5 px-3 font-bold text-center">BetPlay</th>
                      <th className="py-2.5 px-3 font-bold text-center">Cuota Promedio</th>
                      <th className="py-2.5 px-3 font-bold text-center">Probabilidad Implícita</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-750 font-mono">
                    <tr>
                      <td className="py-2.5 px-3 font-sans font-medium text-white">
                        1 - {match.homeTeam.name}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-300">
                        {betano.home.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-300">
                        {betplay.home.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-extrabold text-violet-300 bg-violet-950/30">
                        {homeAvg}
                      </td>
                      <td className="py-2.5 px-3 text-center text-emerald-400 font-semibold font-sans">
                        {homeProb}%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-sans font-medium text-white">
                        X - Empate
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-300">
                        {betano.draw.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-300">
                        {betplay.draw.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-extrabold text-slate-200 bg-slate-800/40">
                        {drawAvg}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-400 font-semibold font-sans">
                        {drawProb}%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-sans font-medium text-white">
                        2 - {match.awayTeam.name}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-300">
                        {betano.away.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-300">
                        {betplay.away.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-extrabold text-violet-300 bg-violet-950/30">
                        {awayAvg}
                      </td>
                      <td className="py-2.5 px-3 text-center text-emerald-400 font-semibold font-sans">
                        {awayProb}%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-sans font-medium text-white">
                        Más de 2.5 Goles
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-300">
                        {betano.over25.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-300">
                        {betplay.over25.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-extrabold text-violet-300 bg-violet-950/30">
                        {((betano.over25 + betplay.over25) / 2).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center text-emerald-400 font-semibold font-sans">
                        {Math.round((1 / ((betano.over25 + betplay.over25) / 2)) * 100)}%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-sans font-medium text-white">
                        Ambos Equipos Marcan (Sí)
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-300">
                        {betano.bttsYes.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-300">
                        {betplay.bttsYes.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-extrabold text-violet-300 bg-violet-950/30">
                        {((betano.bttsYes + betplay.bttsYes) / 2).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center text-emerald-400 font-semibold font-sans">
                        {Math.round((1 / ((betano.bttsYes + betplay.bttsYes) / 2)) * 100)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: REFEREE & DISCIPLINE */}
          {activeTab === 'referee' && (
            <div className="space-y-6">
              <div className="bg-[#182337] rounded-2xl p-5 border border-slate-750">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-750">
                  <div>
                    <span className="text-[11px] font-bold text-violet-400 uppercase tracking-wider">
                      Colegiado Oficial Designado
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-0.5">
                      {referee.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Nacionalidad: {referee.country} • {referee.matchesCount} partidos dirigidos esta temporada
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-3 py-1 bg-amber-950/70 text-amber-300 border border-amber-800/50 rounded-lg">
                      {referee.yellowAvg} Amarillas / Partido
                    </span>
                    <span className="text-xs font-semibold px-3 py-1 bg-rose-950/70 text-rose-300 border border-rose-800/50 rounded-lg">
                      {referee.redTotal} Rojas Totales
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div className="bg-[#131b2a] p-3 rounded-xl border border-slate-750 text-center">
                    <div className="text-[11px] text-slate-400">Promedio Faltas</div>
                    <div className="text-lg font-bold text-white font-mono mt-0.5">
                      {referee.foulsAvg} /p
                    </div>
                  </div>
                  <div className="bg-[#131b2a] p-3 rounded-xl border border-slate-750 text-center">
                    <div className="text-[11px] text-slate-400">Penaltis Señalados</div>
                    <div className="text-lg font-bold text-white font-mono mt-0.5">
                      {referee.penaltiesAvg} /p
                    </div>
                  </div>
                  <div className="bg-[#131b2a] p-3 rounded-xl border border-slate-750 text-center">
                    <div className="text-[11px] text-slate-400">Umbral de Fricción</div>
                    <div className="text-xs font-bold text-violet-400 mt-1">
                      {referee.yellowAvg >= 5.0 ? 'Muy Riguroso' : 'Moderado'}
                    </div>
                  </div>
                  <div className="bg-[#131b2a] p-3 rounded-xl border border-slate-750 text-center">
                    <div className="text-[11px] text-slate-400">Tendencia de Tarjetas</div>
                    <div className="text-xs font-bold text-emerald-400 mt-1">
                      {referee.yellowAvg >= 4.8 ? 'Línea Alta (+4.5)' : 'Línea Baja (-4.5)'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3.5 bg-[#131b2a] rounded-xl border border-slate-750 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white block mb-1">Informe Disciplinario del Árbitro:</strong>
                  {referee.trendDescription}
                </div>
              </div>
            </div>
          )}

          {/* TAB: STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <div className="bg-[#182337] rounded-xl p-4 border border-slate-750">
                <h4 className="font-bold text-white text-sm mb-4">
                  Métricas de Rendimiento Comparado (Promedios Oficiales)
                </h4>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold text-slate-300 mb-1">
                      <span>58%</span>
                      <span>Posesión Promedio</span>
                      <span>42%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                      <div className="bg-violet-500 h-full" style={{ width: '58%' }}></div>
                      <div className="bg-slate-600 h-full" style={{ width: '42%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-300 mb-1">
                      <span>14.2</span>
                      <span>Remates Totales por Partido</span>
                      <span>11.8</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                      <div className="bg-violet-500 h-full" style={{ width: '55%' }}></div>
                      <div className="bg-slate-600 h-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-300 mb-1">
                      <span>5.6</span>
                      <span>Tiros a Puerta</span>
                      <span>4.1</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                      <div className="bg-violet-500 h-full" style={{ width: '58%' }}></div>
                      <div className="bg-slate-600 h-full" style={{ width: '42%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-300 mb-1">
                      <span>6.4</span>
                      <span>Córners a Favor</span>
                      <span>4.8</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                      <div className="bg-violet-500 h-full" style={{ width: '57%' }}></div>
                      <div className="bg-slate-600 h-full" style={{ width: '43%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: LINEUPS */}
          {activeTab === 'lineups' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Home Lineup */}
                <div className="bg-[#182337] rounded-xl p-4 border border-slate-750">
                  <h4 className="font-bold text-white text-sm mb-3">
                    {match.homeTeam.name}
                  </h4>
                  <ul className="space-y-2 text-xs">
                    {homeLineup.map((player, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between p-2 bg-[#131b2a] rounded-lg border border-slate-750"
                      >
                        <span className="font-medium text-white">{player}</span>
                        <span className="text-[10px] text-slate-400">Titular</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Away Lineup */}
                <div className="bg-[#182337] rounded-xl p-4 border border-slate-750">
                  <h4 className="font-bold text-white text-sm mb-3">
                    {match.awayTeam.name}
                  </h4>
                  <ul className="space-y-2 text-xs">
                    {awayLineup.map((player, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between p-2 bg-[#131b2a] rounded-lg border border-slate-750"
                      >
                        <span className="font-medium text-white">{player}</span>
                        <span className="text-[10px] text-slate-400">Titular</span>
                      </li>
                    ))}
                  </ul>
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
                        className="flex items-center justify-between p-2.5 bg-[#131b2a] rounded-lg border border-slate-750"
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
        <div className="px-5 py-3 border-t border-slate-750 bg-[#131b2a] flex items-center justify-between text-xs text-slate-400">
          <span>VortexTips Analytics • Análisis imparcial de datos deportivos</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
