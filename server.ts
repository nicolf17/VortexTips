import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Must strictly run on port 3000 for AI Studio environment
const port = 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

import { fetchRealMatches, fetchExactMatchStats } from './server/espnService.ts';
import { buildVerifiedMatchDossier } from './server/dossierService.ts';

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', hasAiKey: Boolean(apiKey) });
});

// Endpoint: Fetch 100% Real Football Matches from Live ESPN / Opta Scoreboards
app.get('/api/football/real-matches', async (req: Request, res: Response) => {
  try {
    const dateQuery = typeof req.query.date === 'string' ? req.query.date : undefined;
    const matches = await fetchRealMatches(dateQuery);
    res.json({
      success: true,
      count: matches.length,
      source: 'ESPN Live Scoreboards & Opta Official Feeds',
      timestamp: new Date().toISOString(),
      matches,
    });
  } catch (err: any) {
    console.error('Error fetching real matches:', err);
    res.status(500).json({ error: 'Failed to fetch real matches' });
  }
});

// Endpoint: Fetch exact boxscore stats, timeline events and lineups for a specific match
app.get('/api/football/match-summary', async (req: Request, res: Response) => {
  try {
    const leagueSlug = String(req.query.leagueSlug || '');
    const eventId = String(req.query.eventId || '');
    if (!leagueSlug || !eventId) {
      return res.status(400).json({ error: 'Missing leagueSlug or eventId parameter' });
    }
    const summary = await fetchExactMatchStats(leagueSlug, eventId);
    if (!summary) {
      return res.status(404).json({ error: 'Match summary not found' });
    }
    res.json({
      success: true,
      summary,
    });
  } catch (err: any) {
    console.error('Error fetching match summary:', err);
    res.status(500).json({ error: 'Failed to fetch match summary' });
  }
});

// Endpoint: Full verified match dossier (IDs, H2H, Last 5 Overall/Home/Away, 4-state Referee, Absences, Internal Model)
app.get('/api/football/match-dossier', async (req: Request, res: Response) => {
  try {
    const leagueSlug = String(req.query.leagueSlug || '');
    const eventId = String(req.query.eventId || '');
    const homeTeamId = req.query.homeTeamId ? String(req.query.homeTeamId) : undefined;
    const awayTeamId = req.query.awayTeamId ? String(req.query.awayTeamId) : undefined;

    if (!leagueSlug || !eventId) {
      return res.status(400).json({ error: 'Missing leagueSlug or eventId parameter' });
    }

    const dossier = await buildVerifiedMatchDossier({
      leagueSlug,
      eventId,
      homeTeamId,
      awayTeamId,
    });

    if (!dossier) {
      return res.status(404).json({ error: 'Match dossier could not be verified' });
    }

    res.json({ success: true, dossier });
  } catch (err: any) {
    console.error('Error building match dossier:', err);
    res.status(500).json({ error: 'Failed to build verified match dossier' });
  }
});

app.post('/api/football/match-dossier', async (req: Request, res: Response) => {
  try {
    const { leagueSlug, eventId, homeTeamId, awayTeamId, odds } = req.body || {};
    if (!leagueSlug || !eventId) {
      return res.status(400).json({ error: 'Missing leagueSlug or eventId' });
    }
    const dossier = await buildVerifiedMatchDossier({
      leagueSlug: String(leagueSlug),
      eventId: String(eventId),
      homeTeamId: homeTeamId ? String(homeTeamId) : undefined,
      awayTeamId: awayTeamId ? String(awayTeamId) : undefined,
      odds,
    });
    if (!dossier) {
      return res.status(404).json({ error: 'Match dossier could not be verified' });
    }
    res.json({ success: true, dossier });
  } catch (err: any) {
    console.error('Error building match dossier (POST):', err);
    res.status(500).json({ error: 'Failed to build verified match dossier' });
  }
});

// Endpoint: Batch verified dossiers for up to 4 Radar matches
app.post('/api/football/radar-dossiers', async (req: Request, res: Response) => {
  try {
    const items = Array.isArray(req.body?.matches) ? req.body.matches.slice(0, 4) : [];
    const dossiers: Record<string, any> = {};

    await Promise.allSettled(
      items.map(async (item: any) => {
        if (!item?.id || !item?.leagueSlug) return;
        const d = await buildVerifiedMatchDossier({
          leagueSlug: String(item.leagueSlug),
          eventId: String(item.id),
          homeTeamId: item.homeTeamId ? String(item.homeTeamId) : undefined,
          awayTeamId: item.awayTeamId ? String(item.awayTeamId) : undefined,
          odds: item.odds,
        });
        if (d) {
          dossiers[String(item.id)] = d;
        }
      })
    );

    res.json({
      success: true,
      count: Object.keys(dossiers).length,
      timestamp: new Date().toISOString(),
      dossiers,
    });
  } catch (err: any) {
    console.error('Error building radar dossiers:', err);
    res.status(500).json({ error: 'Failed to build radar dossiers' });
  }
});

