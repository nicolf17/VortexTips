import React, { useState } from 'react';
import { REFEREES_DATA } from '../data/mockMatches';
import { Match } from '../types/football';
import { getLocalizedTeamName } from '../utils/localization';
import { getLeagueMeta } from '../utils/leagueUtils';
import { ShieldAlert, AlertTriangle, Scale, Star, ArrowRight, Filter, ShieldCheck } from 'lucide-react';

interface DisciplineModuleProps {
  onSelectMatch: (matchId: string) => void;
  matches?: Match[];
}

export const DisciplineModule: React.FC<DisciplineModuleProps> = ({ onSelectMatch, matches = [] }) => {
  const [filterMinCards, setFilterMinCards] = useState<number>(0);

  // Dynamically find a real match with highest card risk or high yellow cards from matches
  const topDisciplineMatch = matches.length > 0
    ? [...matches].sort((a, b) => {
        const aScore = (a.refereeInfo?.yellowAvg || 4) + (a.detailedStats?.yellowCards?.[0] || 0) + (a.detailedStats?.yellowCards?.[1] || 0);
        const bScore = (b.refereeInfo?.yellowAvg || 4) + (b.detailedStats?.yellowCards?.[0] || 0) + (b.detailedStats?.yellowCards?.[1] || 0);
        return bScore - aScore;
      })[0]
    : null;

  const filteredReferees = REFEREES_DATA.filter((r) => r.yellowAvg >= filterMinCards);

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-[#101c2e] to-sky-950/50 border border-amber-500/30">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Radar de Disciplina Arbitral</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Monitoreo Oficial de Tarjetas, Árbitros y Faltas
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Identifica partidos con alta propensión a tarjetas amarillas y expulsiones analizando designaciones arbitrales oficiales y volumen de faltas por 90 minutos.
          </p>
        </div>
      </div>

      {/* High Card Risk Match Highlight */}
      {topDisciplineMatch && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#131e30] border border-amber-500/40 space-y-3 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Partido con Mayor Tensión Disciplinaria Hoy
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-800">
              Línea Recomendada: Over 4.5 Tarjetas
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-3 border-y border-slate-750">
            <div className="min-w-0 flex-1">
              <h4 className="font-extrabold text-white text-base truncate">
                {getLocalizedTeamName(topDisciplineMatch.homeTeam.name)} vs {getLocalizedTeamName(topDisciplineMatch.awayTeam.name)} ({getLeagueMeta(topDisciplineMatch.league, topDisciplineMatch.leagueCode).shortName})
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Árbitro: <strong className="text-amber-300">{topDisciplineMatch.refereeInfo?.name || 'Colegiado Oficial'}</strong> • Promedio: {topDisciplineMatch.refereeInfo?.yellowAvg || 4.8} 🟨 / partido
              </p>
            </div>

            <button
              onClick={() => onSelectMatch(topDisciplineMatch.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all shrink-0 cursor-pointer shadow-md shadow-sky-950/40"
            >
              <span>Ver Ficha del Partido</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Referees Ranking Table */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#131e30] border border-slate-750 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-extrabold text-white text-base">Ranking de Árbitros Más Tarjeteros</h3>
            <span className="text-xs text-slate-400 font-mono">Datos consolidados de temporada federativa</span>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilterMinCards(0)}
              className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                filterMinCards === 0
                  ? 'bg-sky-600 text-white border-sky-400'
                  : 'bg-[#182337] border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              Todos ({REFEREES_DATA.length})
            </button>
            <button
              onClick={() => setFilterMinCards(5.0)}
              className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                filterMinCards === 5.0
                  ? 'bg-amber-600 text-white border-amber-400'
                  : 'bg-[#182337] border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              Muy Estrictos (&gt; 5.0 🟨)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto w-full -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left text-xs font-mono min-w-[640px]">
            <thead className="bg-[#101a2b] text-slate-400 uppercase text-[10px] border-b border-slate-750">
              <tr>
                <th className="p-3 font-sans">Colegiado</th>
                <th className="p-3 font-sans">Competición / País</th>
                <th className="p-3 text-center">Partidos</th>
                <th className="p-3 text-center">Media Amarillas (🟨/p)</th>
                <th className="p-3 text-center">Rojas Totales (🟥)</th>
                <th className="p-3 text-center">Faltas / Partido</th>
                <th className="p-3 font-sans">Perfil de Rigor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-750">
              {filteredReferees.map((ref, idx) => (
                <tr key={idx} className="hover:bg-[#18253a] transition-colors">
                  <td className="p-3 font-sans font-bold text-white">{ref.name}</td>
                  <td className="p-3 font-sans text-slate-300">{ref.country}</td>
                  <td className="p-3 text-center text-slate-300">{ref.matchesCount}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`font-black px-2 py-0.5 rounded-full ${
                        ref.yellowAvg >= 5.5
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'text-sky-300'
                      }`}
                    >
                      {ref.yellowAvg.toFixed(1)}
                    </span>
                  </td>
                  <td className="p-3 text-center text-rose-400 font-bold">{ref.redTotal}</td>
                  <td className="p-3 text-center text-slate-200">{ref.foulsAvg.toFixed(1)}</td>
                  <td className="p-3 font-sans text-[11px] text-slate-400 max-w-xs">{ref.trendDescription}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
