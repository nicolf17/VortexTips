import React, { useState, useMemo } from 'react';
import {
  Trophy,
  X,
  Search,
  Check,
  Star,
} from 'lucide-react';
import { COMPETITIONS_SIDEBAR } from '../data/mockMatches';
import { CountryFlag } from './CountryFlag';

interface CompetitionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeague: string;
  onSelectLeague: (leagueCode: string) => void;
  selectedStatus: 'ALL' | 'LIVE' | 'FAVORITES' | 'SCHEDULED' | 'FINISHED';
  onSelectStatus: (status: 'ALL' | 'LIVE' | 'FAVORITES' | 'SCHEDULED' | 'FINISHED') => void;
  countsByLeague: Record<string, number>;
  totalMatchesCount: number;
  liveMatchesCount: number;
  onNavigateToMatches?: () => void;
  favoriteLeagues?: string[];
  onToggleFavoriteLeague?: (leagueId: string) => void;
}

// Region categories for easy filtering
interface LeagueCategory {
  id: string;
  label: string;
  icon: string;
}

const CATEGORIES: LeagueCategory[] = [
  { id: 'favorites', label: 'Favoritas', icon: '⭐' },
  { id: 'all', label: 'Todas las ligas', icon: '🌐' },
  { id: 'today', label: 'Con Partidos Hoy', icon: '⚡' },
  { id: 'top', label: 'Top Élite', icon: '🏆' },
  { id: 'europe', label: 'Europa', icon: '🇪🇺' },
  { id: 'america', label: 'América Latina', icon: '🌎' },
];

const TOP_LEAGUES = ['UCL', 'COL', 'LMX', 'EPL', 'ESP', 'ITA', 'GER', 'FRA', 'LIB', 'SUD'];
const EUROPE_LEAGUES = ['UCL', 'UEL', 'UECL', 'EPL', 'ESP', 'ITA', 'GER', 'FRA', 'POR', 'NED', 'TUR', 'BEL', 'ESP2', 'EFL'];
const AMERICA_LEAGUES = ['COL', 'LMX', 'LIB', 'SUD', 'BRA', 'ARG', 'MLS'];

