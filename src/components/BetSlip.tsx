import React, { useState } from 'react';
import { BetSelection, Match, PlacedBet } from '../types/football';
import { requestSmartParlay } from '../services/api';
import confetti from 'canvas-confetti';
import {
  X,
  Trash2,
  Sparkles,
  Ticket,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Flame,
} from 'lucide-react';

interface BetSlipProps {
  isOpen: boolean;
  onClose: () => void;
  selections: BetSelection[];
  onRemoveSelection: (id: string) => void;
  onClearSlip: () => void;
  matches: Match[];
  onPlaceBet: (bet: PlacedBet) => void;
  bankroll: number;
}

export const BetSlip: React.FC<BetSlipProps> = ({
  isOpen,
  onClose,
  selections,
  onRemoveSelection,
  onClearSlip,
  matches,
  onPlaceBet,
  bankroll,
}) => {
  const [betType, setBetType] = useState<'SIMPLE' | 'PARLAY'>('PARLAY');
  const [stake, setStake] = useState<number>(20);
  const [isGeneratingAiParlay, setIsGeneratingAiParlay] = useState<boolean>(false);
  const [aiParlayAdvice, setAiParlayAdvice] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalOdds = selections.reduce((acc, curr) => acc * curr.odd, 1);
  const combinedProb = selections.reduce((acc, curr) => acc * (curr.modelProb / 100), 1) * 100;
  const potentialPayout = betType === 'PARLAY' ? stake * totalOdds : stake * (selections[0]?.odd || 1);

  const handleGenerateAiParlay = async (risk: 'conservador' | 'moderado' | 'alto-rendimiento') => {
    setIsGeneratingAiParlay(true);
    setAiParlayAdvice(null);
    try {
      const res = await requestSmartParlay(
        matches,
        risk,
        risk === 'conservador' ? 2.5 : risk === 'moderado' ? 4.5 : 8.0
      );
      setAiParlayAdvice(res.recommendation);
    } catch (err) {
      console.error(err);
      setAiParlayAdvice('No se pudo generar la recomendación en este momento.');
    } finally {
      setIsGeneratingAiParlay(false);
    }
  };

  const handleConfirmBet = () => {
    if (selections.length === 0 || stake <= 0 || stake > bankroll) return;

    confetti({
      particleCount: 60,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#4f6b94', '#6ee7b7', '#94a3b8'],
    });

    const newBet: PlacedBet = {
      id: `bet-${Date.now()}`,
      date: new Date().toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit' }) + ' COT',
      type: betType,
      selections: [...selections],
      totalOdds: betType === 'PARLAY' ? totalOdds : (selections[0]?.odd || 1),
      stake,
      potentialPayout,
      status: 'PENDING',
    };

    onPlaceBet(newBet);
    onClearSlip();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-[#121824] border-l border-slate-800 h-full flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-[#161f2e] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-indigo-400" />
            <h3 className="font-extrabold text-white text-base">Boleto VortexTips</h3>
            <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-bold">
              {selections.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {selections.length > 0 && (
              <button
                onClick={onClearSlip}
                className="text-xs text-slate-400 hover:text-rose-400 p-1.5 transition-colors cursor-pointer"
                title="Vaciar boleto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bet Type Switcher */}
        {selections.length > 1 && (
          <div className="p-3 border-b border-slate-800 bg-[#141b27] grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setBetType('PARLAY')}
              className={`py-2 rounded-xl font-bold transition-all cursor-pointer ${
                betType === 'PARLAY'
                  ? 'bg-slate-700 text-white border border-slate-600 shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-750'
              }`}
            >
              Combinada ({selections.length})
            </button>
            <button
              onClick={() => setBetType('SIMPLE')}
              className={`py-2 rounded-xl font-bold transition-all cursor-pointer ${
                betType === 'SIMPLE'
                  ? 'bg-slate-700 text-white border border-slate-600 shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-750'
              }`}
            >
              Apuesta Simple
            </button>
          </div>
        )}

        {/* AI Parlay Optimizer Tool */}
        <div className="p-3 border-b border-slate-800 bg-[#141b27]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Asesor Parlay IA
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Consenso Betano / BetPlay</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              onClick={() => handleGenerateAiParlay('conservador')}
              disabled={isGeneratingAiParlay}
              className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium transition-all cursor-pointer border border-slate-750"
            >
              🛡️ Conservador
            </button>
            <button
              onClick={() => handleGenerateAiParlay('moderado')}
              disabled={isGeneratingAiParlay}
              className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium transition-all cursor-pointer border border-slate-750"
            >
              ⚖️ Balanceado
            </button>
            <button
              onClick={() => handleGenerateAiParlay('alto-rendimiento')}
              disabled={isGeneratingAiParlay}
              className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium transition-all cursor-pointer border border-slate-750"
            >
              🚀 Rendimiento
            </button>
          </div>

          {isGeneratingAiParlay && (
            <div className="mt-2 text-center text-xs text-slate-300 animate-pulse font-mono py-1">
              Evaluando combinada con Poisson y datos oficiales...
            </div>
          )}

          {aiParlayAdvice && (
            <div className="mt-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 whitespace-pre-line max-h-48 overflow-y-auto">
              {aiParlayAdvice}
            </div>
          )}
        </div>

        {/* Selected Picks List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {selections.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Ticket className="w-12 h-12 text-slate-700 mb-3" />
              <p className="font-bold text-slate-300 text-sm">Tu boleto está vacío</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                Selecciona cualquier cuota en las tarjetas o en el comparador para construir tu pronóstico.
              </p>
            </div>
          ) : (
            selections.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all relative shadow-sm"
              >
                <button
                  onClick={() => onRemoveSelection(item.id)}
                  className="absolute top-2.5 right-2.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="pr-6">
                  <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                    {item.league}
                  </div>
                  <div className="text-xs font-semibold text-slate-300 truncate">{item.matchTitle}</div>
                  <div className="mt-1 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">{item.selectionName}</span>
                      <span className="text-[10px] text-slate-400">{item.marketName}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-sm text-emerald-300">
                        {item.odd.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {item.hasValue && (
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-200 font-medium">
                      <Flame className="w-3 h-3 text-amber-300" />
                      <span>Value Pick (+{item.expectedValue}% EV)</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stake & Payout Controls */}
        {selections.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-[#161f2e] space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400 font-medium">
                {betType === 'PARLAY' ? 'Cuota Total Combinada:' : 'Cuota Selección:'}
              </span>
              <span className="font-mono font-bold text-base text-slate-100">
                {betType === 'PARLAY' ? totalOdds.toFixed(2) : (selections[0]?.odd || 1).toFixed(2)}x
              </span>
            </div>

            {betType === 'PARLAY' && (
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Probabilidad Conjunta Modelo:</span>
                <span className="font-mono font-bold text-slate-200">{combinedProb.toFixed(1)}%</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Importe / Stake:</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Saldo: ${bankroll.toFixed(2)}
                </span>
              </div>

              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  min="1"
                  max={bankroll}
                  value={stake}
                  onChange={(e) => setStake(Math.max(1, Number(e.target.value)))}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-750 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="flex items-center gap-1.5 mt-2">
                {[5, 10, 25, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setStake(amt)}
                    className={`flex-1 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      stake === amt
                        ? 'bg-slate-700 text-white border border-slate-600'
                        : 'bg-slate-800 text-slate-400 border border-slate-750 hover:text-white'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                  Ganancia Potencial
                </span>
                <span className="font-mono font-black text-xl text-emerald-300">
                  ${potentialPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-right text-[11px] text-slate-400 font-mono">
                Retorno: +{((potentialPayout / stake - 1) * 100).toFixed(0)}%
              </div>
            </div>

            <button
              onClick={handleConfirmBet}
              disabled={stake > bankroll}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-98 flex items-center justify-center gap-2 cursor-pointer ${
                stake > bankroll
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
              }`}
            >
              {stake > bankroll ? (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Saldo Insuficiente</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar Pronóstico (${stake})</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
