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
    name: 'Liga de Campeones de la UEFA',
    shortName: 'Champions League',
    icon: '⭐',
    country: 'Europa',
    isInternational: true,
  },
  UEL: {
    code: 'UEL',
    name: 'Liga Europa de la UEFA',
    shortName: 'Europa League',
    icon: '🛡️',
    country: 'Europa',
    isInternational: true,
  },
  UECL: {
    code: 'UECL',
    name: 'Liga Conferencia de la UEFA',
    shortName: 'Conference League',
    icon: '🎖️',
    country: 'Europa',
    isInternational: true,
  },
  LIB: {
    code: 'LIB',
    name: 'Copa Libertadores',
    shortName: 'Copa Libertadores',
    icon: '🏆',
    country: 'Sudamérica',
    isInternational: true,
  },
  SUD: {
    code: 'SUD',
    name: 'Copa Sudamericana',
    shortName: 'Copa Sudamericana',
    icon: '🌎',
    country: 'Sudamérica',
    isInternational: true,
  },
  LMX: {
    code: 'LMX',
    name: 'Liga MX',
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
    name: 'Primeira Liga de Portugal',
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
    name: 'Major League Soccer (MLS)',
    shortName: 'MLS',
    icon: '🇺🇸',
    country: 'Estados Unidos',
    isInternational: false,
  },
  TUR: {
    code: 'TUR',
    name: 'Superliga de Turquía',
    shortName: 'Superliga',
    icon: '🇹🇷',
    country: 'Turquía',
    isInternational: false,
  },
  BEL: {
    code: 'BEL',
    name: 'Pro League de Bélgica',
    shortName: 'Pro League',
    icon: '🇧🇪',
    country: 'Bélgica',
    isInternational: false,
  },
  INT: { code: 'INT', name: 'Amistosos Internacionales', shortName: 'Amistosos', icon: '⚽', country: 'Selecciones', isInternational: true },
  UNL: { code: 'UNL', name: 'Liga de Naciones de la UEFA', shortName: 'Nations League', icon: '🇪🇺', country: 'Europa', isInternational: true },
  WCQ: { code: 'WCQ', name: 'Eliminatorias Copa del Mundo', shortName: 'Eliminatorias', icon: '🏆', country: 'FIFA', isInternational: true },
  COP: { code: 'COP', name: 'Copa América', shortName: 'Copa América', icon: '🌎', country: 'Sudamérica', isInternational: true },
  CNL: { code: 'CNL', name: 'Liga de Naciones de la CONCACAF', shortName: 'CONCACAF NL', icon: '🌎', country: 'Norteamérica', isInternational: true },
  AFCON: { code: 'AFCON', name: 'Copa Africana de Naciones', shortName: 'AFCON', icon: '🌍', country: 'África', isInternational: true },
  ACUP: { code: 'ACUP', name: 'Copa Asiática de la AFC', shortName: 'Copa Asiática', icon: '🌏', country: 'Asia', isInternational: true },
  SCO: { code: 'SCO', name: 'Premiership de Escocia', shortName: 'Escocia', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', country: 'Escocia', isInternational: false },
  GRE: { code: 'GRE', name: 'Superliga de Grecia', shortName: 'Grecia', icon: '🇬🇷', country: 'Grecia', isInternational: false },
  AUT: { code: 'AUT', name: 'Bundesliga de Austria', shortName: 'Austria', icon: '🇦🇹', country: 'Austria', isInternational: false },
  SUI: { code: 'SUI', name: 'Superliga de Suiza', shortName: 'Suiza', icon: '🇨🇭', country: 'Suiza', isInternational: false },
  DEN: { code: 'DEN', name: 'Superliga de Dinamarca', shortName: 'Dinamarca', icon: '🇩🇰', country: 'Dinamarca', isInternational: false },
  NOR: { code: 'NOR', name: 'Eliteserien de Noruega', shortName: 'Noruega', icon: '🇳🇴', country: 'Noruega', isInternational: false },
  SWE: { code: 'SWE', name: 'Allsvenskan de Suecia', shortName: 'Suecia', icon: '🇸🇪', country: 'Suecia', isInternational: false },
  POL: { code: 'POL', name: 'Ekstraklasa de Polonia', shortName: 'Polonia', icon: '🇵🇱', country: 'Polonia', isInternational: false },
  URU: { code: 'URU', name: 'Primera División de Uruguay', shortName: 'Uruguay', icon: '🇺🇾', country: 'Uruguay', isInternational: false },
  CHI: { code: 'CHI', name: 'Primera División de Chile', shortName: 'Chile', icon: '🇨🇱', country: 'Chile', isInternational: false },
  ECU: { code: 'ECU', name: 'LigaPro de Ecuador', shortName: 'Ecuador', icon: '🇪🇨', country: 'Ecuador', isInternational: false },
  PAR: { code: 'PAR', name: 'Primera División de Paraguay', shortName: 'Paraguay', icon: '🇵🇾', country: 'Paraguay', isInternational: false },
  PER: { code: 'PER', name: 'Liga 1 de Perú', shortName: 'Perú', icon: '🇵🇪', country: 'Perú', isInternational: false },
  REC: { code: 'REC', name: 'Recopa Sudamericana', shortName: 'Recopa', icon: '🛡️', country: 'Sudamérica', isInternational: true },
  KSA: { code: 'KSA', name: 'Liga Profesional Saudí', shortName: 'Saudi Pro', icon: '🇸🇦', country: 'Arabia Saudita', isInternational: false },
  JPN: { code: 'JPN', name: 'J1 League de Japón', shortName: 'J1 League', icon: '🇯🇵', country: 'Japón', isInternational: false },
  KOR: { code: 'KOR', name: 'K League 1 de Corea', shortName: 'K League', icon: '🇰🇷', country: 'Corea del Sur', isInternational: false },
  AUS: { code: 'AUS', name: 'A-League de Australia', shortName: 'A-League', icon: '🇦🇺', country: 'Australia', isInternational: false },
  EGY: { code: 'EGY', name: 'Premier League de Egipto', shortName: 'Egipto', icon: '🇪🇬', country: 'Egipto', isInternational: false },
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
  if (name.includes('nations league')) return KNOWN_LEAGUES.UNL;
  if (name.includes('friendly') || name.includes('amistoso')) return KNOWN_LEAGUES.INT;
  if (name.includes('world cup') || name.includes('qualifier') || name.includes('eliminar')) return KNOWN_LEAGUES.WCQ;
  if (name.includes('copa america') || name.includes('copa américa')) return KNOWN_LEAGUES.COP;
  if (name.includes('concacaf')) return KNOWN_LEAGUES.CNL;
  if (name.includes('africa') || name.includes('caf')) return KNOWN_LEAGUES.AFCON;
  if (name.includes('asian')) return KNOWN_LEAGUES.ACUP;
  if (name.includes('primeira') || name.includes('portugal')) return KNOWN_LEAGUES.POR;
  if (name.includes('eredivisie') || name.includes('netherlands')) return KNOWN_LEAGUES.NED;
  if (name.includes('süper lig') || name.includes('super lig') || name.includes('turkey')) return KNOWN_LEAGUES.TUR;
  if (name.includes('pro league') || name.includes('belgium')) return KNOWN_LEAGUES.BEL;
  if (name.includes('scotland') || name.includes('premiership')) return KNOWN_LEAGUES.SCO;
  if (name.includes('greece') || name.includes('super league gre')) return KNOWN_LEAGUES.GRE;
  if (name.includes('austria')) return KNOWN_LEAGUES.AUT;
  if (name.includes('switzerland') || name.includes('super league sui')) return KNOWN_LEAGUES.SUI;
  if (name.includes('denmark')) return KNOWN_LEAGUES.DEN;
  if (name.includes('norway')) return KNOWN_LEAGUES.NOR;
  if (name.includes('sweden')) return KNOWN_LEAGUES.SWE;
  if (name.includes('poland')) return KNOWN_LEAGUES.POL;
  if (name.includes('championship')) return { code: 'EFL', name: 'EFL Championship', shortName: 'Championship', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'Inglaterra', isInternational: false };
  if (name.includes('uruguay')) return KNOWN_LEAGUES.URU;
  if (name.includes('chile')) return KNOWN_LEAGUES.CHI;
  if (name.includes('ecuador')) return KNOWN_LEAGUES.ECU;
  if (name.includes('paraguay')) return KNOWN_LEAGUES.PAR;
  if (name.includes('peru') || name.includes('perú')) return KNOWN_LEAGUES.PER;
  if (name.includes('recopa')) return KNOWN_LEAGUES.REC;
  if (name.includes('saudi') || name.includes('saudí')) return KNOWN_LEAGUES.KSA;
  if (name.includes('japan') || name.includes('j1 league')) return KNOWN_LEAGUES.JPN;
  if (name.includes('korea') || name.includes('k league')) return KNOWN_LEAGUES.KOR;
  if (name.includes('australia') || name.includes('a-league')) return KNOWN_LEAGUES.AUS;
  if (name.includes('egypt') || name.includes('egipto')) return KNOWN_LEAGUES.EGY;

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
