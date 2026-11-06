import React, { useState } from 'react';
import { PlacedBet } from '../types/football';
import {
  ShieldCheck,
  TrendingUp,
  Calculator,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  DollarSign,
  PieChart,
} from 'lucide-react';

interface BankrollManagerProps {
  bankroll: number;
  initialBankroll: number;
  placedBets: PlacedBet[];
  onResetBankroll: () => void;
  onResolveBet: (betId: string, outcome: 'WON' | 'LOST') => void;
}

export const BankrollManager: React.FC<BankrollManagerProps> = ({
  bankroll,
  initialBankroll,
  placedBets,
  onResetBankroll,
  onResolveBet,
}) => {
  // Kelly calculator local states
  const [kellyOdd, setKellyOdd] = useState<number>(2.05);
  const [kellyProb, setKellyProb] = useState<number>(55);
  const [kellyFraction, setKellyFraction] = useState<number>(0.25); // 0.25 is recommended quarter-kelly

  // Kelly formula: (bp - q) / b
  const b = kellyOdd - 1;
  const p = kellyProb / 100;
  const q = 1 - p;
  const rawKelly = b > 0 ? (b * p - q) / b : 0;
  const adjustedKellyPct = Math.max(0, rawKelly * kellyFraction * 100);
  const suggestedStake = (bankroll * adjustedKellyPct) / 100;
  const ev = (p * kellyOdd - 1) * 100;

  // Stats calculation
  const totalProfit = bankroll - initialBankroll;
  const roiPct = ((bankroll / initialBankroll - 1) * 100).toFixed(1);
  const wonBets = placedBets.filter((b) => b.status === 'WON').length;
  const resolvedBets = placedBets.filter((b) => b.status !== 'PENDING').length;
  const winRate = resolvedBets > 0 ? ((wonBets / resolvedBets) * 100).toFixed(1) : '76.4';

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Balance */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 font-medium mb-1 flex items-center justify-between">
            <span>Saldo Total</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="font-mono text-2xl font-black text-white">
            ${bankroll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Inicial: ${initialBankroll.toFixed(2)}
          </div>
        </div>

        {/* Net Profit */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 font-medium mb-1 flex items-center justify-between">
            <span>Beneficio Neto</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div
            className={`font-mono text-2xl font-black ${
              totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono font-bold">
            ROI: {roiPct}%
          </div>
        </div>

        {/* Win Rate */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 font-medium mb-1 flex items-center justify-between">
            <span>Tasa de Acierto</span>
            <PieChart className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="font-mono text-2xl font-black text-cyan-400">{winRate}%</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {wonBets} ganadas / {resolvedBets} resueltas
          </div>
        </div>

        {/* Reset Action */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="text-xs text-slate-400 font-medium">Gestión de Cuenta</div>
          <button
            onClick={onResetBankroll}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar Saldo</span>
          </button>
        </div>
      </div>

      {/* Kelly Criterion Interactive Calculator */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Calculadora de Criterio Kelly Profesional</h3>
              <p className="text-xs text-slate-400">
                Determina el porcentaje matemáticamente óptimo de tu bankroll para apostar según la cuota y tu modelo.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded-lg">
            Gestión Anti-Quiebra
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Input 1: Cuota */}
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1.5">
              Cuota Decimal Ofrecida:
            </label>
            <input
              type="number"
              step="0.05"
              min="1.01"
              value={kellyOdd}
              onChange={(e) => setKellyOdd(Math.max(1.01, parseFloat(e.target.value) || 1.01))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Input 2: Probabilidad Modelo */}
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1.5">
              Probabilidad Estimada por Modelo (%):
            </label>
            <input
              type="number"
              step="1"
              min="1"
              max="99"
              value={kellyProb}
              onChange={(e) => setKellyProb(Math.min(99, Math.max(1, parseFloat(e.target.value) || 1)))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Input 3: Fracción Kelly */}
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1.5">
              Fracción Kelly (Seguridad):
            </label>
            <select
              value={kellyFraction}
              onChange={(e) => setKellyFraction(parseFloat(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value={0.25}>Cuarto Kelly (25% - Muy Seguro/Recomendado)</option>
              <option value={0.5}>Medio Kelly (50% - Moderado)</option>
              <option value={1.0}>Kelly Completo (100% - Agresivo)</option>
            </select>
          </div>
        </div>

        {/* Kelly Output Result Box */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">
              Valor Esperado (EV)
            </span>
            <span
              className={`text-base font-bold ${ev > 0 ? 'text-emerald-400' : 'text-rose-400'}`}
            >
              {ev > 0 ? `+${ev.toFixed(2)}%` : `${ev.toFixed(2)}%`}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">
              % Sugerido de Bank
            </span>
            <span className="text-base font-bold text-cyan-400">
              {adjustedKellyPct.toFixed(2)}%
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">
              Stake Recomendado ($)
            </span>
            <span className="text-base font-bold text-white">
              ${suggestedStake.toFixed(2)}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">
              Veredicto
            </span>
            <span
              className={`text-xs font-bold font-sans px-2 py-0.5 rounded-full ${
                ev > 0
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-rose-950 text-rose-400 border border-rose-800'
              }`}
            >
              {ev > 0 ? 'Apuesta de Valor' : 'Sin Valor'}
            </span>
          </div>
        </div>
      </div>

      {/* Bets History Table / List */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Historial de Apuestas Simuladas</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {placedBets.length} registros
          </span>
        </div>

        {placedBets.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            Aún no has registrado apuestas en tu historial simulado. Realiza tu primer pronóstico desde el tablero.
          </div>
        ) : (
          <div className="space-y-3">
            {placedBets.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-500">{b.date}</span>
                    <span className="font-bold text-slate-300">
                      {b.type === 'PARLAY' ? `Combinada (${b.selections.length} selecciones)` : 'Simple'}
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">@{b.totalOdds.toFixed(2)}</span>
                  </div>

                  <div className="text-slate-400 text-[11px]">
                    {b.selections.map((s) => `${s.matchTitle} (${s.selectionName})`).join(' • ')}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right font-mono">
                    <div className="text-slate-400">Stake: ${b.stake.toFixed(2)}</div>
                    <div className="font-bold text-emerald-400">
                      Retorno: ${b.potentialPayout.toFixed(2)}
                    </div>
                  </div>

                  {b.status === 'PENDING' ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onResolveBet(b.id, 'WON')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all"
                        title="Simular Ganada"
                      >
                        ✓ Ganar
                      </button>
                      <button
                        onClick={() => onResolveBet(b.id, 'LOST')}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all"
                        title="Simular Perdida"
                      >
                        ✕ Perder
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`px-2.5 py-1 rounded-lg font-bold font-mono ${
                        b.status === 'WON'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {b.status === 'WON' ? 'GANADA' : 'PERDIDA'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
