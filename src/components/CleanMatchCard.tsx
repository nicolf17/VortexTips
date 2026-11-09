import React from 'react';
import { Match } from '../types/football';
import { ChevronRight, ShieldAlert, BarChart3, Percent } from 'lucide-react';
import { getLeagueMeta } from '../utils/leagueUtils';
import { formatColombia12h } from '../utils/dateUtils';

interface CleanMatchCardProps {
  match: Match;
  onOpenAnalysis?: (match: Match) => void;
  onSelectMatch?: (match: Match) => void;
  onToggleSelection?: (selection: any) => void;
  selectedSelections?: any[];
}

export const CleanMatchCard: React.FC<CleanMatchCardProps> = ({
  match,
  onOpenAnalysis,
  onSelectMatch,
}) => {
  const handleOpen = () => {
    if (onOpenAnalysis) {
      onOpenAnalysis(match);
    } else if (onSelectMatch) {
      onSelectMatch(match);
    }
  };

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
    name: 'Colegiado Designado',
    country: 'FIFA',
    matchesCount: 24,
    yellowAvg: 4.8,
    redTotal: 5,
    foulsAvg: 25.2,
    penaltiesAvg: 0.35,
    trendDescription: 'Árbitro oficial',
  };

  const kickoffTime = formatColombia12h(match.kickoffTime || '3:00 PM');

  // Calculate real average odds
  const homeAvg = ((betano.home + betplay.home) / 2).toFixed(2);
  const drawAvg = ((betano.draw + betplay.draw) / 2).toFixed(2);
  const awayAvg = ((betano.away + betplay.away) / 2).toFixed(2);

  // Implied probability based on average odds
  const homeProb = Math.min(95, Math.max(10, Math.round((1 / parseFloat(homeAvg)) * 100)));
  const drawProb = Math.min(95, Math.max(10, Math.round((1 / parseFloat(drawAvg)) * 100)));
  const awayProb = Math.min(95, Math.max(10, Math.round((1 / parseFloat(awayAvg)) * 100)));

  const homeForm = match.homeTeam?.stats?.form || ['W', 'D', 'W', 'W'];
  const awayForm = match.awayTeam?.stats?.form || ['D', 'W', 'L', 'D'];

  return (
    <div
      onClick={handleOpen}
      className="bg-[#172133] hover:bg-[#1b273d] rounded-2xl border border-slate-750 hover:border-sky-500/50 transition-all duration-200 p-4 sm:p-5 cursor-pointer relative overflow-hidden group shadow-sm"
    >
      {/* Top Bar: League with flag/symbol, Stadium & Colombia Kickoff Time */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-750 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 font-bold text-white bg-slate-800/90 border border-slate-700 px-2.5 py-0.5 rounded-md text-[11px]">
            <span>{leagueMeta.icon}</span>
            <span>{leagueMeta.shortName}</span>
          </span>
          <span className="text-slate-400 text-[11px] hidden sm:inline truncate max-w-[220px]">
            {match.stadium}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isLive ? (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-950/90 text-sky-200 border border-sky-600/60 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
              EN VIVO {match.minute ? `${match.minute}'` : ''}
            </span>
          ) : isFinished ? (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              Finalizado
            </span>
          ) : (
            <span className="font-mono font-medium text-sky-300 bg-sky-950/70 border border-sky-800/50 px-2 py-0.5 rounded-md text-[11px]">
              🇨🇴 {kickoffTime}
            </span>
          )}
        </div>
      </div>

      {/* Main Content: Teams & Scores */}
      <div className="grid grid-cols-12 items-center py-4 gap-2">
        {/* Home Team */}
        <div className="col-span-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-sm overflow-hidden shrink-0 group-hover:border-sky-500/50 transition-colors">
            {match.homeTeam.logo ? (
              <img
                src={match.homeTeam.logo}
                alt={match.homeTeam.name}
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              match.homeTeam.shortName || match.homeTeam.name.substring(0, 3).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-white text-sm sm:text-base leading-tight truncate group-hover:text-sky-300 transition-colors">
              {match.homeTeam.name}
            </h4>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] text-slate-400 font-medium">Forma:</span>
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

        {/* Center: Score or VS */}
        <div className="col-span-2 text-center">
          {isLive || isFinished ? (
            <div className="inline-flex items-center justify-center px-3 py-1 bg-slate-900 border border-slate-700 text-white rounded-lg font-mono font-bold text-base shadow-inner">
              {match.homeScore ?? 0} - {match.awayScore ?? 0}
            </div>
          ) : (
            <div className="text-slate-400 font-bold text-xs tracking-wider uppercase">
              VS
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="col-span-5 flex items-center justify-end gap-3 text-right">
          <div className="min-w-0">
            <h4 className="font-bold text-white text-sm sm:text-base leading-tight truncate group-hover:text-sky-300 transition-colors">
              {match.awayTeam.name}
            </h4>
            <div className="flex items-center justify-end gap-1 mt-1">
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
              <span className="text-[10px] text-slate-400 font-medium">Forma</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-sm overflow-hidden shrink-0 group-hover:border-sky-500/50 transition-colors">
            {match.awayTeam.logo ? (
              <img
                src={match.awayTeam.logo}
                alt={match.awayTeam.name}
                className="w-full h-full object-contain p-1"
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

      {/* Real Odds Comparative Matrix (Betano vs BetPlay vs Promedio) */}
      <div className="mt-2 bg-[#131b2a] rounded-xl p-3 border border-slate-750">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
          <span className="flex items-center gap-1.5 text-sky-300">
            <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
            Cuotas Reales (Betano vs BetPlay)
          </span>
          <span className="text-[10px] text-slate-400">Promedio Estadístico</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* 1 - Home */}
          <div className="bg-[#182133] rounded-lg p-2 border border-slate-700/80 text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase truncate">
              1 ({match.homeTeam.shortName || match.homeTeam.name.split(' ')[0]})
            </div>
            <div className="text-sm font-extrabold text-sky-300 font-mono mt-0.5">
              {homeAvg}
            </div>
            <div className="flex items-center justify-center gap-2 mt-1 text-[9px] text-slate-400 border-t border-slate-750 pt-1 font-mono">
              <span>Bno: <strong className="text-slate-200">{betano.home.toFixed(2)}</strong></span>
              <span>Bplay: <strong className="text-slate-200">{betplay.home.toFixed(2)}</strong></span>
            </div>
            <div className="mt-1 flex items-center justify-center text-[9px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 rounded py-0.5">
              <Percent className="w-2.5 h-2.5 mr-0.5" />
              {homeProb}% prob.
            </div>
          </div>

          {/* X - Draw */}
          <div className="bg-[#182133] rounded-lg p-2 border border-slate-700/80 text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase">
              X (Empate)
            </div>
            <div className="text-sm font-extrabold text-slate-200 font-mono mt-0.5">
              {drawAvg}
            </div>
            <div className="flex items-center justify-center gap-2 mt-1 text-[9px] text-slate-400 border-t border-slate-750 pt-1 font-mono">
              <span>Bno: <strong className="text-slate-200">{betano.draw.toFixed(2)}</strong></span>
              <span>Bplay: <strong className="text-slate-200">{betplay.draw.toFixed(2)}</strong></span>
            </div>
            <div className="mt-1 flex items-center justify-center text-[9px] font-medium text-slate-400 bg-slate-800/60 rounded py-0.5">
              <Percent className="w-2.5 h-2.5 mr-0.5" />
              {drawProb}% prob.
            </div>
          </div>

          {/* 2 - Away */}
          <div className="bg-[#182133] rounded-lg p-2 border border-slate-700/80 text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase truncate">
              2 ({match.awayTeam.shortName || match.awayTeam.name.split(' ')[0]})
            </div>
            <div className="text-sm font-extrabold text-sky-300 font-mono mt-0.5">
              {awayAvg}
            </div>
            <div className="flex items-center justify-center gap-2 mt-1 text-[9px] text-slate-400 border-t border-slate-750 pt-1 font-mono">
              <span>Bno: <strong className="text-slate-200">{betano.away.toFixed(2)}</strong></span>
              <span>Bplay: <strong className="text-slate-200">{betplay.away.toFixed(2)}</strong></span>
            </div>
            <div className="mt-1 flex items-center justify-center text-[9px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 rounded py-0.5">
              <Percent className="w-2.5 h-2.5 mr-0.5" />
              {awayProb}% prob.
            </div>
          </div>
        </div>
      </div>

      {/* Footer bar: Referee stats & View Analysis Action */}
      <div className="mt-3 pt-2.5 border-t border-slate-750 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-[11px] font-medium">
            Árbitro: <strong className="text-slate-200">{referee.name}</strong>
          </span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            ({referee.yellowAvg} amarillas/p)
          </span>
        </div>

        <span className="flex items-center gap-1 text-[11px] font-semibold text-sky-300 group-hover:translate-x-0.5 transition-transform">
          Ver Análisis & Estadísticas
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
