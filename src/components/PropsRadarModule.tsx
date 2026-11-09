import React, { useState } from 'react';
import { PLAYERS_DATA } from '../data/mockMatches';
import { BetSelection } from '../types/football';
import { Target, Star, Flame, Trophy, Plus, Check } from 'lucide-react';

interface PropsRadarModuleProps {
  onToggleSelection?: (selection: BetSelection) => void;
  selectedSelections?: BetSelection[];
}

export const PropsRadarModule: React.FC<PropsRadarModuleProps> = ({
  onToggleSelection,
  selectedSelections = [],
}) => {
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');

  const positions = ['ALL', 'Delantero', 'Extremo', 'Mediocentro'];

  const filteredPlayers = PLAYERS_DATA.filter((p) => {
    if (selectedPosition === 'ALL') return true;
    return p.position.toLowerCase().includes(selectedPosition.toLowerCase());
  });

  const isPickSelected = (playerId: string) =>
    selectedSelections.some((s) => s.id === `prop-${playerId}`);

  const handleAddProp = (player: typeof PLAYERS_DATA[0]) => {
    if (!onToggleSelection) return;
    const propOdd = player.goalsPer90 > 1.0 ? 1.90 : 1.75;
    onToggleSelection({
      id: `prop-${player.id}`,
      matchId: player.id,
      matchTitle: `${player.name} (${player.team})`,
      league: player.league,
      marketName: 'Player Prop - Remates a Puerta',
      selectionName: `${player.name}: Más de 1.5 Tiros`,
      odd: propOdd,
      modelProb: 65.0,
      hasValue: true,
      expectedValue: 12.5,
    });
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-sky-950/60 via-[#101c2e] to-blue-950/40 border border-sky-500/30">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-bold uppercase tracking-wider">
            <Target className="w-3.5 h-3.5" />
            <span>Radar de Props de Jugadores</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Remates a Puerta, Goles, Fueras de Juego y Pases
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Métricas por 90 minutos para optimizar apuestas en mercados de jugadores. Selecciona y añade pronósticos directamente a tu boleto de apuestas.
          </p>

          {/* Position Filters */}
          <div className="flex items-center gap-2 pt-2 overflow-x-auto no-scrollbar text-xs font-semibold">
            {positions.map((pos) => (
              <button
                key={pos}
                onClick={() => setSelectedPosition(pos)}
                className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  selectedPosition === pos
                    ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-900/40'
                    : 'bg-[#182337] border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {pos === 'ALL' ? 'Todas las Posiciones' : pos}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Players Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlayers.map((player) => {
          const selected = isPickSelected(player.id);
          const propOdd = player.goalsPer90 > 1.0 ? 1.90 : 1.75;

          return (
            <div
              key={player.id}
              className="p-5 rounded-2xl bg-[#131e30] border border-slate-750 hover:border-sky-500/50 transition-all flex flex-col justify-between group shadow-lg"
            >
              <div>
                {/* Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-750">
                  <img
                    src={player.photoUrl}
                    alt={player.name}
                    className="h-12 w-12 rounded-2xl object-cover border-2 border-sky-500/40 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-extrabold text-white text-base truncate">{player.name}</h4>
                    <div className="text-xs text-sky-300 truncate">
                      {player.team} • #{player.number} • {player.position}
                    </div>
                  </div>
                </div>

                {/* Stats Highlights */}
                <div className="grid grid-cols-3 gap-2 my-3 text-center font-mono text-xs">
                  <div className="p-2 rounded-xl bg-[#0f1826] border border-slate-800">
                    <span className="text-[10px] text-slate-500 block font-sans">Goles / 90m</span>
                    <span className="font-black text-emerald-400 text-sm">{player.goalsPer90}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#0f1826] border border-slate-800">
                    <span className="text-[10px] text-slate-500 block font-sans">Tiros Pta / 90</span>
                    <span className="font-black text-sky-300 text-sm">{player.shotsOnTargetPer90}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#0f1826] border border-slate-800">
                    <span className="text-[10px] text-slate-500 block font-sans">Fueras Juego</span>
                    <span className="font-black text-slate-300 text-sm">{player.offsidesPer90}</span>
                  </div>
                </div>

                {/* Passes and Fouls */}
                <div className="flex items-center justify-between text-xs text-slate-400 py-1 font-mono">
                  <span>Pases: <strong className="text-white">{player.passAccuracy}%</strong></span>
                  <span>Faltas Rec.: <strong className="text-amber-400">{player.foulsDrawnPer90}/90m</strong></span>
                </div>

                <div className="mt-2.5 p-2 rounded-xl bg-[#0f1826] border border-slate-750 text-[11px] text-sky-300 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate"><strong>Señal:</strong> {player.propsRadarTrend}</span>
                </div>
              </div>

              {/* Action Button: Add to Bet Slip */}
              <div className="mt-4 pt-3 border-t border-slate-750 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Pick Sugerido</span>
                  <span className="text-xs font-bold text-white">Over 1.5 Tiros @ {propOdd.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => handleAddProp(player)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selected
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-900/50 ring-1 ring-sky-400'
                      : 'bg-[#0f2442] hover:bg-[#153866] text-sky-200 border border-sky-600/40'
                  }`}
                >
                  {selected ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>En Boleto</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 text-sky-400" />
                      <span>Añadir al Boleto</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
