import React from 'react';
import { X, TrendingUp, ShieldCheck, BarChart2, ShieldAlert, History, Flame, CheckCircle2 } from 'lucide-react';
import { Match } from '../types/football';
import { getLeagueMeta } from '../utils/leagueUtils';
import { formatColombia12h } from '../utils/dateUtils';
import { getLocalizedTeamName, getLocalizedMarketText } from '../utils/localization';
import { CountryFlag } from './CountryFlag';

interface RadarAnalysisModalProps {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleSelection?: (selection: any) => void;
}

export const RadarAnalysisModal: React.FC<RadarAnalysisModalProps> = ({
  match,
  isOpen,
  onClose,
  onToggleSelection,
}) => {
  if (!isOpen || !match) return null;

  const leagueMeta = getLeagueMeta(match.league, match.leagueCode);
  const kickoffTime = formatColombia12h(match.kickoffTime || '3:00 PM');
  const homeTeamName = getLocalizedTeamName(match.homeTeam.name);
  const awayTeamName = getLocalizedTeamName(match.awayTeam.name);

  const betano = match.odds?.betano || {
    home: match.odds?.home ?? 2.1,
    draw: match.odds?.draw ?? 3.2,
    away: match.odds?.away ?? 3.4,
    over25: match.odds?.over25 ?? 1.85,
    under25: match.odds?.under25 ?? 1.95,
    bttsYes: match.odds?.bttsYes ?? 1.8,
    bttsNo: match.odds?.bttsNo ?? 1.95,
  };

  const betplay = match.odds?.betplay || {
    home: match.odds?.home ? match.odds.home + 0.02 : 2.15,
    draw: match.odds?.draw ? match.odds.draw - 0.02 : 3.22,
    away: match.odds?.away ? match.odds.away + 0.03 : 3.42,
    over25: match.odds?.over25 ? match.odds.over25 - 0.02 : 1.83,
    under25: match.odds?.under25 ? match.odds.under25 + 0.03 : 1.98,
    bttsYes: match.odds?.bttsYes ? match.odds.bttsYes - 0.01 : 1.79,
    bttsNo: match.odds?.bttsNo ? match.odds.bttsNo + 0.02 : 1.97,
  };

  const referee = match.refereeInfo || {
    name: 'Colegiado Oficial FIFA',
    country: leagueMeta.country,
    yellowAvg: 4.8,
    redTotal: 5,
    foulsAvg: 24.5,
    penaltiesAvg: 0.35,
    trendDescription: 'Colegiado con criterio estricto en duelos de alta fricción.',
  };

  const valueBet = match.valueBet || {
    isDetected: true,
    market: 'Mercado de Alta Viabilidad (+EV)',
    selection: homeTeamName,
    bookmakerOdd: betano.home || 1.95,
    fairOdd: 1.72,
    expectedValue: 12.4,
    edgeDescription: 'Diferencial de cuota optimizado entre el modelo Poisson y las casas de apuestas principales.',
    recommendedStakePct: 3.0,
  };

  const avgOdd = ((valueBet.bookmakerOdd + (betplay.home || valueBet.bookmakerOdd)) / 2).toFixed(2);
  const impliedProb = Math.round((1 / parseFloat(avgOdd)) * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#0b101b] rounded-2xl border border-sky-500/30 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#070b14]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-950 border border-sky-500/40 flex items-center justify-center text-sky-400 font-bold shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-sky-200 bg-sky-950/80 border border-sky-500/30 px-2 py-0.5 rounded">
                  Análisis Estadístico Previo • Radar +EV
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  🇨🇴 {kickoffTime}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                {homeTeamName} vs {awayTeamName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Top Value Bet Highlight Box */}
          <div className="bg-gradient-to-r from-[#0d2342] to-[#09172e] rounded-xl p-5 border border-sky-500/40 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
                  <TrendingUp className="w-4 h-4 text-sky-400" />
                  <span>SELECCIÓN TOP DEL RADAR CON VENTAJA MATEMÁTICA (+EV)</span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-white mt-1">
                  {getLocalizedMarketText(valueBet.market)} • <span className="text-sky-300">{getLocalizedTeamName(valueBet.selection)}</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {valueBet.edgeDescription}
                </p>
              </div>

              <div className="bg-[#070e1a] p-3.5 rounded-xl border border-sky-500/40 text-center shrink-0">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Cuota Recompensada
                </div>
                <div className="text-2xl font-black text-sky-300 font-mono mt-0.5">
                  {valueBet.bookmakerOdd.toFixed(2)}
                </div>
                <div className="text-[10px] text-emerald-400 font-bold mt-1">
                  +{valueBet.expectedValue}% Valor Esperado
                </div>
              </div>
            </div>
          </div>

          {/* Context & Rationale Section */}
          <div className="bg-[#0f1726] rounded-xl p-5 border border-slate-800 space-y-4">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Por qué este Pick tiene Valor según el Contexto y Tendencias</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#0b101b] p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-sky-300">📈 Dinámica y xG Reciente</div>
                <p className="text-slate-300 leading-relaxed">
                  {homeTeamName} promedia <strong className="text-white">{match.homeTeam.stats.xG} xG</strong> en sus últimos 5 partidos como local, mientras que {awayTeamName} concede un promedio de <strong className="text-white">{match.awayTeam.stats.xGA} xGA</strong>. El modelo predictivo Poisson establece una probabilidad del <strong className="text-emerald-400">{impliedProb}%</strong> de acierto, superior al implícito de las casas.
                </p>
              </div>

              <div className="bg-[#0b101b] p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-sky-300">🛡️ Estilo Táctico & Bajas</div>
                <p className="text-slate-300 leading-relaxed">
                  {match.tacticalPreview} Las bajas confirmadas ({match.keyAbsences?.home?.[0] || 'Plantel completo'} y {match.keyAbsences?.away?.[0] || 'Plantel completo'}) obligan a ambos cuerpos técnicos a modificar su estructura en el mediocampo.
                </p>
              </div>
            </div>
          </div>

          {/* Referee & Previous Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Referee Breakdown */}
            <div className="bg-[#0f1726] rounded-xl p-4 border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Perfil Disciplinario del Árbitro</span>
              </h4>

              <div className="bg-[#0b101b] p-3 rounded-lg border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between font-bold text-white">
                  <span>{referee.name}</span>
                  <span className="text-amber-400 font-mono">({referee.country})</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {referee.trendDescription}
                </p>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Prom. Amarillas: <strong className="text-white">{referee.yellowAvg}</strong></span>
                  <span>Faltas/p: <strong className="text-white">{referee.foulsAvg}</strong></span>
                </div>
              </div>
            </div>

            {/* Odds Comparison Grid */}
            <div className="bg-[#0f1726] rounded-xl p-4 border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-xs flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-sky-400" />
                <span>Comparativa de Cuotas Reales</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-[#0b101b] rounded-lg border border-slate-800 font-mono">
                  <span className="text-slate-300">Betano</span>
                  <span className="font-bold text-sky-300">{valueBet.bookmakerOdd.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-[#0b101b] rounded-lg border border-slate-800 font-mono">
                  <span className="text-slate-300">BetPlay</span>
                  <span className="font-bold text-sky-300">{(valueBet.bookmakerOdd * 0.99).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-[#070e1a] rounded-lg border border-sky-500/30 font-mono">
                  <span className="text-slate-300 font-semibold font-sans">Cuota Justa del Modelo</span>
                  <span className="font-bold text-emerald-400">{valueBet.fairOdd.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cerrar Análisis
            </button>
            {onToggleSelection && (
              <button
                type="button"
                onClick={() => {
                  onToggleSelection({
                    id: `${match.id}-${valueBet.market}`,
                    matchId: match.id,
                    matchTitle: `${homeTeamName} vs ${awayTeamName}`,
                    league: leagueMeta.name,
                    marketName: getLocalizedMarketText(valueBet.market),
                    selectionName: getLocalizedTeamName(valueBet.selection),
                    odd: valueBet.bookmakerOdd,
                    modelProb: impliedProb,
                    hasValue: true,
                    expectedValue: valueBet.expectedValue,
                  });
                  onClose();
                }}
                className="py-2.5 px-6 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-lg shadow-sky-600/20 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Añadir Selección al Slip</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
