import React from 'react';
import { Match } from '../types/football';
import { ChevronRight, ShieldAlert, BarChart3, Percent } from 'lucide-react';
import { getLeagueMeta } from '../utils/leagueUtils';
import { formatColombia12h } from '../utils/dateUtils';
import { getLocalizedTeamName, getLocalizedShortTeamName } from '../utils/localization';
import { UNAVAILABLE_DATA_MESSAGE, validateMatchIdentifiers } from '../services/api';

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
  const idValidation = validateMatchIdentifiers(match);

  const leagueMeta = getLeagueMeta(match.league, match.leagueCode);
  const homeTeamName = getLocalizedTeamName(match.homeTeam.name);
  const awayTeamName = getLocalizedTeamName(match.awayTeam.name);
  const homeTeamShort = getLocalizedShortTeamName(match.homeTeam.name, match.homeTeam.shortName);
  const awayTeamShort = getLocalizedShortTeamName(match.awayTeam.name, match.awayTeam.shortName);

  const hasRealOdds = Boolean(match.odds?.hasRealOdds && match.odds.home > 0);
  const betano = match.odds?.betano;
  const betplay = match.odds?.betplay;

  const referee = idValidation.isValid ? match.refereeInfo : undefined;
  const kickoffTime = formatColombia12h(match.kickoffTime || '');

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

  const homeForm = idValidation.isValid ? match.homeTeam?.stats?.form || [] : [];
  const awayForm = idValidation.isValid ? match.awayTeam?.stats?.form || [] : [];

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
                alt={homeTeamName}
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              homeTeamShort || homeTeamName.substring(0, 3).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-white text-sm sm:text-base leading-tight truncate group-hover:text-sky-300 transition-colors">
              {homeTeamName}
            </h4>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] text-slate-400 font-medium">Forma:</span>
              {homeForm.length > 0 ? (
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
              ) : (
                <span className="text-[10px] font-mono text-slate-500">
                  {UNAVAILABLE_DATA_MESSAGE}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Score or PREVIEW */}
        <div className="col-span-2 text-center">
          {isLive || isFinished ? (
            <div className="inline-flex items-center justify-center px-3 py-1 bg-slate-900 border border-slate-700 text-white rounded-lg font-mono font-bold text-base shadow-inner">
              {match.homeScore ?? 0} - {match.awayScore ?? 0}
            </div>
          ) : (
            <div className="inline-flex items-center justify-center px-2 py-0.5 bg-[#0c1f38] border border-sky-500/40 text-sky-300 rounded font-mono font-bold text-[10px] tracking-wider uppercase">
              PREVIEW
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="col-span-5 flex items-center justify-end gap-3 text-right">
          <div className="min-w-0">
            <h4 className="font-bold text-white text-sm sm:text-base leading-tight truncate group-hover:text-sky-300 transition-colors">
              {awayTeamName}
            </h4>
            <div className="flex items-center justify-end gap-1 mt-1">
              {awayForm.length > 0 ? (
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
              ) : (
                <span className="text-[10px] font-mono text-slate-500">
                  {UNAVAILABLE_DATA_MESSAGE}
                </span>
              )}
              <span className="text-[10px] text-slate-400 font-medium">Forma</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-sm overflow-hidden shrink-0 group-hover:border-sky-500/50 transition-colors">
            {match.awayTeam.logo ? (
              <img
                src={match.awayTeam.logo}
                alt={awayTeamName}
                className="w-full h-full object-contain p-1"
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
              1 ({homeTeamShort || homeTeamName.split(' ')[0]})
            </div>
            <div className="text-sm font-extrabold text-sky-300 font-mono mt-0.5">
              {homeAvg}
            </div>
            {betano && betplay && (
              <div className="flex items-center justify-center gap-2 mt-1 text-[9px] text-slate-400 border-t border-slate-750 pt-1 font-mono">
                <span>Bno: <strong className="text-slate-200">{betano.home.toFixed(2)}</strong></span>
                <span>Bplay: <strong className="text-slate-200">{betplay.home.toFixed(2)}</strong></span>
              </div>
            )}
            <div className="mt-1 flex items-center justify-center text-[9px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 rounded py-0.5">
              <Percent className="w-2.5 h-2.5 mr-0.5" />
              {homeProb !== null ? `${homeProb}% prob.` : 'N/D'}
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
            {betano && betplay && (
              <div className="flex items-center justify-center gap-2 mt-1 text-[9px] text-slate-400 border-t border-slate-750 pt-1 font-mono">
                <span>Bno: <strong className="text-slate-200">{betano.draw.toFixed(2)}</strong></span>
                <span>Bplay: <strong className="text-slate-200">{betplay.draw.toFixed(2)}</strong></span>
              </div>
            )}
            <div className="mt-1 flex items-center justify-center text-[9px] font-medium text-slate-400 bg-slate-800/60 rounded py-0.5">
              <Percent className="w-2.5 h-2.5 mr-0.5" />
              {drawProb !== null ? `${drawProb}% prob.` : 'N/D'}
            </div>
          </div>

          {/* 2 - Away */}
          <div className="bg-[#182133] rounded-lg p-2 border border-slate-700/80 text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase truncate">
              2 ({awayTeamShort || awayTeamName.split(' ')[0]})
            </div>
            <div className="text-sm font-extrabold text-sky-300 font-mono mt-0.5">
              {awayAvg}
            </div>
            {betano && betplay && (
              <div className="flex items-center justify-center gap-2 mt-1 text-[9px] text-slate-400 border-t border-slate-750 pt-1 font-mono">
                <span>Bno: <strong className="text-slate-200">{betano.away.toFixed(2)}</strong></span>
                <span>Bplay: <strong className="text-slate-200">{betplay.away.toFixed(2)}</strong></span>
              </div>
            )}
            <div className="mt-1 flex items-center justify-center text-[9px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 rounded py-0.5">
              <Percent className="w-2.5 h-2.5 mr-0.5" />
              {awayProb !== null ? `${awayProb}% prob.` : 'N/D'}
            </div>
          </div>
        </div>
      </div>

      {/* Footer bar: Referee stats & View Analysis Action */}
      <div className="mt-3 pt-2.5 border-t border-slate-750 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-[11px] font-medium">
            Árbitro: <strong className="text-slate-200">{referee?.name || 'Por verificar'}</strong>
          </span>
          {referee?.yellowAvg !== null && referee?.yellowAvg !== undefined && (
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              ({referee.yellowAvg} amarillas/p)
            </span>
          )}
        </div>

        <span className="flex items-center gap-1 text-[11px] font-semibold text-sky-300 group-hover:translate-x-0.5 transition-transform">
          Ver Análisis & Estadísticas
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
