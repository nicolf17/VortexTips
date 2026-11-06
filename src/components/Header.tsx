import React from 'react';
import { Search, Flame, RefreshCw, Activity } from 'lucide-react';
import { getTodayTabInfo, getColombiaCurrentTimeStr } from '../utils/dateUtils';

interface HeaderProps {
  onResetToHome: () => void;
  onOpenSearch: () => void;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onResetToHome,
  onOpenSearch,
  onRefreshData,
  isRefreshing = false,
}) => {
  const todayInfo = getTodayTabInfo();
  const [cotTime, setCotTime] = React.useState<string>(getColombiaCurrentTimeStr());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCotTime(getColombiaCurrentTimeStr());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#121826]/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo - Clicking returns to Home */}
        <button
          onClick={onResetToHome}
          className="flex items-center gap-3 group text-left transition-transform active:scale-98 focus:outline-none cursor-pointer"
          title="Volver al menú principal"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-indigo-300 to-white bg-clip-text text-transparent">
                VORTEXTIPS
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-violet-950/80 text-violet-300 border border-violet-800/60 px-2 py-0.5 rounded-md">
                <Flame className="w-3 h-3 text-violet-400" />
                RADAR PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Inteligencia Deportiva & Comparador de Cuotas Reales
            </p>
          </div>
        </button>

        {/* Right side: Clean, dynamic Colombia time & quick search */}
        <div className="flex items-center gap-3">
          {/* Dynamic Colombia Date & Time Badge */}
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-300 bg-[#172032] border border-slate-750 px-3 py-1.5 rounded-lg">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>🇨🇴 {todayInfo.fullDate}</span>
            <span className="text-slate-600">|</span>
            <span className="font-mono text-white font-semibold">{cotTime}</span>
          </div>

          {/* Refresh Action */}
          {onRefreshData && (
            <button
              onClick={onRefreshData}
              disabled={isRefreshing}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700 cursor-pointer"
              title="Sincronizar cuotas y estadísticas en vivo"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-violet-400' : ''}`} />
            </button>
          )}

          {/* Clean Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2.5 px-3.5 py-1.5 text-xs font-medium text-slate-300 bg-[#172032] hover:bg-slate-800 hover:text-white border border-slate-750 hover:border-violet-500/50 rounded-lg transition-all shadow-xs cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Buscar jugador, árbitro o club...</span>
            <span className="sm:hidden">Buscar</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-slate-850 border border-slate-700 rounded text-slate-400 font-mono">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
};
