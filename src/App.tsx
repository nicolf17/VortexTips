import React, { useState, useMemo, useEffect } from 'react';
import { Match } from './types/football';
import { VORTEX_MATCHES, COMPETITIONS_SIDEBAR } from './data/mockMatches';
import { fetchLiveFootballMatches } from './services/api';
import { Header } from './components/Header';
import { DayRadarBanner } from './components/DayRadarBanner';
import { CompactLeagueMatchList } from './components/CompactLeagueMatchList';
import { CleanMatchCard } from './components/CleanMatchCard';
import { CompetitionsModal } from './components/CompetitionsModal';
import { FlashscoreDetailModal } from './components/FlashscoreDetailModal';
import { MobileNav } from './components/MobileNav';
import { SearchModule } from './components/SearchModule';
import { DisciplineModule } from './components/DisciplineModule';
import { PropsRadarModule } from './components/PropsRadarModule';
import { Footer } from './components/Footer';
import { getTodayTabInfo, getDynamicDaysCarousel, getColombiaCurrentTimeStr } from './utils/dateUtils';
import { getLeagueMeta } from './utils/leagueUtils';
import {
  Trophy,
  ChevronDown,
  RefreshCw,
  Search,
  X,
  Calendar,
  Flame,
} from 'lucide-react';