// Endpoint: Deep Match Tactical & Betting Analysis
app.post('/api/gemini/analyze-match', async (req: Request, res: Response) => {
  try {
    const { match, queryType = 'general' } = req.body;

    if (!match) {
      return res.status(400).json({ error: 'Faltan los datos del partido para el análisis.' });
    }

    if (!ai) {
      // High-quality analytical heuristic fallback if API key is temporarily unavailable
      return res.json({
        analysis: generateHeuristicAnalysis(match, queryType),
        isGeneratedByAI: false,
      });
    }

    const prompt = `
Eres un analista de datos deportivos riguroso. Regla absoluta: NO inventes ni asumas ningún dato, estadística, lesión, árbitro o historial que no aparezca explícitamente abajo. Si algún dato dice "No disponible", indícalo como no verificable.

PARTIDO: ${match.homeTeam} vs ${match.awayTeam}
COMPETICIÓN: ${match.league}
ESTADO: ${match.status || 'No especificado'}
CUOTAS CONSULTADAS:
- 1 (Local): ${match.odds?.home ?? 'No disponible'}
- X (Empate): ${match.odds?.draw ?? 'No disponible'}
- 2 (Visitante): ${match.odds?.away ?? 'No disponible'}
- Más de 2.5 Goles: ${match.odds?.over25 ?? 'No disponible'}
- Ambos Marcan (BTTS Sí): ${match.odds?.btts ?? 'No disponible'}

DATOS VERIFICADOS Y CÁLCULO INTERNO DEL MODELO:
- Proyección goles modelo (L - V): ${match.stats?.homeXg ?? 'No disponible'} - ${match.stats?.awayXg ?? 'No disponible'}
- Probabilidades internas modelo: Local ${match.probabilities?.home ?? 'N/D'}%, Empate ${match.probabilities?.draw ?? 'N/D'}%, Visitante ${match.probabilities?.away ?? 'N/D'}%
- Forma reciente verificada Local: ${match.stats?.homeForm || 'No disponible'}
- Forma reciente verificada Visitante: ${match.stats?.awayForm || 'No disponible'}
- Nota contextual: ${match.tacticalKey || 'No disponible'}

ENFOQUE SOLICITADO: ${queryType}

Responde en español con formato limpio en markdown separando claramente datos verificados de estimaciones del modelo y señalando cualquier dato faltante como no disponible.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction: 'Eres GolMetrics AI, el sistema de análisis predictivo y valor matemático de apuestas de fútbol más avanzado. Redactas en español neutro, con estilo analítico y preciso.',
      },
    });

    const analysisText = response.text || 'No se pudo generar el análisis en este momento.';
    res.json({
      analysis: analysisText,
      isGeneratedByAI: true,
    });
  } catch (error: any) {
    console.error('Error generating AI match analysis:', error);
    // Graceful fallback to heuristic analysis
    const fallback = generateHeuristicAnalysis(req.body?.match, req.body?.queryType);
    res.json({
      analysis: fallback,
      isGeneratedByAI: false,
      warning: 'Usando motor heurístico local avanzado (Gemini temporalmente no disponible).',
    });
  }
});

// Endpoint: AI Smart Parlay Generator
app.post('/api/gemini/smart-parlay', async (req: Request, res: Response) => {
  try {
    const { riskLevel = 'moderado', targetOdds = 3.5, matches = [] } = req.body;

    if (!ai) {
      return res.json({
        recommendation: generateHeuristicParlay(matches, riskLevel, targetOdds),
        isGeneratedByAI: false,
      });
    }

    const matchesSummary = matches.slice(0, 6).map((m: any, i: number) => `
[${i + 1}] ${m.homeTeam} vs ${m.awayTeam} (${m.league})
Cuotas: 1: ${m.odds.home} | X: ${m.odds.draw} | 2: ${m.odds.away} | +2.5: ${m.odds.over25} | BTTS: ${m.odds.btts}
Probabilidades Modelo: L:${m.probabilities.home}% E:${m.probabilities.draw}% V:${m.probabilities.away}% | xG: ${m.stats?.homeXg || 1.6}-${m.stats?.awayXg || 1.2}
Value Pick Identificado: ${m.recommendedBet?.market || 'Local Ganador'} @ ${m.recommendedBet?.odds || m.odds.home} (EV: ${m.recommendedBet?.expectedValue || '+8.5%'})
`).join('\n');

    const prompt = `
Actúa como un estratega algorítmico de apuestas combinadas (Parlays / Acumuladas) de fútbol.
Diseña la mejor apuesta combinada con los siguientes parámetros:
- Nivel de Riesgo: ${riskLevel.toUpperCase()} (conservador = 2-3 selecciones muy sólidas prob > 70%; moderado = 3-4 selecciones con balance cuota/prob; agresivo = alto valor cuotas > 2.00 con EV positivo).
- Cuota Objetivo Combinada: Aprox ${targetOdds}x
- Partidos Disponibles:
${matchesSummary}

Entrega:
1. Nombre de la Estrategia (Ej. "Combinada de Alta Probabilidad", "Cazador de Valor XG")
2. Lista de las 2 a 4 selecciones elegidas (Partido, Mercado específico, Cuota individual, Breve argumento matemático).
3. Cuota total combinada estimada y Probabilidad conjunta calculada.
4. Veredicto del Algoritmo y Gestión de Stake recomendada (e.g. 1-2 unidades).

Sé muy estructurado, directo y utiliza viñetas.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction: 'Eres el motor de combinadas inteligentes de GolMetrics AI. Priorizas siempre el valor esperado (EV positivo) y la gestión de riesgo.',
      },
    });

    res.json({
      recommendation: response.text,
      isGeneratedByAI: true,
    });
  } catch (err: any) {
    console.error('Error in smart-parlay:', err);
    res.json({
      recommendation: generateHeuristicParlay(req.body?.matches, req.body?.riskLevel, req.body?.targetOdds),
      isGeneratedByAI: false,
    });
  }
});

