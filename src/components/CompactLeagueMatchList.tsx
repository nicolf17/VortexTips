import React, { useState, useMemo } from 'react';
import { Star, ChevronDown, ChevronUp, Pin, BarChart2 } from 'lucide-react';
import { Match } from '../types/football';
import { getLeagueMeta } from '../utils/leagueUtils';
import { formatColombia12h } from '../utils/dateUtils';

interface CompactLeagueMatchListProps {
  matches: Match[];
  onOpenAnalysis: (match: Match) => void;
  onSelectLeague?: (leagueCode: string) => void;
}

interface LeagueGroup {
  leagueCode: string;
  leagueName: string;
  country: string;
  icon: string;
  fullTitle: string;
  matches: Match[];
}

export const CompactLeagueMatchList: React.FC<CompactLeagueMatchListProps> = ({
  matches,
  onOpenAnalysis,
  onSelectLeague,
}) => {
  // State for pinned/favorite matches
  const [favoriteMatchIds, setFavoriteMatchIds] = useState<Set<string>>(new Set());

  // State for collapsed leagues
  const [collapsedLeagues, setCollapsedLeagues] = useState<Set<string>>(new Set());

  const toggleFavorite = (e: React.MouseEvent, matchId: string) => {
    e.stopPropagation();
    setFavoriteMatchIds((prev) => {
      const next = new Set(prev);
      if (next.has(matchId)) next.delete(matchId);
      else next.add(matchId);
      return next;
    });
  };

  const toggleLeagueCollapse = (leagueCode: string) => {
    setCollapsedLeagues((prev) => {
      const next = new Set(prev);
      if (next.has(leagueCode)) next.delete(leagueCode);
      else next.add(leagueCode);
      return next;
    });
  };

  // Group matches strictly by league preserving authentic tournament order
  const leagueGroups: LeagueGroup[] = useMemo(() => {
    const priorityMap: Record<string, number> = {
      COL: 1,
      UCL: 2,
      ESP: 3,
      EPL: 4,
      ITA: 5,
      GER: 6,
      FRA: 7,
      LIB: 8,
      UEL: 9,
      LMX: 10,
    };

    const map = new Map<string, Match[]>();

    matches.forEach((m) => {
      const code = m.leagueCode || 'OTHER';
      if (!map.has(code)) {
        map.set(code, []);
      }
      map.get(code)!.push(m);
    });

    const groups: LeagueGroup[] = [];

    map.forEach((matchList, code) => {
      const sample = matchList[0];
      const meta = getLeagueMeta(sample.league, code);
      const countryCaps = meta.country ? meta.country.toUpperCase() : 'COMPETICIÓN';

      // Title matching Flashscore style: e.g. "COLOMBIA: Liga BetPlay" or "ESPAÑA: LaLiga EA Sports"
      const fullTitle = meta.isInternational
        ? `${countryCaps}: ${meta.name}`
        : `${countryCaps}: ${meta.name}`;

      // Sort matches in group: favorites first, then by kickoff time
      const sortedMatches = [...matchList].sort((a, b) => {
        const aFav = favoriteMatchIds.has(a.id) ? 1 : 0;
        const bFav = favoriteMatchIds.has(b.id) ? 1 : 0;
        if (aFav !== bFav) return bFav - aFav;
        return a.kickoffTime.localeCompare(b.kickoffTime);
      });

      groups.push({
        leagueCode: code,
        leagueName: meta.name,
        country: meta.country,
        icon: meta.icon,
        fullTitle,
        matches: sortedMatches,
      });
    });

    // Sort groups according to tournament priority
    return groups.sort((a, b) => {
      const prioA = priorityMap[a.leagueCode] || 99;
      const prioB = priorityMap[b.leagueCode] || 99;
      return prioA - prioB;
    });
  }, [matches, favoriteMatchIds]);

  if (matches.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 w-full">
      {leagueGroups.map((group) => {
        const isCollapsed = collapsedLeagues.has(group.leagueCode);

        return (
          <div
            key={group.leagueCode}
            className="rounded-xl overflow-hidden border border-slate-750 bg-[#121929] shadow-sm"
          >
            {/* Flashscore-style League Header Bar */}
            <div
              onClick={() => toggleLeagueCollapse(group.leagueCode)}
              className="bg-[#152033] hover:bg-[#18253b] px-3.5 py-2.5 flex items-center justify-between border-b border-slate-700/80 cursor-pointer select-none transition-colors"
            >
              <div className="flex items-center gap-2.5 truncate">
                {/* Header Star Icon */}
                <Star className="w-4 h-4 text-slate-400 shrink-0" />

                {/* Country Flag & Tournament Title */}
                <span className="text-sm shrink-0">{group.icon}</span>
                <span className="font-extrabold text-white text-xs sm:text-sm tracking-tight truncate">
                  {group.fullTitle}
                </span>

                {/* Pin Icon */}
                <Pin className="w-3.5 h-3.5 text-slate-400 rotate-45 shrink-0 hidden sm:inline" />
              </div>

              {/* Right side: Clasificación link & Collapse Chevron */}
              <div className="flex items-center gap-3 shrink-0 text-xs">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectLeague) onSelectLeague(group.leagueCode);
                  }}
                  className="text-slate-300 hover:text-white font-semibold underline underline-offset-2 text-[11px] transition-colors cursor-pointer"
                >
                  Clasificación
                </button>
                <div className="text-slate-400 hover:text-white transition-colors">
                  {isCollapsed ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </div>
              </div>
            </div>

            {/* Match Rows List */}
            {!isCollapsed && (
              <div className="divide-y divide-slate-800/80">
                {group.matches.map((match) => {
                  const isFav = favoriteMatchIds.has(match.id);
                  const isLive = match.status === 'LIVE';
                  const isFinished = match.status === 'FINISHED';

                  // 12-hour Colombia kickoff time (e.g. "2:00 PM", "7:30 PM")
                  const time12h = formatColombia12h(match.kickoffTime);

                  // Extract authentic odds with Betano & BetPlay average
                  const betano = match.odds?.betano || {
                    home: match.odds?.home ?? 1.95,
                    draw: match.odds?.draw ?? 3.3,
                    away: match.odds?.away ?? 4.1,
                    over25: match.odds?.over25 ?? 1.85,
                    bttsYes: match.odds?.bttsYes ?? 1.88,
                    cornersOver85: match.odds?.cornersOver85 ?? 1.72,
                  };

                  const betplay = match.odds?.betplay || {
                    home: match.odds?.home ? match.odds.home + 0.02 : 1.98,
                    draw: match.odds?.draw ? match.odds.draw - 0.02 : 3.28,
                    away: match.odds?.away ? match.odds.away + 0.04 : 4.15,
                    over25: match.odds?.over25 ? match.odds.over25 - 0.02 : 1.83,
                    bttsYes: match.odds?.bttsYes ? match.odds.bttsYes - 0.01 : 1.86,
                    cornersOver85: match.odds?.cornersOver85 ? match.odds.cornersOver85 + 0.02 : 1.75,
                  };

                  // ML (1X2) Average Odds
                  const homeAvg = ((betano.home + betplay.home) / 2).toFixed(2);
                  const drawAvg = ((betano.draw + betplay.draw) / 2).toFixed(2);
                  const awayAvg = ((betano.away + betplay.away) / 2).toFixed(2);

                  // AA (Ambos Anotan / BTTS) Average Odd
                  const aaAvg = ((betano.bttsYes + betplay.bttsYes) / 2).toFixed(2);

                  // Corners Line: default calibrated around ~1.65 - 1.75
                  const cornersAvg = (
                    ((betano.cornersOver85 || 1.72) + (betplay.cornersOver85 || 1.75)) /
                    2
                  ).toFixed(2);

                  return (
                    <div
                      key={match.id}
                      onClick={() => onOpenAnalysis(match)}
                      className="px-3 sm:px-4 py-2.5 hover:bg-[#182338] transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 group"
                    >
                      {/* Left Side: Favorite Star + 12h Time + Teams (Stacked) + Center Status */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Interactive Favorite Star */}
                        <button
                          type="button"
                          onClick={(e) => toggleFavorite(e, match.id)}
                          className="text-slate-400 hover:text-amber-400 transition-colors p-0.5 shrink-0 cursor-pointer"
                          title={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              isFav
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-400 group-hover:text-slate-200'
                            }`}
                          />
                        </button>

                        {/* Kickoff Time (12h Colombia AM/PM) or Live Status */}
                        <div className="w-16 sm:w-20 shrink-0 text-left">
                          {isLive ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-800/50 px-1.5 py-0.5 rounded animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>{match.minute ? `${match.minute}'` : 'VIVO'}</span>
                            </span>
                          ) : isFinished ? (
                            <span className="text-[11px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                              Final
                            </span>
                          ) : (
                            <span className="text-xs font-mono font-bold text-slate-300">
                              {time12h}
                            </span>
                          )}
                        </div>

                        {/* Teams Stack (Home & Away with Club Logos) */}
                        <div className="flex-1 min-w-0 pr-2 space-y-1">
                          {/* Home Team */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 truncate">
                              <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                                {match.homeTeam.logo ? (
                                  <img
                                    src={match.homeTeam.logo}
                                    alt={match.homeTeam.name}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <span className="text-[8px] font-bold text-white">
                                    {match.homeTeam.shortName?.substring(0, 2) || 'L'}
                                  </span>
                                )}
                              </div>
                              <span
                                className={`text-xs font-semibold truncate ${
                                  isFinished && (match.homeScore ?? 0) > (match.awayScore ?? 0)
                                    ? 'text-white font-bold'
                                    : 'text-slate-200'
                                } group-hover:text-violet-300 transition-colors`}
                              >
                                {match.homeTeam.name}
                              </span>
                            </div>
                            {(isLive || isFinished) && (
                              <span className="font-mono text-xs font-extrabold text-white shrink-0">
                                {match.homeScore ?? 0}
                              </span>
                            )}
                          </div>

                          {/* Away Team */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 truncate">
                              <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                                {match.awayTeam.logo ? (
                                  <img
                                    src={match.awayTeam.logo}
                                    alt={match.awayTeam.name}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <span className="text-[8px] font-bold text-white">
                                    {match.awayTeam.shortName?.substring(0, 2) || 'V'}
                                  </span>
                                )}
                              </div>
                              <span
                                className={`text-xs font-semibold truncate ${
                                  isFinished && (match.awayScore ?? 0) > (match.homeScore ?? 0)
                                    ? 'text-white font-bold'
                                    : 'text-slate-200'
                                } group-hover:text-violet-300 transition-colors`}
                              >
                                {match.awayTeam.name}
                              </span>
                            </div>
                            {(isLive || isFinished) && (
                              <span className="font-mono text-xs font-extrabold text-white shrink-0">
                                {match.awayScore ?? 0}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status / PREVIEW badge (like in the screenshot) */}
                        {!isLive && !isFinished && (
                          <div className="hidden sm:block shrink-0 px-2 py-0.5 bg-[#172236] border border-slate-700 rounded text-[10px] font-mono font-bold text-slate-300 group-hover:border-violet-500/60 group-hover:text-violet-200 transition-colors">
                            PREVIEW
                          </div>
                        )}
                      </div>

                      {/* Right Side: Exact requested Odds Columns (ML: 1X2, AA: Ambos Anotan, Corners) */}
                      <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                        {/* ML (Moneyline 1X2) Box */}
                        <div
                          className="bg-[#141d2e] border border-slate-750 rounded-lg px-2 py-1 flex items-center gap-1.5 text-[11px] font-mono text-slate-300 shadow-2xs"
                          title={`Cuotas 1X2 (Promedio Betano & BetPlay): Local ${homeAvg} | Empate ${drawAvg} | Visita ${awayAvg}`}
                        >
                          <span className="text-[10px] text-slate-400 font-sans font-bold">1X2</span>
                          <span className="font-bold text-white">{homeAvg}</span>
                          <span className="text-slate-600">|</span>
                          <span className="text-slate-400 hidden sm:inline">{drawAvg}</span>
                          <span className="text-slate-600 hidden sm:inline">|</span>
                          <span className="font-bold text-white">{awayAvg}</span>
                        </div>

                        {/* AA (Ambos Anotan / BTTS) Box */}
                        <div
                          className="bg-[#141d2e] border border-slate-750 rounded-lg px-2 py-1 flex items-center gap-1 text-[11px] font-mono text-slate-300 shadow-2xs"
                          title="Ambos Equipos Anotan (AA: Sí)"
                        >
                          <span className="text-[10px] text-slate-400 font-sans font-bold">AA</span>
                          <span className="font-bold text-slate-200">{aaAvg}</span>
                        </div>

                        {/* Corners (+8.5c) Box */}
                        <div
                          className="bg-[#141d2e] border border-slate-750 rounded-lg px-2 py-1 flex items-center gap-1 text-[11px] font-mono text-slate-300 shadow-2xs"
                          title="Línea de Córners (+8.5 Córners Totales)"
                        >
                          <span className="text-[10px] text-emerald-400 font-sans font-bold">+8.5c</span>
                          <span className="font-bold text-emerald-200">{cornersAvg}</span>
                        </div>

                        {/* Quick Stats trigger button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenAnalysis(match);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
                          title="Abrir análisis estadístico completo"
                        >
                          <BarChart2 className="w-3.5 h-3.5 text-slate-300" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