export default function App() {
  const todayInfo = getTodayTabInfo();
  const carouselDays = getDynamicDaysCarousel();

  const [activeModule, setActiveModule] = useState<string>('partidos');
  const [selectedDate, setSelectedDate] = useState<string>(todayInfo.label);
  const [selectedLeague, setSelectedLeague] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'LIVE' | 'SCHEDULED' | 'FINISHED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Real match state
  const [matches, setMatches] = useState<Match[]>(VORTEX_MATCHES);
  const [isLoadingMatches, setIsLoadingMatches] = useState<boolean>(false);
  const [lastApiSync, setLastApiSync] = useState<string>(getColombiaCurrentTimeStr());

  // Modals state
  const [selectedMatchForModal, setSelectedMatchForModal] = useState<Match | null>(null);
  const [isCompetitionsModalOpen, setIsCompetitionsModalOpen] = useState<boolean>(false);
  const [favoriteLeagues, setFavoriteLeagues] = useState<string[]>(['COL', 'UCL', 'EPL', 'ESP']);

  const handleToggleFavoriteLeague = (leagueId: string) => {
    setFavoriteLeagues((prev) =>
      prev.includes(leagueId) ? prev.filter((id) => id !== leagueId) : [...prev, leagueId]
    );
  };

  // Load matches anchored to current day
  const loadMatches = async (dateLabel: string) => {
    setIsLoadingMatches(true);
    try {
      const matchedDay = carouselDays.find((d) => d.label === dateLabel) || todayInfo;
      const apiDate = matchedDay.dateKey;
      const liveData = await fetchLiveFootballMatches(apiDate);
      if (liveData && liveData.length > 0) {
        setMatches(liveData);
      } else {
        setMatches(VORTEX_MATCHES);
      }
      setLastApiSync(getColombiaCurrentTimeStr());
    } catch (e) {
      console.error('Error fetching real matches:', e);
      setMatches(VORTEX_MATCHES);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  // Load matches whenever the selected date changes (static, no disruptive auto-refresh loops)
  useEffect(() => {
    loadMatches(selectedDate);
  }, [selectedDate]);

  // Current day metadata object
  const currentSelectedDayObj = useMemo(() => {
    return carouselDays.find((d) => d.label === selectedDate) || todayInfo;
  }, [selectedDate, carouselDays, todayInfo]);

  // Dynamic status counts for matches of the selected day
  const counts = useMemo(() => {
    const dayPool = matches.filter((m) => {
      if (m.dateKey && currentSelectedDayObj.dateKey) {
        return m.dateKey === currentSelectedDayObj.dateKey;
      }
      return m.dateFormatted.includes(selectedDate);
    });
    const pool = dayPool.length > 0 ? dayPool : matches;

    const live = pool.filter((m) => m.status === 'LIVE').length;
    const scheduled = pool.filter((m) => m.status === 'SCHEDULED').length;
    const finished = pool.filter((m) => m.status === 'FINISHED').length;
    return {
      all: pool.length,
      live,
      scheduled,
      finished,
    };
  }, [matches, currentSelectedDayObj, selectedDate]);

  // Dynamic counts per competition league for selected day
  const countsByLeague = useMemo(() => {
    const acc: Record<string, number> = {};
    const dayPool = matches.filter((m) => {
      if (m.dateKey && currentSelectedDayObj.dateKey) {
        return m.dateKey === currentSelectedDayObj.dateKey;
      }
      return m.dateFormatted.includes(selectedDate);
    });
    const pool = dayPool.length > 0 ? dayPool : matches;

    pool.forEach((m) => {
      const code = m.leagueCode;
      acc[code] = (acc[code] || 0) + 1;
    });
    return acc;
  }, [matches, currentSelectedDayObj, selectedDate]);

  // Selected competition metadata with flag
  const selectedLeagueObj = useMemo(() => {
    if (selectedLeague === 'ALL') {
      return { id: 'ALL', name: 'Todas las ligas', icon: '🌐' };
    }
    if (selectedLeague === 'FAVORITES') {
      return { id: 'FAVORITES', name: 'Mis Ligas Favoritas', icon: '⭐' };
    }
    const found = COMPETITIONS_SIDEBAR.find((c) => c.id === selectedLeague);
    if (found) return found;
    const meta = getLeagueMeta(selectedLeague, selectedLeague);
    return { id: meta.code, name: meta.name, icon: meta.icon };
  }, [selectedLeague]);

  // Quick league shortcuts with official country flags and tournament symbols
  const quickLeagueShortcuts = useMemo(() => {
    return [
      { code: 'ALL', name: 'Todas', icon: '🌐' },
      { code: 'FAVORITES', name: 'Favoritas', icon: '⭐' },
      { code: 'UCL', name: 'Champions League', icon: '⭐' },
      { code: 'COL', name: 'Liga BetPlay', icon: '🇨🇴' },
      { code: 'EPL', name: 'Premier League', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
      { code: 'ESP', name: 'LaLiga', icon: '🇪🇸' },
      { code: 'ITA', name: 'Serie A', icon: '🇮🇹' },
      { code: 'GER', name: 'Bundesliga', icon: '🇩🇪' },
      { code: 'FRA', name: 'Ligue 1', icon: '🇫🇷' },
      { code: 'LIB', name: 'Libertadores', icon: '🏆' },
      { code: 'LMX', name: 'Liga MX', icon: '🇲🇽' },
    ];
  }, []);

  // Select league reliably from any component
  const handleSelectLeagueAction = (leagueCode: string) => {
    setSelectedLeague(leagueCode);
    setActiveModule('partidos');
  };

  // Return to main menu from VortexTips logo
  const handleResetToHome = () => {
    setActiveModule('partidos');
    setSelectedLeague('ALL');
    setSelectedStatus('ALL');
    setSearchQuery('');
    setSelectedDate(todayInfo.label);
    setIsCompetitionsModalOpen(false);
    setSelectedMatchForModal(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter matches based on selected Date, League, Status, and Search Query
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      // 1. Date filter
      if (selectedDate && currentSelectedDayObj) {
        const matchesDateKey = m.dateKey && currentSelectedDayObj.dateKey && m.dateKey === currentSelectedDayObj.dateKey;
        const matchesDateFormatted = m.dateFormatted && m.dateFormatted.includes(selectedDate);
        if (!matchesDateKey && !matchesDateFormatted) {
          // If match belongs to another specific carousel date, filter it out
          const isBelongingToOtherCarouselDay = carouselDays.some(
            (cd) => cd.label !== selectedDate && (m.dateKey === cd.dateKey || m.dateFormatted.includes(cd.label))
          );
          if (isBelongingToOtherCarouselDay) {
            return false;
          }
        }
      }

      // 2. Status filter
      if (selectedStatus !== 'ALL' && m.status !== selectedStatus) {
        return false;
      }

      // 3. League filter
      if (selectedLeague === 'FAVORITES') {
        const meta = getLeagueMeta(m.league, m.leagueCode);
        if (!favoriteLeagues.includes(m.leagueCode) && !favoriteLeagues.includes(meta.code)) {
          return false;
        }
      } else if (selectedLeague !== 'ALL') {
        const meta = getLeagueMeta(m.league, m.leagueCode);
        if (m.leagueCode !== selectedLeague && meta.code !== selectedLeague) {
          return false;
        }
      }

      // 4. Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const home = m.homeTeam?.name?.toLowerCase() || '';
        const away = m.awayTeam?.name?.toLowerCase() || '';
        const homeShort = m.homeTeam?.shortName?.toLowerCase() || '';
        const awayShort = m.awayTeam?.shortName?.toLowerCase() || '';
        const league = m.league?.toLowerCase() || '';
        const referee = m.refereeInfo?.name?.toLowerCase() || '';
        if (
          !home.includes(q) &&
          !away.includes(q) &&
          !homeShort.includes(q) &&
          !awayShort.includes(q) &&
          !league.includes(q) &&
          !referee.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [matches, selectedDate, currentSelectedDayObj, selectedStatus, selectedLeague, searchQuery, carouselDays]);

  return (
    <div className="min-h-screen bg-[#121826] text-slate-100 flex flex-col pb-16 lg:pb-0 w-full max-w-full overflow-x-hidden selection:bg-violet-600/30 selection:text-violet-200">
      {/* Top Header: VortexTips, Live COT clock & Quick Search */}
      <Header
        onOpenSearch={() => setActiveModule('buscador')}
        onRefreshData={() => loadMatches(selectedDate)}
        isRefreshing={isLoadingMatches}
        onResetToHome={handleResetToHome}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-5 min-w-0 overflow-hidden">
        {/* MODULE 1: CARTELERA DE PARTIDOS */}
        {activeModule === 'partidos' && (
          <div className="w-full min-w-0 space-y-4 overflow-hidden">
            {/* Dynamic 7-Day Date Carousel */}
            <div className="bg-[#172133] rounded-2xl border border-slate-750 p-2 sm:p-2.5 shadow-sm">
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
                {carouselDays.map((d) => {
                  const isActive = selectedDate === d.label;
                  return (
                    <button
                      key={d.dateKey}
                      onClick={() => setSelectedDate(d.label)}
                      className={`flex-1 min-w-[85px] sm:min-w-[110px] py-2 px-2.5 rounded-xl text-center transition-all cursor-pointer ${
                        isActive
                          ? 'bg-slate-700 text-white font-bold shadow-sm border border-slate-600'
                          : 'bg-[#131b2a] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-750'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider block">
                          {d.dayName}
                        </span>
                        {d.isToday && (
                          <span className={`text-[9px] px-1 rounded font-black ${isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-800/80 text-slate-300 border border-slate-700'}`}>
                            HOY
                          </span>
                        )}
                      </div>
                      <div className={`text-xs sm:text-sm font-extrabold mt-0.5 font-mono ${isActive ? 'text-white' : 'text-slate-100'}`}>
                        {d.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Day Radar Banner: Strictly showing hottest real markets for the selected day */}
            <DayRadarBanner
              selectedDate={selectedDate}
              onSelectMatchById={(id) => {
                const m = matches.find((match) => match.id === id);
                if (m) setSelectedMatchForModal(m);
              }}
              matches={matches}
            />

            {/* Interactive Filters & Controls Bar */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-[#172133] border border-slate-750 shadow-sm space-y-3">
              {/* Row 1: Competition Dropdown Trigger + Status Filters */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Competition Dropdown Trigger */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setIsCompetitionsModalOpen(true)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#131b2a] hover:bg-slate-800 text-white font-bold text-xs sm:text-sm border border-slate-700 hover:border-slate-600 transition-all cursor-pointer group active:scale-95 shadow-sm"
                    title="Abrir menú y buscador de competiciones"
                  >
                    <Trophy className="w-4 h-4 text-slate-300 shrink-0" />
                    <span>Competiciones & Ligas</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#1a2436] text-slate-200 font-mono text-xs border border-slate-700">
                      {selectedLeagueObj?.icon} {selectedLeagueObj?.name || 'Todas'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:translate-y-0.5 transition-transform shrink-0" />
                  </button>

                  {/* Active filter badge if league is filtered */}
                  {selectedLeague !== 'ALL' && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#131b2a] border border-slate-700 text-xs font-bold text-slate-200 shadow-sm">
                      <span>{selectedLeagueObj?.icon}</span>
                      <span>{selectedLeagueObj?.name}</span>
                      <button
                        onClick={() => setSelectedLeague('ALL')}
                        className="p-0.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white ml-1 cursor-pointer"
                        title="Quitar filtro de liga"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Status Quick Pills: Clean Todos & En Vivo only */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-bold">
                  <button
                    onClick={() => setSelectedStatus('ALL')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                      selectedStatus === 'ALL'
                        ? 'bg-slate-700 text-white border border-slate-600 shadow-sm'
                        : 'bg-[#131b2a] text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-750'
                    }`}
                  >
                    Todos ({counts.all})
                  </button>

                  <button
                    onClick={() => setSelectedStatus('LIVE')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                      selectedStatus === 'LIVE'
                        ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 shadow-sm'
                        : 'bg-[#131b2a] text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-750'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>En Vivo ({counts.live})</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Active Competitions & Leagues for Selected Day (with Favoritas shortcut) */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-750 overflow-x-auto no-scrollbar py-0.5">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <span className="text-[11px] font-semibold text-slate-400 shrink-0 hidden sm:inline mr-1">
                    Competiciones del día:
                  </span>
                  {quickLeagueShortcuts
                    .filter((ql) => ql.code === 'ALL' || ql.code === 'FAVORITES' || (countsByLeague[ql.code] && countsByLeague[ql.code] > 0))
                    .map((ql) => {
                      const active = selectedLeague === ql.code;
                      const matchCount = ql.code === 'ALL' ? counts.all : ql.code === 'FAVORITES' ? favoriteLeagues.length : (countsByLeague[ql.code] || 0);

                      return (
                        <button
                          key={ql.code}
                          onClick={() => handleSelectLeagueAction(ql.code)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                            active
                              ? 'bg-slate-700 text-white border border-slate-600 shadow-sm'
                              : 'bg-[#131b2a] text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-750'
                          }`}
                          title={`Filtrar por ${ql.name}`}
                        >
                          <span>{ql.icon}</span>
                          <span>{ql.name}</span>
                          {matchCount > 0 && (
                            <span className={`text-[10px] font-mono px-1 rounded ${active ? 'bg-slate-800 text-white' : 'bg-slate-800 text-slate-400'}`}>
                              {matchCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>

                {/* Minimalist Manual Refresh Button (internal sync without visible badge texts) */}
                <button
                  onClick={() => loadMatches(selectedDate)}
                  disabled={isLoadingMatches}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#131b2a] hover:bg-slate-800 text-slate-300 hover:text-white font-bold transition-all cursor-pointer text-xs border border-slate-750 shrink-0"
                  title="Actualizar partidos del día"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMatches ? 'animate-spin text-slate-300' : 'text-slate-400'}`} />
                  <span>Actualizar</span>
                </button>
              </div>
            </div>

            {/* Clean Matches of the Day List: Compact Flashscore Layout Grouped by League */}
            <div className="space-y-3 w-full min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-2">
                  <span>{selectedLeagueObj?.icon}</span>
                  <span>
                    {selectedLeague === 'ALL'
                      ? `Cartelera de Partidos (${filteredMatches.length} partidos)`
                      : `${selectedLeagueObj?.name} (${filteredMatches.length} partidos)`}
                  </span>
                </h3>
                <span className="text-xs text-slate-300 font-mono font-bold bg-[#172133] px-2.5 py-1 rounded-md border border-slate-750">
                  {currentSelectedDayObj.dayName} • {selectedDate}
                </span>
              </div>

              {isLoadingMatches ? (
                <div className="p-12 text-center rounded-2xl bg-[#172133] border border-slate-750 text-xs sm:text-sm text-slate-300 flex flex-col items-center justify-center gap-2 font-bold">
                  <RefreshCw className="w-6 h-6 animate-spin text-violet-400" />
                  <span>Sincronizando partidos oficiales (Hora Colombia)...</span>
                </div>
              ) : filteredMatches.length === 0 ? (
                <div className="p-8 sm:p-10 rounded-2xl bg-[#172133] border border-slate-750 text-center text-xs sm:text-sm text-slate-300 space-y-3">
                  <p className="font-medium text-slate-300 max-w-lg mx-auto">
                    {selectedLeague !== 'ALL' ? (
                      <>
                        No hay partidos programados de <strong className="text-white">{selectedLeagueObj?.name}</strong> para la fecha seleccionada ({selectedDate}).
                      </>
                    ) : (
                      `No se encontraron partidos para la fecha ${selectedDate} con los filtros aplicados.`
                    )}
                  </p>
                  <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
                    <button
                      onClick={() => {
                        setSelectedLeague('ALL');
                        setSelectedStatus('ALL');
                        setSearchQuery('');
                      }}
                      className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-all cursor-pointer shadow-sm"
                    >
                      Ver todos los partidos ({matches.length})
                    </button>
                    <button
                      onClick={() => setIsCompetitionsModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-[#131b2a] hover:bg-slate-800 text-slate-200 font-bold text-xs transition-all cursor-pointer border border-slate-750"
                    >
                      Elegir otra liga
                    </button>
                  </div>
                </div>
              ) : (
                <CompactLeagueMatchList
                  matches={filteredMatches}
                  onOpenAnalysis={(m) => setSelectedMatchForModal(m)}
                  onSelectLeague={(code) => handleSelectLeagueAction(code)}
                />
              )}
            </div>
          </div>
        )}

        {/* MODULE 2: BUSCADOR INTEGRAL */}
        {activeModule === 'buscador' && (
          <SearchModule
            matches={matches}
            onSelectMatch={(m) => setSelectedMatchForModal(m)}
          />
        )}

        {/* MODULE 3: DISCIPLINA ARBITRAL */}
        {activeModule === 'disciplina' && (
          <DisciplineModule
            matches={matches}
            onSelectMatch={(id) => {
              const m = matches.find((match) => match.id === id);
              if (m) setSelectedMatchForModal(m);
            }}
          />
        )}

        {/* MODULE 4: RADAR DE PROPS */}
        {activeModule === 'props' && <PropsRadarModule />}
      </main>

      {/* Global Desktop & Tablet Footer with Functional Search & Ligas */}
      <Footer
        onSelectLeague={handleSelectLeagueAction}
        onOpenSearch={() => setActiveModule('buscador')}
        onOpenReferees={() => setActiveModule('disciplina')}
        onOpenToday={() => {
          setSelectedDate(todayInfo.label);
          setActiveModule('partidos');
        }}
        onResetToHome={handleResetToHome}
      />

      {/* POPUP / MODAL WINDOW FOR COMPETITIONS & MATCHES */}
      <CompetitionsModal
        isOpen={isCompetitionsModalOpen}
        onClose={() => setIsCompetitionsModalOpen(false)}
        selectedLeague={selectedLeague}
        onSelectLeague={handleSelectLeagueAction}
        selectedStatus={selectedStatus}
        onSelectStatus={(status) => setSelectedStatus(status)}
        countsByLeague={countsByLeague}
        totalMatchesCount={matches.length}
        liveMatchesCount={counts.live}
        onNavigateToMatches={() => setActiveModule('partidos')}
        favoriteLeagues={favoriteLeagues}
        onToggleFavoriteLeague={handleToggleFavoriteLeague}
      />

      {/* Flashscore Complete Match Stats Modal */}
      <FlashscoreDetailModal
        match={selectedMatchForModal}
        isOpen={Boolean(selectedMatchForModal)}
        onClose={() => setSelectedMatchForModal(null)}
      />

      {/* Mobile Bottom Navigation (Strictly Analytical, No Bet Slips) */}
      <MobileNav
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        liveCount={counts.live}
        onOpenCompetitionsModal={() => setIsCompetitionsModalOpen(true)}
      />
    </div>
  );
}
