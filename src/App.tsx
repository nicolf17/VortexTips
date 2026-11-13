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
import { RadarAnalysisModal } from './components/RadarAnalysisModal';
import { MobileNav } from './components/MobileNav';
import { SearchModule } from './components/SearchModule';
import { DisciplineModule } from './components/DisciplineModule';
import { PropsRadarModule } from './components/PropsRadarModule';
import { Footer } from './components/Footer';
import { getTodayTabInfo, getDynamicDaysCarousel, getColombiaCurrentTimeStr } from './utils/dateUtils';
import { getLeagueMeta } from './utils/leagueUtils';
import { matchesTeamSearchQuery } from './utils/localization';
import { CountryFlag } from './components/CountryFlag';
import {
  Trophy,
  ChevronDown,
  RefreshCw,
  Search,
  X,
  Calendar,
  Flame,
  Star,
} from 'lucide-react';

export default function App() {
  const todayInfo = useMemo(() => getTodayTabInfo(), []);
  const carouselDays = useMemo(() => getDynamicDaysCarousel(), []);

  const [activeModule, setActiveModule] = useState<string>('partidos');
  const [selectedDate, setSelectedDate] = useState<string>(todayInfo.label);
  const [selectedLeague, setSelectedLeague] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'LIVE' | 'FAVORITES'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Real match state
  const [matches, setMatches] = useState<Match[]>(VORTEX_MATCHES);
  const [isLoadingMatches, setIsLoadingMatches] = useState<boolean>(false);
  const [lastApiSync, setLastApiSync] = useState<string>(getColombiaCurrentTimeStr());

  // Favorite match IDs (Match-level favorites)
  const [favoriteMatchIds, setFavoriteMatchIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('vortextips_fav_matches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleToggleFavoriteMatch = (matchId: string) => {
    setFavoriteMatchIds((prev) => {
      const updated = prev.includes(matchId)
        ? prev.filter((id) => id !== matchId)
        : [...prev, matchId];
      try {
        localStorage.setItem('vortextips_fav_matches', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Modals state
  const [selectedMatchForModal, setSelectedMatchForModal] = useState<Match | null>(null);
  const [selectedMatchForRadarModal, setSelectedMatchForRadarModal] = useState<Match | null>(null);
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
      if (liveData && Array.isArray(liveData)) {
        setMatches(liveData);
      } else {
        setMatches([]);
      }
      setLastApiSync(getColombiaCurrentTimeStr());
    } catch (e) {
      console.error('Error fetching real matches:', e);
      setMatches([]);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  // Load matches whenever the selected date changes (static, no disruptive auto-refresh loops)
  useEffect(() => {
    loadMatches(selectedDate);
  }, [selectedDate]);

  // Silent background revalidation when user returns to tab / window focus ("cuando uno salga y vuelva ya esten las cosas al tanto")
  useEffect(() => {
    const handleSyncOnReturn = () => {
      if (document.visibilityState === 'visible') {
        const matchedDay = carouselDays.find((d) => d.label === selectedDate) || todayInfo;
        fetchLiveFootballMatches(matchedDay.dateKey)
          .then((fresh) => {
            if (fresh && Array.isArray(fresh)) {
              setMatches(fresh);
              setLastApiSync(getColombiaCurrentTimeStr());
            }
          })
          .catch((e) => console.log('Silent sync in background:', e));
      }
    };

    document.addEventListener('visibilitychange', handleSyncOnReturn);
    window.addEventListener('focus', handleSyncOnReturn);
    return () => {
      document.removeEventListener('visibilitychange', handleSyncOnReturn);
      window.removeEventListener('focus', handleSyncOnReturn);
    };
  }, [selectedDate, carouselDays, todayInfo]);

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
    const favorites = matches.filter((m) => favoriteMatchIds.includes(m.id)).length;
    return {
      all: pool.length,
      live,
      scheduled,
      finished,
      favorites,
    };
  }, [matches, currentSelectedDayObj, selectedDate, favoriteMatchIds]);

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
      { code: 'ALL', name: 'Todas', icon: '🌐', country: '' },
      { code: 'COL', name: 'Liga BetPlay', icon: '🇨🇴', country: 'Colombia' },
      { code: 'EPL', name: 'Premier League', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'Inglaterra' },
      { code: 'ESP', name: 'LaLiga', icon: '🇪🇸', country: 'España' },
      { code: 'UCL', name: 'Champions League', icon: '⭐', country: 'Europa' },
      { code: 'ITA', name: 'Serie A', icon: '🇮🇹', country: 'Italia' },
      { code: 'GER', name: 'Bundesliga', icon: '🇩🇪', country: 'Alemania' },
      { code: 'FRA', name: 'Ligue 1', icon: '🇫🇷', country: 'Francia' },
      { code: 'LIB', name: 'Libertadores', icon: '🏆', country: 'Sudamérica' },
      { code: 'LMX', name: 'Liga MX', icon: '🇲🇽', country: 'México' },
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
      // 1. Status filter: FAVORITES shows all favorited matches
      if (selectedStatus === 'FAVORITES') {
        if (!favoriteMatchIds.includes(m.id)) {
          return false;
        }
      } else {
        // Date filter for regular tabs
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

        // Live filter
        if (selectedStatus === 'LIVE' && m.status !== 'LIVE') {
          return false;
        }
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

      // 4. Search Query filter (matches both original ESPN names and Spanish localized names)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const meta = getLeagueMeta(m.league, m.leagueCode);
        const league = m.league?.toLowerCase() || '';
        const leagueLoc = meta.name?.toLowerCase() || '';
        const referee = m.refereeInfo?.name?.toLowerCase() || '';
        const homeMatch = matchesTeamSearchQuery(m.homeTeam?.name, searchQuery, m.homeTeam?.shortName);
        const awayMatch = matchesTeamSearchQuery(m.awayTeam?.name, searchQuery, m.awayTeam?.shortName);
        if (
          !homeMatch &&
          !awayMatch &&
          !league.includes(q) &&
          !leagueLoc.includes(q) &&
          !referee.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [matches, selectedDate, currentSelectedDayObj, selectedStatus, selectedLeague, searchQuery, carouselDays]);

  return (
    <div className="min-h-screen bg-[#080D18] text-slate-100 flex flex-col pb-16 lg:pb-0 w-full max-w-full overflow-x-hidden selection:bg-sky-500/30 selection:text-sky-200">
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
            <div className="bg-[#111D30] rounded-2xl border border-slate-750 p-2 sm:p-2.5 shadow-sm">
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
                {carouselDays.map((d) => {
                  const isActive = selectedDate === d.label;
                  return (
                    <button
                      key={d.dateKey}
                      onClick={() => setSelectedDate(d.label)}
                      className={`flex-1 min-w-[85px] sm:min-w-[110px] py-2 px-2.5 rounded-xl text-center transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#0f2442] text-sky-100 font-bold shadow-sm border border-sky-500/50'
                          : 'bg-[#19283E] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-750'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider block">
                          {d.dayName}
                        </span>
                        {d.isToday && (
                          <span className={`text-[9px] px-1 rounded font-black ${isActive ? 'bg-[#0c1d36] text-sky-300' : 'bg-slate-800/80 text-slate-300 border border-slate-700'}`}>
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

            {/* DayRadarBanner: Strictly showing hottest real markets for the selected day */}
            <DayRadarBanner
              selectedDate={selectedDate}
              onOpenRadarAnalysis={(m) => setSelectedMatchForRadarModal(m)}
              matches={matches}
            />

            {/* Interactive Filters & Controls Bar */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-[#111D30] border border-slate-750 shadow-sm space-y-3">
              {/* Row 1: Competition Dropdown Trigger + Status Filters */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Competition Dropdown Trigger */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setIsCompetitionsModalOpen(true)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#19283E] hover:bg-slate-800 text-white font-bold text-xs sm:text-sm border border-slate-700 hover:border-slate-600 transition-all cursor-pointer group active:scale-95 shadow-sm"
                    title="Abrir menú y buscador de competiciones"
                  >
                    <Trophy className="w-4 h-4 text-slate-300 shrink-0" />
                    <span>Competiciones & Ligas</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#19283E] text-slate-200 font-mono text-xs border border-slate-700">
                      {selectedLeagueObj?.icon} {selectedLeagueObj?.name || 'Todas'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:translate-y-0.5 transition-transform shrink-0" />
                  </button>

                  {/* Active filter badge if league is filtered */}
                  {selectedLeague !== 'ALL' && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f2442] border border-sky-500/50 text-xs font-bold text-sky-200 shadow-sm">
                      <span>{selectedLeagueObj?.icon}</span>
                      <span>{selectedLeagueObj?.name}</span>
                      <button
                        onClick={() => setSelectedLeague('ALL')}
                        className="p-0.5 rounded hover:bg-sky-900/60 text-sky-300 hover:text-white ml-1 cursor-pointer"
                        title="Quitar filtro de liga"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Status Quick Pills: Todos, En Vivo, and ⭐ Favoritos */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-bold">
                  <button
                    onClick={() => setSelectedStatus('ALL')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                      selectedStatus === 'ALL'
                        ? 'bg-[#0f2442] text-sky-100 border border-sky-500/50 shadow-sm'
                        : 'bg-[#19283E] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-750'
                    }`}
                  >
                    Todos ({counts.all})
                  </button>

                  <button
                    onClick={() => setSelectedStatus('LIVE')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                      selectedStatus === 'LIVE'
                        ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 shadow-sm'
                        : 'bg-[#19283E] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-750'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>En Vivo ({counts.live})</span>
                  </button>

                  <button
                    onClick={() => setSelectedStatus('FAVORITES')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                      selectedStatus === 'FAVORITES'
                        ? 'bg-[#0f2442] text-sky-100 border border-sky-500/50 shadow-sm'
                        : 'bg-[#19283E] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-750'
                    }`}
                    title="Ver todos los partidos guardados en favoritos"
                  >
                    <Star className={`w-3.5 h-3.5 ${selectedStatus === 'FAVORITES' || favoriteMatchIds.length > 0 ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                    <span>Favoritos ({favoriteMatchIds.length})</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Active Competitions & Leagues for Selected Day (with clear country flags) */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-750 overflow-x-auto no-scrollbar py-0.5">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <span className="text-[11px] font-semibold text-slate-400 shrink-0 hidden sm:inline mr-1">
                    Competiciones del día:
                  </span>
                  {quickLeagueShortcuts
                    .filter((ql) => ql.code === 'ALL' || (countsByLeague[ql.code] && countsByLeague[ql.code] > 0))
                    .map((ql) => {
                      const active = selectedLeague === ql.code;
                      const matchCount = ql.code === 'ALL' ? counts.all : (countsByLeague[ql.code] || 0);

                      return (
                        <button
                          key={ql.code}
                          onClick={() => handleSelectLeagueAction(ql.code)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                            active
                              ? 'bg-[#0f2442] text-sky-100 border border-sky-500/50 shadow-sm'
                              : 'bg-[#19283E] text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-750'
                          }`}
                          title={`Filtrar por ${ql.name}`}
                        >
                          {ql.code !== 'ALL' && ql.country ? (
                            <CountryFlag country={ql.country} leagueCode={ql.code} icon={ql.icon} className="w-4 h-2.5 shadow-2xs shrink-0" />
                          ) : (
                            <span>{ql.icon}</span>
                          )}
                          <span>{ql.name}</span>
                          {matchCount > 0 && (
                            <span className={`text-[10px] font-mono px-1 rounded ${active ? 'bg-[#0c1d36] text-sky-200' : 'bg-slate-800 text-slate-400'}`}>
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#19283E] hover:bg-slate-800 text-slate-300 hover:text-white font-bold transition-all cursor-pointer text-xs border border-slate-750 shrink-0"
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
                  {selectedStatus === 'FAVORITES' ? (
                    <>
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>Partidos Favoritos ({filteredMatches.length})</span>
                    </>
                  ) : (
                    <>
                      <span>{selectedLeagueObj?.icon}</span>
                      <span>
                        {selectedLeague === 'ALL'
                          ? `Cartelera de Partidos (${filteredMatches.length} partidos)`
                          : `${selectedLeagueObj?.name} (${filteredMatches.length} partidos)`}
                      </span>
                    </>
                  )}
                </h3>
                <span className="text-xs text-slate-300 font-mono font-bold bg-[#111D30] px-2.5 py-1 rounded-md border border-slate-750">
                  {selectedStatus === 'FAVORITES' ? '⭐ Mis Favoritos' : `${currentSelectedDayObj.dayName} • ${selectedDate}`}
                </span>
              </div>

              {isLoadingMatches ? (
                <div className="p-12 text-center rounded-2xl bg-[#111D30] border border-slate-750 text-xs sm:text-sm text-slate-300 flex flex-col items-center justify-center gap-2 font-bold">
                  <RefreshCw className="w-6 h-6 animate-spin text-sky-400" />
                  <span>Sincronizando partidos oficiales (Hora Colombia)...</span>
                </div>
              ) : filteredMatches.length === 0 ? (
                <div className="p-8 sm:p-10 rounded-2xl bg-[#111D30] border border-slate-750 text-center text-xs sm:text-sm text-slate-300 space-y-3">
                  <p className="font-medium text-slate-300 max-w-lg mx-auto">
                    {selectedStatus === 'FAVORITES' ? (
                      <>
                        No tienes partidos marcados como <strong className="text-sky-300">Favoritos</strong> todavía.
                        <br className="hidden sm:inline" /> Haz clic en la estrella <span className="text-amber-400 font-bold">⭐</span> de cualquier partido en la cartelera para agregarlo aquí.
                      </>
                    ) : (
                      'No hay partidos disponibles para esta fecha'
                    )}
                  </p>
                  <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
                    <button
                      onClick={() => {
                        setSelectedLeague('ALL');
                        setSelectedStatus('ALL');
                        setSearchQuery('');
                      }}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all cursor-pointer shadow-sm"
                    >
                      Ver todos los partidos ({matches.length})
                    </button>
                  </div>
                </div>
              ) : (
                <CompactLeagueMatchList
                  matches={filteredMatches}
                  onOpenAnalysis={(m) => setSelectedMatchForModal(m)}
                  onSelectLeague={(code) => handleSelectLeagueAction(code)}
                  favoriteMatchIds={favoriteMatchIds}
                  onToggleFavorite={handleToggleFavoriteMatch}
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
        onSelectStatus={(status) => {
          if (status === 'ALL' || status === 'LIVE' || status === 'FAVORITES') {
            setSelectedStatus(status);
          } else {
            setSelectedStatus('ALL');
          }
        }}
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

      {/* Radar Statistical Analysis Modal */}
      <RadarAnalysisModal
        match={selectedMatchForRadarModal}
        isOpen={Boolean(selectedMatchForRadarModal)}
        onClose={() => setSelectedMatchForRadarModal(null)}
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
