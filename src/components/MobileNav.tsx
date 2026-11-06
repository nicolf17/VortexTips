import React from 'react';
import { Trophy, Globe, Search, Users, Flame } from 'lucide-react';

interface MobileNavProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  liveCount: number;
  onOpenCompetitionsModal: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeModule,
  setActiveModule,
  liveCount,
  onOpenCompetitionsModal,
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121826]/95 backdrop-blur-xl border-t border-slate-800 px-2 py-2 text-slate-300">
      <div className="grid grid-cols-5 gap-1 items-center max-w-md mx-auto text-xs">
        {/* Partidos */}
        <button
          onClick={() => setActiveModule('partidos')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
            activeModule === 'partidos'
              ? 'text-white font-extrabold bg-[#1b2538] border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <Trophy className="w-4 h-4 mb-1" />
            {liveCount > 0 && (
              <span className="absolute -top-1 -right-1.5 h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
            )}
          </div>
          <span className="text-[11px] font-bold">Partidos</span>
        </button>

        {/* Ligas / Competiciones */}
        <button
          onClick={onOpenCompetitionsModal}
          className="flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <Globe className="w-4 h-4 mb-1 text-violet-400" />
          <span className="text-[11px] font-bold">Ligas</span>
        </button>

        {/* Buscador */}
        <button
          onClick={() => setActiveModule('buscador')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
            activeModule === 'buscador'
              ? 'text-white font-extrabold bg-[#1b2538] border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Search className="w-4 h-4 mb-1" />
          <span className="text-[11px] font-bold">Buscar</span>
        </button>

        {/* Árbitros & Disciplina */}
        <button
          onClick={() => setActiveModule('disciplina')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
            activeModule === 'disciplina'
              ? 'text-white font-extrabold bg-[#1b2538] border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 mb-1 text-violet-400" />
          <span className="text-[11px] font-bold">Árbitros</span>
        </button>

        {/* Radar Props */}
        <button
          onClick={() => setActiveModule('props')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
            activeModule === 'props'
              ? 'text-white font-extrabold bg-[#1b2538] border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4 mb-1 text-violet-400" />
          <span className="text-[11px] font-bold">Radar</span>
        </button>
      </div>
    </div>
  );
};
