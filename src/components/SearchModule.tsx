import React, { useState, useMemo } from 'react';
import { Search, X, User, ShieldAlert, Calendar, ChevronRight } from 'lucide-react';
import { Match, PlayerProfile, RefereeInfo } from '../types/football';
import { PLAYERS_DATA, REFEREES_DATA, MOCK_MATCHES } from '../data/mockMatches';
import { getLeagueMeta } from '../utils/leagueUtils';
import { formatColombia12h } from '../utils/dateUtils';

interface SearchModuleProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSelectMatch?: (match: Match) => void;
  matches?: Match[];
}

export const SearchModule: React.FC<SearchModuleProps> = ({
  isOpen = true,
  onClose,
  onSelectMatch,
  matches = MOCK_MATCHES,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'players' | 'referees' | 'matches'>('all');

  const filteredResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return {
        players: PLAYERS_DATA.slice(0, 8),
        referees: REFEREES_DATA.slice(0, 8),
        matches: matches.slice(0, 6),
      };
    }

    return {
      players: PLAYERS_DATA.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.team.toLowerCase().includes(q) ||
          p.position.toLowerCase().includes(q) ||
          p.league.toLowerCase().includes(q)
      ),
      referees: REFEREES_DATA.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.country.toLowerCase().includes(q)
      ),
      matches: matches.filter(
        (m) =>
          m.homeTeam.name.toLowerCase().includes(q) ||
          m.awayTeam.name.toLowerCase().includes(q) ||
          m.league.toLowerCase().includes(q) ||
          (m.refereeInfo?.name && m.refereeInfo.name.toLowerCase().includes(q))
      ),
    };
  }, [searchQuery, matches]);

  if (!isOpen) return null;

  return (
    <div className="w-full max-w-4xl mx-auto py-2">
      <div className="bg-[#172133] rounded-2xl border border-slate-750 shadow-xl overflow-hidden text-slate-100">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-750 flex items-center gap-3 bg-[#131b2a]">
          <Search className="w-5 h-5 text-sky-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por jugador (Falcao, Luis Díaz, Haaland), árbitro (Wilmar Roldán, Turpin) o club..."
            className="w-full bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none font-medium"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 rounded-lg cursor-pointer"
            >
              Esc
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-750 bg-[#151e2f] overflow-x-auto text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveFilter('players')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'players'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Jugadores ({filteredResults.players.length})
          </button>
          <button
            onClick={() => setActiveFilter('referees')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'referees'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Árbitros ({filteredResults.referees.length})
          </button>
          <button
            onClick={() => setActiveFilter('matches')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'matches'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Partidos ({filteredResults.matches.length})
          </button>
        </div>

        {/* Results Container */}
        <div className="p-4 overflow-y-auto max-h-[65vh] space-y-6">
          {/* Players Section */}
          {(activeFilter === 'all' || activeFilter === 'players') && filteredResults.players.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-400" />
                Jugadores Destacados
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredResults.players.map((player) => (
                  <div
                    key={player.id}
                    className="p-3 bg-[#131b2a] rounded-xl border border-slate-750 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs overflow-hidden shrink-0">
                      {player.photoUrl ? (
                        <img
                          src={player.photoUrl}
                          alt={player.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        player.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-white text-sm truncate">
                          {player.name}
                        </span>
                        <span className="text-[10px] font-mono text-sky-300 bg-sky-950/70 border border-sky-800/50 px-1.5 py-0.5 rounded">
                          #{player.number}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {player.team} • {player.position}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span>Goles: <strong className="text-emerald-400 font-mono">{player.goals}</strong></span>
                        <span>Asist: <strong className="text-sky-300 font-mono">{player.assists}</strong></span>
                        <span>Tiros/90: <strong className="text-slate-200 font-mono">{player.shotsPer90}</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Referees Section */}
          {(activeFilter === 'all' || activeFilter === 'referees') && filteredResults.referees.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
                Cuerpo Arbitral & Métricas Disciplinarias
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredResults.referees.map((ref) => (
                  <div
                    key={ref.name}
                    className="p-3 bg-[#131b2a] rounded-xl border border-slate-750 flex items-start gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-sky-950/80 text-sky-400 border border-sky-800/50 flex items-center justify-center font-bold text-xs shrink-0">
                      ⚖️
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-white text-sm truncate">
                          {ref.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {ref.country === 'Colombia' ? '🇨🇴' : '🌍'} {ref.country}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[11px] text-slate-400 mt-1">
                        <span className="text-amber-400 font-semibold font-mono">
                          🟨 {ref.yellowAvg} amarillas/p
                        </span>
                        <span className="text-rose-400 font-semibold font-mono">
                          🟥 {ref.redTotal} rojas
                        </span>
                        <span className="text-slate-300 font-mono">
                          {ref.foulsAvg} faltas
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-1 italic">
                        {ref.trendDescription}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matches Section */}
          {(activeFilter === 'all' || activeFilter === 'matches') && filteredResults.matches.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                Partidos Oficiales
              </h4>
              <div className="space-y-2">
                {filteredResults.matches.map((match) => {
                  const leagueMeta = getLeagueMeta(match.league, match.leagueCode);
                  return (
                    <div
                      key={match.id}
                      onClick={() => onSelectMatch && onSelectMatch(match)}
                      className="p-3 bg-[#131b2a] hover:bg-[#182337] rounded-xl border border-slate-750 hover:border-sky-500/50 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                          <span>{leagueMeta.icon}</span>
                          <span className="font-semibold text-slate-300">{leagueMeta.shortName}</span>
                          <span>•</span>
                          <span className="font-mono text-sky-300 font-semibold">🇨🇴 {formatColombia12h(match.kickoffTime)}</span>
                        </div>
                        <div className="font-bold text-white text-sm group-hover:text-sky-300 transition-colors">
                          {match.homeTeam.name} vs {match.awayTeam.name}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right text-xs font-mono text-slate-400">
                          <div>1: <strong className="text-white">{match.odds?.home?.toFixed(2) || '2.10'}</strong></div>
                          <div>2: <strong className="text-white">{match.odds?.away?.toFixed(2) || '3.20'}</strong></div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {filteredResults.players.length === 0 &&
            filteredResults.referees.length === 0 &&
            filteredResults.matches.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-sm">
                No se encontraron resultados para "{searchQuery}". Intenta con otro término.
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
