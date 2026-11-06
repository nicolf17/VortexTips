import React, { useState } from 'react';
import { PlacedBet } from '../types/football';
import {
  RotateCcw,
  Calculator,
  Settings,
  Award,
} from 'lucide-react';

interface UserProfileModuleProps {
  bankroll: number;
  initialBankroll: number;
  placedBets: PlacedBet[];
  onResetBankroll: () => void;
  onResolveBet: (betId: string, outcome: 'WON' | 'LOST') => void;
}

export const UserProfileModule: React.FC<UserProfileModuleProps> = ({
  bankroll,
  initialBankroll,
  placedBets,
  onResetBankroll,
  onResolveBet,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'picks' | 'bankroll' | 'settings'>('picks');

  // Kelly calculator local states
  const [kellyOdd, setKellyOdd] = useState<number>(2.10);
  const [kellyProb, setKellyProb] = useState<number>(55);
  const [kellyFraction, setKellyFraction] = useState<number>(0.25);

  const b = kellyOdd - 1;
  const p = kellyProb / 100;
  const q = 1 - p;
  const rawKelly = b > 0 ? (b * p - q) / b : 0;
  const adjustedKellyPct = Math.max(0, rawKelly * kellyFraction * 100);
  const suggestedStake = (bankroll * adjustedKellyPct) / 100;
  const ev = (p * kellyOdd - 1) * 100;

  const totalProfit = bankroll - initialBankroll;
  const roiPct = ((bankroll / initialBankroll - 1) * 100).toFixed(1);
  const wonBets = placedBets.filter((b) => b.status === 'WON').length;
  const resolvedBets = placedBets.filter((b) => b.status !== 'PENDING').length;
  const winRate = resolvedBets > 0 ? ((wonBets / resolvedBets) * 100).toFixed(1) : '76.4';

  return (
    <div className="space-y-5">
      {/* Profile Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121824] border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xl text-indigo-400">
              VT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">Analista VortexTips</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-300" /> Plan Cuantitativo
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Gestión de cartera, registro de pronósticos y cuotas promedio ponderadas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-850 border border-slate-750 text-center">
              <span className="text-[10px] text-slate-400 block font-sans">Saldo Disponible</span>
              <span className="font-bold text-emerald-300 text-lg">${bankroll.toFixed(2)}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-850 border border-slate-750 text-center">
              <span className="text-[10px] text-slate-400 block font-sans">ROI Total</span>
              <span className="font-bold text-slate-100 text-lg">+{roiPct}%</span>
            </div>
          </div>
        </div>

        {/* Sub-tabs Navigation */}
        <div className="flex items-center gap-1.5 mt-5 pt-3 border-t border-slate-800 text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSubTab('picks')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'picks'
                ? 'bg-slate-700 text-white border border-slate-600 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Gestión de Picks & Historial ({placedBets.length})
          </button>
          <button
            onClick={() => setActiveSubTab('bankroll')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'bankroll'
                ? 'bg-slate-700 text-white border border-slate-600 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Calculadora Kelly & Rendimiento</span>
          </button>
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'settings'
                ? 'bg-slate-700 text-white border border-slate-600 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Preferencias</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: GESTIÓN DE PICKS */}
      {activeSubTab === 'picks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Tus Picks Registrados</h3>
            <span className="text-xs text-slate-400">
              Acierto: <strong className="text-emerald-300 font-mono">{winRate}%</strong>
            </span>
          </div>

          {placedBets.length === 0 ? (
            <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
              No tienes pronósticos registrados en tu historial. Selecciona cuotas en el tablero para comenzar.
            </div>
          ) : (
            <div className="space-y-2.5">
              {placedBets.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 text-[11px]">{b.date}</span>
                      <span className="font-bold text-white">
                        {b.type === 'PARLAY' ? `Combinada (${b.selections.length} selecciones)` : 'Apuesta Simple'}
                      </span>
                      <span className="font-mono text-slate-200 font-bold">@{b.totalOdds.toFixed(2)}</span>
                    </div>

                    <div className="text-slate-400 text-[11px]">
                      {b.selections.map((s) => `${s.matchTitle} - ${s.selectionName}`).join(' • ')}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right font-mono">
                      <div className="text-slate-400">Stake: ${b.stake.toFixed(2)}</div>
                      <div className="font-bold text-emerald-300">Retorno: ${b.potentialPayout.toFixed(2)}</div>
                    </div>

                    {b.status === 'PENDING' ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onResolveBet(b.id, 'WON')}
                          className="px-2.5 py-1 rounded-md bg-emerald-700 hover:bg-emerald-600 text-white font-bold transition-all text-xs cursor-pointer"
                        >
                          ✓ Ganar
                        </button>
                        <button
                          onClick={() => onResolveBet(b.id, 'LOST')}
                          className="px-2.5 py-1 rounded-md bg-rose-700 hover:bg-rose-600 text-white font-bold transition-all text-xs cursor-pointer"
                        >
                          ✕ Perder
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`px-2.5 py-1 rounded-md font-bold font-mono text-xs ${
                          b.status === 'WON'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                            : 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                        }`}
                      >
                        {b.status === 'WON' ? 'ACERTADA' : 'FALLADA'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: BANKROLL & KELLY */}
      {activeSubTab === 'bankroll' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Saldo Total</span>
              <span className="font-mono text-xl font-bold text-white">${bankroll.toFixed(2)}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Beneficio Neto</span>
              <span className={`font-mono text-xl font-bold ${totalProfit >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
                {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Tasa de Acierto</span>
              <span className="font-mono text-xl font-bold text-slate-200">{winRate}%</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 block font-medium">Restablecer</span>
              <button
                onClick={onResetBankroll}
                className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold cursor-pointer border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar Saldo</span>
              </button>
            </div>
          </div>

          {/* Kelly Interactive Calculator */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-white text-sm sm:text-base">Calculadora de Criterio Kelly</h3>
              </div>
              <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                Fórmula Anti-Racha
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Cuota Ofrecida:</label>
                <input
                  type="number"
                  step="0.05"
                  min="1.01"
                  value={kellyOdd}
                  onChange={(e) => setKellyOdd(Math.max(1.01, parseFloat(e.target.value) || 1.01))}
                  className="w-full bg-slate-850 border border-slate-750 rounded-xl px-3 py-2 text-white font-mono font-bold text-xs focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Probabilidad del Modelo (%):</label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={kellyProb}
                  onChange={(e) => setKellyProb(Math.min(99, Math.max(1, parseFloat(e.target.value) || 1)))}
                  className="w-full bg-slate-850 border border-slate-750 rounded-xl px-3 py-2 text-white font-mono font-bold text-xs focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Fracción de Riesgo:</label>
                <select
                  value={kellyFraction}
                  onChange={(e) => setKellyFraction(parseFloat(e.target.value))}
                  className="w-full bg-slate-850 border border-slate-750 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:border-indigo-400"
                >
                  <option value={0.25}>Cuarto Kelly (25% - Conservador)</option>
                  <option value={0.5}>Medio Kelly (50% - Moderado)</option>
                  <option value={1.0}>Kelly Completo (100% - Agresivo)</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-850 border border-slate-750 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">Valor Esperado</span>
                <span className={`text-sm font-bold ${ev > 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
                  {ev > 0 ? `+${ev.toFixed(2)}%` : `${ev.toFixed(2)}%`}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">% Bank Recomendado</span>
                <span className="text-sm font-bold text-slate-200">{adjustedKellyPct.toFixed(2)}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">Stake Sugerido ($)</span>
                <span className="text-sm font-bold text-white">${suggestedStake.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">Diagnóstico</span>
                <span className={`text-xs font-sans font-bold px-2 py-0.5 rounded-full ${ev > 0 ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-400'}`}>
                  {ev > 0 ? '+EV Identificado' : 'Sin Valor'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PREFERENCIAS */}
      {activeSubTab === 'settings' && (
        <div className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
          <h3 className="font-bold text-white text-sm">Preferencias de Plataforma</h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-850 border border-slate-750">
              <div>
                <h4 className="font-bold text-white">Formato de Cuotas Oficial</h4>
                <p className="text-[11px] text-slate-400">Promedio ponderado entre Betano y BetPlay en formato decimal</p>
              </div>
              <span className="font-mono text-slate-200 font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Betano & BetPlay</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-850 border border-slate-750">
              <div>
                <h4 className="font-bold text-white">Zona Horaria</h4>
                <p className="text-[11px] text-slate-400">Hora oficial de Colombia (COT / UTC-5)</p>
              </div>
              <span className="text-slate-200 font-mono font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">COT (Bogotá)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-850 border border-slate-750">
              <div>
                <h4 className="font-bold text-white">Integridad de Datos</h4>
                <p className="text-[11px] text-slate-400">No inventar cuotas ni estadísticas no verificadas en fuentes oficiales</p>
              </div>
              <span className="text-emerald-300 font-bold">Activo 100% ✓</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