export const CompetitionsModal: React.FC<CompetitionsModalProps> = ({
  isOpen,
  onClose,
  selectedLeague,
  onSelectLeague,
  selectedStatus,
  onSelectStatus,
  countsByLeague,
  totalMatchesCount,
  liveMatchesCount,
  onNavigateToMatches,
  favoriteLeagues = ['COL', 'UCL', 'EPL', 'ESP'],
  onToggleFavoriteLeague,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!isOpen) return null;

  // Filtered competitions list
  const filteredCompetitions = useMemo(() => {
    return COMPETITIONS_SIDEBAR.filter((comp) => {
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = comp.name.toLowerCase().includes(query);
        const matchId = comp.id.toLowerCase().includes(query);
        if (!matchName && !matchId) return false;
      }

      const matchCountToday = comp.id === 'ALL' ? totalMatchesCount : (countsByLeague[comp.id] || 0);

      // Category filter
      if (activeCategory === 'favorites' && comp.id !== 'ALL' && !favoriteLeagues.includes(comp.id)) {
        return false;
      }
      if (activeCategory === 'today' && comp.id !== 'ALL' && matchCountToday === 0) {
        return false;
      }
      if (activeCategory === 'top' && comp.id !== 'ALL' && !TOP_LEAGUES.includes(comp.id)) {
        return false;
      }
      if (activeCategory === 'europe' && comp.id !== 'ALL' && !EUROPE_LEAGUES.includes(comp.id)) {
        return false;
      }
      if (activeCategory === 'america' && comp.id !== 'ALL' && !AMERICA_LEAGUES.includes(comp.id)) {
        return false;
      }

      return true;
    });
  }, [searchQuery, activeCategory, countsByLeague, liveMatchesCount, totalMatchesCount, favoriteLeagues]);

  const handleSelect = (leagueId: string) => {
    onSelectLeague(leagueId);
    if (onNavigateToMatches) {
      onNavigateToMatches();
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#121824] border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#161f2e] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-slate-300" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2 truncate">
                <span>Competiciones & Ligas</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  {COMPETITIONS_SIDEBAR.length - 1} ligas
                </span>
              </h2>
              <p className="text-xs text-slate-400 truncate">
                Selecciona una competición o márcala como favorita
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700 shrink-0"
            title="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search & Category Tabs */}
        <div className="p-4 border-b border-slate-800 bg-[#141b27] space-y-3 shrink-0">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar liga, copa o país (ej: Champions, BetPlay, Premier, LaLiga...)"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 transition-all font-medium"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Region / Quick Filter Pills with Favoritas category */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 text-xs font-bold">
            {CATEGORIES.map((cat) => {
              const isFavCat = cat.id === 'favorites';
              const favCount = favoriteLeagues.length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-slate-700 text-white border border-slate-600 shadow-sm'
                      : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-750'
                  }`}
                >
                  <span className={isFavCat && favCount > 0 ? 'text-amber-400' : ''}>{cat.icon}</span>
                  <span>{cat.label}</span>
                  {isFavCat && (
                    <span className="text-[10px] font-mono bg-slate-850 px-1.5 py-0.2 rounded text-slate-300">
                      {favCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Clean Status Pill: Todos & En Vivo only */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-xs text-slate-400 font-semibold">
              Filtrar partidos:
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <button
                onClick={() => onSelectStatus('ALL')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedStatus === 'ALL'
                    ? 'bg-slate-700 text-white border border-slate-600 shadow-xs'
                    : 'bg-slate-850 text-slate-400 hover:text-white border border-slate-750'
                }`}
              >
                Todos ({totalMatchesCount})
              </button>
              <button
                onClick={() => onSelectStatus('LIVE')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedStatus === 'LIVE'
                    ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 shadow-xs'
                    : 'bg-slate-850 text-slate-400 hover:text-white border border-slate-750'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>En vivo ({liveMatchesCount})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Competitions Grid */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {/* Quick "All Competitions" banner button */}
          <div
            onClick={() => handleSelect('ALL')}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              selectedLeague === 'ALL'
                ? 'bg-slate-800 border-slate-500 text-white shadow-sm'
                : 'bg-slate-850 hover:bg-slate-800 border-slate-750 text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-base shrink-0">
                🌐
              </div>
              <div>
                <div className="font-extrabold text-sm text-white">Todas las Competiciones</div>
                <div className="text-xs text-slate-400">
                  Ver partidos de todas las ligas programadas
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                {totalMatchesCount} partidos
              </span>
              {selectedLeague === 'ALL' && (
                <div className="h-5 w-5 rounded-full bg-slate-600 text-white flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </div>
          </div>

          {/* Grid of Leagues with Favorite Star Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            {filteredCompetitions
              .filter((c) => c.id !== 'ALL')
              .map((comp) => {
                const count = countsByLeague[comp.id] || 0;
                const isSelected = selectedLeague === comp.id;
                const isFav = favoriteLeagues.includes(comp.id);

                return (
                  <div
                    key={comp.id}
                    onClick={() => handleSelect(comp.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                      isSelected
                        ? 'bg-slate-800 border-slate-500 text-white shadow-sm'
                        : 'bg-slate-900/90 hover:bg-slate-850 border-slate-800 text-slate-200 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Favorite Star Toggle */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleFavoriteLeague) onToggleFavoriteLeague(comp.id);
                        }}
                        className="p-1 rounded-md text-slate-500 hover:text-amber-400 transition-colors shrink-0"
                        title={isFav ? 'Quitar de favoritas' : 'Añadir a favoritas'}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            isFav ? 'fill-amber-400 text-amber-400' : 'text-slate-500'
                          }`}
                        />
                      </button>

                      <CountryFlag
                        country={comp.name}
                        leagueCode={comp.id}
                        icon={comp.icon}
                        className="w-5 h-3.5 shadow-2xs shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-xs sm:text-sm block truncate text-white">
                          {comp.name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono block">
                          Cód: {comp.id}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {count > 0 ? (
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 text-emerald-300 border border-slate-700">
                          {count} hoy
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-500 px-1.5 py-0.5">
                          Próx. fecha
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {filteredCompetitions.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400 rounded-xl bg-slate-900 border border-slate-800">
              {activeCategory === 'favorites'
                ? 'No tienes ligas marcadas como favoritas aún. Haz clic en la estrella ⭐ de cualquier liga para agregarla.'
                : `No se encontraron ligas con el término "${searchQuery}".`}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-[#161f2e] flex items-center justify-between text-xs text-slate-400">
          <span>Selecciona una competición para ver su cartelera</span>
          <button
            onClick={() => {
              onSelectLeague('ALL');
              if (onNavigateToMatches) onNavigateToMatches();
              onClose();
            }}
            className="text-slate-300 hover:text-white font-bold transition-colors cursor-pointer"
          >
            Ver todas las ligas
          </button>
        </div>
      </div>
    </div>
  );
};
