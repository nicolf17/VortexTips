import React from 'react';
import { Activity, Search, Calendar, Users } from 'lucide-react';
import { getTodayTabInfo } from '../utils/dateUtils';
import { getLeagueMeta } from '../utils/leagueUtils';

interface FooterProps {
  onResetToHome: () => void;
  onOpenSearch: () => void;
  onSelectLeague: (league: string) => void;
  onOpenReferees: () => void;
  onOpenToday: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onResetToHome,
  onOpenSearch,
  onSelectLeague,
  onOpenReferees,
  onOpenToday,
}) => {
  const todayInfo = getTodayTabInfo();

  const leaguesList = [
    { code: 'COL', name: 'Liga BetPlay Dimayor' },
    { code: 'UCL', name: 'UEFA Champions League' },
    { code: 'EPL', name: 'Premier League' },
    { code: 'ESP', name: 'LaLiga EA Sports' },
    { code: 'ITA', name: 'Serie A' },
    { code: 'GER', name: 'Bundesliga' },
  ];

  return (
    <footer className="bg-[#121826] border-t border-slate-800 mt-16 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <button
              onClick={onResetToHome}
              className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-lg font-extrabold bg-gradient-to-r from-violet-400 to-white bg-clip-text text-transparent">
                VORTEXTIPS
              </span>
            </button>
            <p className="text-slate-400 text-xs leading-relaxed">
              Plataforma independiente de inteligencia deportiva, estadísticas avanzadas y comparador de cuotas promedio de Betano y BetPlay.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-950/70 text-violet-300 border border-violet-800/50 text-[11px] font-semibold">
                🇨🇴 {todayInfo.label} • Hora Colombia (COT)
              </span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Navegación Rápida
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onResetToHome}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Cartelera Principal
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenToday}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Partidos de Hoy ({todayInfo.label})
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSearch}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  Buscador de Jugadores & Árbitros
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenReferees}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  Radar de Árbitros & Disciplina
                </button>
              </li>
            </ul>
          </div>

          {/* Top Leagues Shortcuts with flags */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Competiciones & Ligas
            </h4>
            <ul className="space-y-2">
              {leaguesList.map((lg) => {
                const meta = getLeagueMeta(lg.name, lg.code);
                return (
                  <li key={lg.code}>
                    <button
                      onClick={() => onSelectLeague(lg.code)}
                      className="hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <span>{meta.icon}</span>
                      <span>{meta.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Data integrity notice */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Integridad de Datos
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Las cuotas mostradas representan el promedio ponderado oficial entre Betano y BetPlay para fines de análisis cuantitativo.
            </p>
            <div className="mt-3 p-3 bg-[#172032] rounded-xl border border-slate-750 text-[11px] text-slate-400">
              <span className="text-emerald-400 font-bold block mb-1">✓ Fechas Reales en Tiempo Real</span>
              Sincronizado con el calendario oficial y huso horario de Colombia (UTC-5).
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-slate-400 text-[11px]">
          © {new Date().getFullYear()} VortexTips. Todos los derechos reservados. Plataforma de analítica deportiva.
        </div>
      </div>
    </footer>
  );
};
