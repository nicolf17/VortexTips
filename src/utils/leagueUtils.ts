// League Badge & Flag Metadata Helper
// National leagues display their official country flag (e.g. 🇨🇴, 🏴󠁧󠁢󠁥󠁮󠁧󠁿, 🇪🇸, 🇮🇹, 🇩🇪, 🇫🇷, 🇲🇽, 🇧🇷, 🇦🇷)
// International competitions display their iconic trophy/star symbol (⭐ UCL, 🏆 Libertadores, 🛡️ UEL, 🎖️ UECL)

export interface LeagueMeta {
  code: string;
  name: string;
  shortName: string;
  icon: string; // Flag or tournament symbol
  country: string;
  isInternational: boolean;
}

export const KNOWN_LEAGUES: Record<string, LeagueMeta> = {
  COL: {
    code: 'COL',
    name: 'Liga BetPlay Dimayor',
    shortName: 'Liga BetPlay',
    icon: '🇨🇴',
    country: 'Colombia',
    isInternational: false,
  },
  EPL: {
    code: 'EPL',
    name: 'Premier League',
    shortName: 'Premier League',
    icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    country: 'Inglaterra',
    isInternational: false,
  },
  ESP: {
    code: 'ESP',
    name: 'LaLiga EA Sports',
    shortName: 'LaLiga',
    icon: '🇪🇸',
    country: 'España',
    isInternational: false,
  },
  ESP2: {
    code: 'ESP2',
    name: 'LaLiga Hypermotion',
    shortName: 'LaLiga 2',
    icon: '🇪🇸',
    country: 'España',
    isInternational: false,
  },
  ITA: {
    code: 'ITA',
    name: 'Serie A Enilive',
    shortName: 'Serie A',
    icon: '🇮🇹',
    country: 'Italia',
    isInternational: false,
  },
  GER: {
    code: 'GER',
    name: 'Bundesliga',
    shortName: 'Bundesliga',
    icon: '🇩🇪',
    country: 'Alemania',
    isInternational: false,
  },
  FRA: {
    code: 'FRA',
    name: 'Ligue 1 McDonald\'s',
    shortName: 'Ligue 1',
    icon: '🇫🇷',
    country: 'Francia',
    isInternational: false,
  },
  UCL: {
    code: 'UCL',
    name: 'UEFA Champions League',
    shortName: 'Champions League',
    icon: '⭐',
    country: 'Europa',
    isInternational: true,
  },
  UEL: {
    code: 'UEL',
    name: 'UEFA Europa League',
    shortName: 'Europa League',
    icon: '🛡️',
    country: 'Europa',
    isInternational: true,
  },
  UECL: {
    code: 'UECL',
    name: 'UEFA Conference League',
    shortName: 'Conference League',
    icon: '🎖️',
    country: 'Europa',
    isInternational: true,
  },
  LIB: {
    code: 'LIB',
    name: 'Copa CONMEBOL Libertadores',
    shortName: 'Copa Libertadores',
    icon: '🏆',
    country: 'Sudamérica',
    isInternational: true,
  },
  SUD: {
    code: 'SUD',
    name: 'Copa CONMEBOL Sudamericana',
    shortName: 'Copa Sudamericana',
    icon: '🌎',
    country: 'Sudamérica',
    isInternational: true,
  },
  LMX: {
    code: 'LMX',
    name: 'Liga BBVA MX',
    shortName: 'Liga MX',
    icon: '🇲🇽',
    country: 'México',
    isInternational: false,
  },
  BRA: {
    code: 'BRA',
    name: 'Brasileirão Série A',
    shortName: 'Brasileirão',
    icon: '🇧🇷',
    country: 'Brasil',
    isInternational: false,
  },
  ARG: {
    code: 'ARG',
    name: 'Liga Profesional Argentina',
    shortName: 'Liga Argentina',
    icon: '🇦🇷',
    country: 'Argentina',
    isInternational: false,
  },
  POR: {
    code: 'POR',
    name: 'Primeira Liga',
    shortName: 'Primeira Liga',
    icon: '🇵🇹',
    country: 'Portugal',
    isInternational: false,
  },
  NED: {
    code: 'NED',
    name: 'Eredivisie',
    shortName: 'Eredivisie',
    icon: '🇳🇱',
    country: 'Países Bajos',
    isInternational: false,
  },
  MLS: {
    code: 'MLS',
    name: 'Major League Soccer',
    shortName: 'MLS',
    icon: '🇺🇸',
    country: 'Estados Unidos',
    isInternational: false,
  },
  TUR: {
    code: 'TUR',
    name: 'Süper Lig Turquía',
    shortName: 'Süper Lig',
    icon: '🇹🇷',
    country: 'Turquía',
    isInternational: false,
  },
  BEL: {
    code: 'BEL',
    name: 'Pro League Bélgica',
    shortName: 'Pro League',
    icon: '🇧🇪',
    country: 'Bélgica',
    isInternational: false,
  },
};

/**
 * Resolves the official flag or tournament trophy icon and clean name
 */
export function getLeagueMeta(leagueName?: string, leagueCode?: string): LeagueMeta {
  const code = (leagueCode || '').toUpperCase().trim();
  if (code && KNOWN_LEAGUES[code]) {
    return KNOWN_LEAGUES[code];
  }

  const name = (leagueName || '').toLowerCase().trim();

  if (name.includes('colombia') || name.includes('betplay') || name.includes('dimayor')) {
    return KNOWN_LEAGUES.COL;
  }
  if (name.includes('champions')) {
    return KNOWN_LEAGUES.UCL;
  }
  if (name.includes('premier') || name.includes('england') || name.includes('inglaterra')) {
    return KNOWN_LEAGUES.EPL;
  }
  if (name.includes('laliga') || name.includes('esp.1') || name.includes('españa')) {
    return KNOWN_LEAGUES.ESP;
  }
  if (name.includes('hypermotion') || name.includes('esp.2')) {
    return KNOWN_LEAGUES.ESP2;
  }
  if (name.includes('serie a') || name.includes('italia') || name.includes('ita.1')) {
    return KNOWN_LEAGUES.ITA;
  }
  if (name.includes('bundesliga') || name.includes('alemania') || name.includes('ger.1')) {
    return KNOWN_LEAGUES.GER;
  }
  if (name.includes('ligue 1') || name.includes('francia') || name.includes('fra.1')) {
    return KNOWN_LEAGUES.FRA;
  }
  if (name.includes('libertadores')) {
    return KNOWN_LEAGUES.LIB;
  }
  if (name.includes('sudamericana')) {
    return KNOWN_LEAGUES.SUD;
  }
  if (name.includes('europa league') || name.includes('uefa.europa')) {
    return KNOWN_LEAGUES.UEL;
  }
  if (name.includes('conference')) {
    return KNOWN_LEAGUES.UECL;
  }
  if (name.includes('mex') || name.includes('bbva')) {
    return KNOWN_LEAGUES.LMX;
  }
  if (name.includes('brasil') || name.includes('brasileir')) {
    return KNOWN_LEAGUES.BRA;
  }
  if (name.includes('argentina')) {
    return KNOWN_LEAGUES.ARG;
  }

  // Fallback
  return {
    code: code || 'LEAGUE',
    name: leagueName || 'Competición Oficial',
    shortName: leagueName || 'Competición',
    icon: '⚽',
    country: 'Fútbol',
    isInternational: false,
  };
}
