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
  EFL: {
    code: 'EFL',
    name: 'Championship Inglaterra',
    shortName: 'Championship',
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
  INT: { code: 'INT', name: 'Amistosos Internacionales', shortName: 'Amistosos', icon: '⚽', country: 'Selecciones', isInternational: true },
  UNL: { code: 'UNL', name: 'UEFA Nations League', shortName: 'Nations League', icon: '🇪🇺', country: 'Europa', isInternational: true },
  WCQ: { code: 'WCQ', name: 'Eliminatorias Mundial / FIFA', shortName: 'Eliminatorias', icon: '🏆', country: 'FIFA', isInternational: true },
  COP: { code: 'COP', name: 'Copa América', shortName: 'Copa América', icon: '🌎', country: 'Sudamérica', isInternational: true },
  CNL: { code: 'CNL', name: 'CONCACAF Nations League', shortName: 'CONCACAF NL', icon: '🌎', country: 'Norteamérica', isInternational: true },
  AFCON: { code: 'AFCON', name: 'Copa Africana de Naciones', shortName: 'AFCON', icon: '🌍', country: 'África', isInternational: true },
  ACUP: { code: 'ACUP', name: 'Copa Asiática AFC', shortName: 'Copa Asiática', icon: '🌏', country: 'Asia', isInternational: true },
  SCO: { code: 'SCO', name: 'Premiership Escocia', shortName: 'Escocia', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', country: 'Escocia', isInternational: false },
  GRE: { code: 'GRE', name: 'Super League Grecia', shortName: 'Grecia', icon: '🇬🇷', country: 'Grecia', isInternational: false },
  AUT: { code: 'AUT', name: 'Bundesliga Austria', shortName: 'Austria', icon: '🇦🇹', country: 'Austria', isInternational: false },
  SUI: { code: 'SUI', name: 'Super League Suiza', shortName: 'Suiza', icon: '🇨🇭', country: 'Suiza', isInternational: false },
  DEN: { code: 'DEN', name: 'Superliga Dinamarca', shortName: 'Dinamarca', icon: '🇩🇰', country: 'Dinamarca', isInternational: false },
  NOR: { code: 'NOR', name: 'Eliteserien Noruega', shortName: 'Noruega', icon: '🇳🇴', country: 'Noruega', isInternational: false },
  SWE: { code: 'SWE', name: 'Allsvenskan Suecia', shortName: 'Suecia', icon: '🇸🇪', country: 'Suecia', isInternational: false },
  POL: { code: 'POL', name: 'Ekstraklasa Polonia', shortName: 'Polonia', icon: '🇵🇱', country: 'Polonia', isInternational: false },
  URU: { code: 'URU', name: 'Primera División Uruguay', shortName: 'Uruguay', icon: '🇺🇾', country: 'Uruguay', isInternational: false },
  CHI: { code: 'CHI', name: 'Primera División Chile', shortName: 'Chile', icon: '🇨🇱', country: 'Chile', isInternational: false },
  ECU: { code: 'ECU', name: 'LigaPro Ecuador', shortName: 'Ecuador', icon: '🇪🇨', country: 'Ecuador', isInternational: false },
  PAR: { code: 'PAR', name: 'Primera División Paraguay', shortName: 'Paraguay', icon: '🇵🇾', country: 'Paraguay', isInternational: false },
  PER: { code: 'PER', name: 'Liga 1 Perú', shortName: 'Perú', icon: '🇵🇪', country: 'Perú', isInternational: false },
  REC: { code: 'REC', name: 'Recopa Sudamericana', shortName: 'Recopa', icon: '🛡️', country: 'Sudamérica', isInternational: true },
  KSA: { code: 'KSA', name: 'Saudi Pro League', shortName: 'Saudi Pro', icon: '🇸🇦', country: 'Arabia Saudita', isInternational: false },
  JPN: { code: 'JPN', name: 'J1 League Japón', shortName: 'J1 League', icon: '🇯🇵', country: 'Japón', isInternational: false },
  KOR: { code: 'KOR', name: 'K League 1 Corea', shortName: 'K League', icon: '🇰🇷', country: 'Corea del Sur', isInternational: false },
  AUS: { code: 'AUS', name: 'A-League Australia', shortName: 'A-League', icon: '🇦🇺', country: 'Australia', isInternational: false },
  EGY: { code: 'EGY', name: 'Premier League Egipto', shortName: 'Egipto', icon: '🇪🇬', country: 'Egipto', isInternational: false },
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
  if (name.includes('uefa nations') || name.includes('nations league')) {
    return name.includes('concacaf') ? KNOWN_LEAGUES.CNL : KNOWN_LEAGUES.UNL;
  }
  if (name.includes('friendly') || name.includes('amistoso')) {
    return KNOWN_LEAGUES.INT;
  }
  if (name.includes('world cup') || name.includes('eliminatoria') || name.includes('qualif')) {
    return KNOWN_LEAGUES.WCQ;
  }
  if (name.includes('championship')) {
    return KNOWN_LEAGUES.EFL;
  }
  if (name.includes('eredivisie')) {
    return KNOWN_LEAGUES.NED;
  }
  if (name.includes('primeira')) {
    return KNOWN_LEAGUES.POR;
  }
  if (name.includes('pro league') || name.includes('bélgica') || name.includes('belgium')) {
    return KNOWN_LEAGUES.BEL;
  }
  if (name.includes('süper lig') || name.includes('super lig') || name.includes('turquía') || name.includes('turkey')) {
    return KNOWN_LEAGUES.TUR;
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
