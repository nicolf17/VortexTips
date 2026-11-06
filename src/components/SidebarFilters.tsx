import React from 'react';
import { COMPETITIONS_SIDEBAR } from '../data/mockMatches';
import { Radio } from 'lucide-react';

interface SidebarFiltersProps {
  selectedStatus: 'ALL' | 'LIVE' | 'SCHEDULED' | 'FINISHED';
  setSelectedStatus: (status: 'ALL' | 'LIVE' | 'SCHEDULED' | 'FINISHED') => void;
  selectedLeague: string;
  setSelectedLeague: (league: string) => void;
  counts: {
    all: number;
    live: number;
    scheduled: number;
    finished: number;
  };
  countsByLeague?: Record<string, number>;
}

export const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  selectedStatus,
  setSelectedStatus,
  selectedLeague,
  setSelectedLeague,
  counts,
  countsByLeague = {},
}) => {
  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6 bg-[#130924]/80 p-4 rounded-2xl border border-[#2e1b4d]">
      {/* Estado del Partido */}
      <div>
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-2">
          Estado del Partido
        </h3>
        <div className="space-y-1">
          {/* Todos */}
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedStatus === 'ALL'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
                : 'text-slate-300 hover:bg-purple-950/40 hover:text-white'
            }`}
          >
            <span>Todos</span>
            <span className="font-mono text-slate-400 text-[11px]">{counts.all}</span>
          </button>

          {/* En directo */}
          <button
            onClick={() => setSelectedStatus('LIVE')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedStatus === 'LIVE'
                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-live-dot" />
              <span>En directo</span>
            </span>
            <span className="font-mono text-emerald-300 text-[11px] font-bold">{counts.live}</span>
          </button>

          {/* Próximos */}
          <button
            onClick={() => setSelectedStatus('SCHEDULED')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedStatus === 'SCHEDULED'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
                : 'text-slate-300 hover:bg-purple-950/40 hover:text-white'
            }`}
          >
            <span>Próximos</span>
            <span className="font-mono text-slate-400 text-[11px]">{counts.scheduled}</span>
          </button>

          {/* Finalizados */}
          <button
            onClick={() => setSelectedStatus('FINISHED')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedStatus === 'FINISHED'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
                : 'text-slate-300 hover:bg-purple-950/40 hover:text-white'
            }`}
          >
            <span>Finalizados</span>
            <span className="font-mono text-slate-400 text-[11px]">{counts.finished}</span>
          </button>
        </div>
      </div>

      {/* Filtrar por Competición */}
      <div>
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-2">
          Filtrar por Competición
        </h3>
        <div className="space-y-1">
          {COMPETITIONS_SIDEBAR.map((comp) => {
            const isActive = selectedLeague === comp.id;
            return (
              <button
                key={comp.id}
                onClick={() => setSelectedLeague(comp.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm font-bold'
                    : 'text-slate-300 hover:bg-purple-950/40 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-sm shrink-0">{comp.icon}</span>
                  <span className="truncate">{comp.name}</span>
                </div>
                <span className="font-mono text-slate-500 text-[11px] shrink-0">
                  {comp.id === 'ALL' ? counts.all : (countsByLeague[comp.id] || 0)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