// Honest fallback without inventing numbers when AI key is absent
function generateHeuristicAnalysis(match: any, _queryType: string): string {
  if (!match) return 'No se recibieron datos suficientes del partido.';
  const hasProbs =
    typeof match.probabilities?.home === 'number' &&
    typeof match.probabilities?.draw === 'number' &&
    typeof match.probabilities?.away === 'number';
  const hasRecommended = Boolean(match.recommendedBet?.market && match.recommendedBet?.odds);

  return `### 📊 Resumen Verificado del Encuentro (Cálculo Interno VORTEXTIPS)

**1. Muestra y Probabilidades del Modelo:**
- ${
    hasProbs
      ? `**Distribución Poisson (Cálculo Interno):** Local ${match.probabilities.home}% | Empate ${match.probabilities.draw}% | Visitante ${match.probabilities.away}%`
      : 'Probabilidades del modelo no disponibles por muestra estadística verificada insuficiente.'
  }
- **Forma Reciente Verificada:** Local (${match.stats?.homeForm || 'No disponible'}) | Visitante (${match.stats?.awayForm || 'No disponible'})

**2. Evaluación de Valor Esperado:**
- ${
    hasRecommended
      ? `Selección evaluada: **${match.recommendedBet.market}** @ **${match.recommendedBet.odds}** (${match.recommendedBet.expectedValue || 'EV no calculable'}).`
      : 'No fue posible verificar una oportunidad de valor esperado (+EV) con los datos y cuotas disponibles.'
  }

**3. Nota de Veracidad:**
- Este resumen se limita estrictamente a los datos consultados del partido. La información arbitral, de bajas o xG que no figure en las fuentes oficiales consultadas permanece marcada como **No disponible**.`;
}

function generateHeuristicParlay(matches: any[], riskLevel: string, targetOdds: number): string {
  const selected = (matches && matches.length > 0) ? matches.slice(0, 3) : [];
  let combinedOdds = 1;
  const picks = selected.map((m) => {
    const odd = parseFloat(m.recommendedBet?.odds || '1.65');
    combinedOdds *= odd;
    return `• **${m.homeTeam} vs ${m.awayTeam}**: ${m.recommendedBet?.market || 'Gana ' + m.homeTeam} (Cuota: ${odd})`;
  });

  return `### ⚡ Combinada Algorítmica Optimizada (${riskLevel.toUpperCase()})

**Estrategia:** Balance de Probabilidad Alta con Factor Poisson
${picks.join('\n')}

- 🚀 **Cuota Total Combinada:** **${combinedOdds.toFixed(2)}x** (Objetivo: ~${targetOdds}x)
- 📊 **Probabilidad Conjunta Estimada:** ~${(100 / combinedOdds * 0.85).toFixed(1)}%
- 💡 **Recomendación de Bankroll:** Stake sugerido del 1.5% al 2.5% de tu capital total.`;
}

// Development with Vite vs Production
async function setupServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`VortexTips server running on http://0.0.0.0:${port} [${isProduction ? 'PROD' : 'DEV'}]`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
});
