// Centralized Spanish localization for football teams, national selections, and market labels.
// Preserves original internal ESPN names and IDs intact — used strictly at presentation & search layers.

/**
 * Normalizes a team name for case-insensitive, accent-insensitive, punctuation-tolerant matching.
 */
export function normalizeTeamKey(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[-_/.,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Comprehensive dictionary of FIFA/UEFA/CONMEBOL/CONCACAF/CAF/AFC/OFC National Teams
 * and ESPN/English variants mapped to standard Spanish names.
 */
const NATIONAL_TEAMS_ES: Record<string, string> = {
  // Europe (UEFA)
  'albania': 'Albania',
  'andorra': 'Andorra',
  'armenia': 'Armenia',
  'austria': 'Austria',
  'azerbaijan': 'Azerbaiyán',
  'belarus': 'Bielorrusia',
  'belgium': 'Bélgica',
  'bosnia and herzegovina': 'Bosnia y Herzegovina',
  'bosnia herzegovina': 'Bosnia y Herzegovina',
  'bosnia': 'Bosnia y Herzegovina',
  'bulgaria': 'Bulgaria',
  'croatia': 'Croacia',
  'cyprus': 'Chipre',
  'czechia': 'Chequia',
  'czech republic': 'Chequia',
  'denmark': 'Dinamarca',
  'england': 'Inglaterra',
  'estonia': 'Estonia',
  'faroe islands': 'Islas Feroe',
  'finland': 'Finlandia',
  'france': 'Francia',
  'georgia': 'Georgia',
  'germany': 'Alemania',
  'gibraltar': 'Gibraltar',
  'greece': 'Grecia',
  'hungary': 'Hungría',
  'iceland': 'Islandia',
  'ireland': 'Irlanda',
  'republic of ireland': 'Irlanda',
  'israel': 'Israel',
  'italy': 'Italia',
  'kazakhstan': 'Kazajistán',
  'kosovo': 'Kosovo',
  'latvia': 'Letonia',
  'liechtenstein': 'Liechtenstein',
  'lithuania': 'Lituania',
  'luxembourg': 'Luxemburgo',
  'malta': 'Malta',
  'moldova': 'Moldavia',
  'monaco': 'Mónaco',
  'montenegro': 'Montenegro',
  'netherlands': 'Países Bajos',
  'holland': 'Países Bajos',
  'north macedonia': 'Macedonia del Norte',
  'fyr macedonia': 'Macedonia del Norte',
  'northern ireland': 'Irlanda del Norte',
  'norway': 'Noruega',
  'poland': 'Polonia',
  'portugal': 'Portugal',
  'romania': 'Rumania',
  'russia': 'Rusia',
  'san marino': 'San Marino',
  'scotland': 'Escocia',
  'serbia': 'Serbia',
  'slovakia': 'Eslovaquia',
  'slovenia': 'Eslovenia',
  'spain': 'España',
  'sweden': 'Suecia',
  'switzerland': 'Suiza',
  'turkiye': 'Turquía',
  'turkey': 'Turquía',
  'ukraine': 'Ucrania',
  'wales': 'Gales',

  // South America (CONMEBOL)
  'argentina': 'Argentina',
  'bolivia': 'Bolivia',
  'brazil': 'Brasil',
  'chile': 'Chile',
  'colombia': 'Colombia',
  'ecuador': 'Ecuador',
  'paraguay': 'Paraguay',
  'peru': 'Perú',
  'uruguay': 'Uruguay',
  'venezuela': 'Venezuela',

  // North, Central America & Caribbean (CONCACAF)
  'anguilla': 'Anguila',
  'antigua and barbuda': 'Antigua y Barbuda',
  'aruba': 'Aruba',
  'bahamas': 'Bahamas',
  'barbados': 'Barbados',
  'belize': 'Belice',
  'bermuda': 'Bermudas',
  'bonaire': 'Bonaire',
  'british virgin islands': 'Islas Vírgenes Británicas',
  'canada': 'Canadá',
  'cayman islands': 'Islas Caimán',
  'costa rica': 'Costa Rica',
  'cuba': 'Cuba',
  'curacao': 'Curazao',
  'dominica': 'Dominica',
  'dominican republic': 'República Dominicana',
  'el salvador': 'El Salvador',
  'french guiana': 'Guayana Francesa',
  'grenada': 'Granada',
  'guadeloupe': 'Guadalupe',
  'guatemala': 'Guatemala',
  'guyana': 'Guyana',
  'haiti': 'Haití',
  'honduras': 'Honduras',
  'jamaica': 'Jamaica',
  'martinique': 'Martinica',
  'mexico': 'México',
  'montserrat': 'Montserrat',
  'nicaragua': 'Nicaragua',
  'panama': 'Panamá',
  'puerto rico': 'Puerto Rico',
  'saint kitts and nevis': 'San Cristóbal y Nieves',
  'st kitts and nevis': 'San Cristóbal y Nieves',
  'saint lucia': 'Santa Lucía',
  'st lucia': 'Santa Lucía',
  'saint martin': 'San Martín',
  'saint vincent and the grenadines': 'San Vicente y las Granadinas',
  'st vincent and the grenadines': 'San Vicente y las Granadinas',
  'sint maarten': 'Sint Maarten',
  'suriname': 'Surinam',
  'trinidad and tobago': 'Trinidad y Tobago',
  'turks and caicos islands': 'Islas Turcas y Caicos',
  'united states': 'Estados Unidos',
  'usa': 'Estados Unidos',
  'us virgin islands': 'Islas Vírgenes de EE. UU.',

  // Africa (CAF)
  'algeria': 'Argelia',
  'angola': 'Angola',
  'benin': 'Benín',
  'botswana': 'Botsuana',
  'burkina faso': 'Burkina Faso',
  'burundi': 'Burundi',
  'cabo verde': 'Cabo Verde',
  'cape verde': 'Cabo Verde',
  'cameroon': 'Camerún',
  'central african republic': 'República Centroafricana',
  'chad': 'Chad',
  'comoros': 'Comoras',
  'congo': 'Congo',
  'republic of the congo': 'República del Congo',
  'congo dr': 'RD del Congo',
  'dr congo': 'RD del Congo',
  'democratic republic of the congo': 'RD del Congo',
  'democratic republic of congo': 'RD del Congo',
  'cote divoire': 'Costa de Marfil',
  'cote d ivoire': 'Costa de Marfil',
  'ivory coast': 'Costa de Marfil',
  'djibouti': 'Yibuti',
  'egypt': 'Egipto',
  'equatorial guinea': 'Guinea Ecuatorial',
  'eritrea': 'Eritrea',
  'eswatini': 'Esuatini',
  'swaziland': 'Esuatini',
  'ethiopia': 'Etiopía',
  'gabon': 'Gabón',
  'gambia': 'Gambia',
  'the gambia': 'Gambia',
  'ghana': 'Ghana',
  'guinea': 'Guinea',
  'guinea bissau': 'Guinea-Bisáu',
  'kenya': 'Kenia',
  'lesotho': 'Lesoto',
  'liberia': 'Liberia',
  'libya': 'Libia',
  'madagascar': 'Madagascar',
  'malawi': 'Malaui',
  'mali': 'Malí',
  'mauritania': 'Mauritania',
  'mauritius': 'Mauricio',
  'morocco': 'Marruecos',
  'mozambique': 'Mozambique',
  'namibia': 'Namibia',
  'niger': 'Níger',
  'nigeria': 'Nigeria',
  'reunion': 'Reunión',
  'rwanda': 'Ruanda',
  'sao tome and principe': 'Santo Tomé y Príncipe',
  'senegal': 'Senegal',
  'seychelles': 'Seychelles',
  'sierra leone': 'Sierra Leona',
  'somalia': 'Somalia',
  'south africa': 'Sudáfrica',
  'south sudan': 'Sudán del Sur',
  'sudan': 'Sudán',
  'tanzania': 'Tanzania',
  'togo': 'Togo',
  'tunisia': 'Túnez',
  'uganda': 'Uganda',
  'zambia': 'Zambia',
  'zanzibar': 'Zanzíbar',
  'zimbabwe': 'Zimbabue',

  // Asia (AFC)
  'afghanistan': 'Afganistán',
  'bahrain': 'Baréin',
  'bangladesh': 'Bangladés',
  'bhutan': 'Bután',
  'brunei': 'Brunéi',
  'brunei darussalam': 'Brunéi',
  'cambodia': 'Camboya',
  'china': 'China',
  'china pr': 'China',
  'chinese taipei': 'China Taipéi',
  'taiwan': 'China Taipéi',
  'guam': 'Guam',
  'hong kong': 'Hong Kong',
  'india': 'India',
  'indonesia': 'Indonesia',
  'iran': 'Irán',
  'ir iran': 'Irán',
  'iraq': 'Irak',
  'japan': 'Japón',
  'jordan': 'Jordania',
  'korea dpr': 'Corea del Norte',
  'north korea': 'Corea del Norte',
  'korea republic': 'Corea del Sur',
  'south korea': 'Corea del Sur',
  'kuwait': 'Kuwait',
  'kyrgyz republic': 'Kirguistán',
  'kyrgyzstan': 'Kirguistán',
  'laos': 'Laos',
  'lebanon': 'Líbano',
  'macau': 'Macao',
  'macao': 'Macao',
  'malaysia': 'Malasia',
  'maldives': 'Maldivas',
  'mongolia': 'Mongolia',
  'myanmar': 'Birmania',
  'nepal': 'Nepal',
  'northern mariana islands': 'Islas Marianas del Norte',
  'oman': 'Omán',
  'pakistan': 'Pakistán',
  'palestine': 'Palestina',
  'philippines': 'Filipinas',
  'qatar': 'Catar',
  'saudi arabia': 'Arabia Saudita',
  'singapore': 'Singapur',
  'sri lanka': 'Sri Lanka',
  'syria': 'Siria',
  'tajikistan': 'Tayikistán',
  'thailand': 'Tailandia',
  'timor leste': 'Timor Oriental',
  'east timor': 'Timor Oriental',
  'turkmenistan': 'Turkmenistán',
  'united arab emirates': 'Emiratos Árabes Unidos',
  'uae': 'Emiratos Árabes Unidos',
  'uzbekistan': 'Uzbekistán',
  'vietnam': 'Vietnam',
  'yemen': 'Yemen',

  // Oceania (OFC)
  'american samoa': 'Samoa Americana',
  'cook islands': 'Islas Cook',
  'fiji': 'Fiyi',
  'new caledonia': 'Nueva Caledonia',
  'new zealand': 'Nueva Zelanda',
  'papua new guinea': 'Papúa Nueva Guinea',
  'samoa': 'Samoa',
  'solomon islands': 'Islas Salomón',
  'tahiti': 'Tahití',
  'tonga': 'Tonga',
  'vanuatu': 'Vanuatu',
};

/**
 * Club exonyms and English-to-Spanish club translations across European,
 * South American, North American, and Asian leagues.
 */
const CLUB_NAMES_ES: Record<string, string> = {
  // Germany
  'bayern munich': 'Bayern Múnich',
  'fc bayern munich': 'Bayern Múnich',
  'fc bayern munchen': 'Bayern Múnich',
  'eintracht frankfurt': 'Eintracht Fráncfort',
  '1 fc cologne': 'Colonia',
  'fc cologne': 'Colonia',
  '1 fc koln': 'Colonia',
  'borussia monchengladbach': 'Borussia Mönchengladbach',
  'sc freiburg': 'Friburgo',
  'hamburger sv': 'Hamburgo',
  '1 fc nuremberg': 'Núremberg',
  'fc nuremberg': 'Núremberg',
  'hannover 96': 'Hannover 96',

  // Italy
  'inter milan': 'Inter de Milán',
  'internazionale': 'Inter de Milán',
  'fc internazionale milano': 'Inter de Milán',
  'ac milan': 'Milan',
  'as roma': 'Roma',
  'ss lazio': 'Lazio',
  'ssc napoli': 'Nápoles',

  // France
  'olympique marseille': 'Olympique de Marsella',
  'olympique de marseille': 'Olympique de Marsella',
  'olympique lyonnais': 'Olympique de Lyon',
  'lyon': 'Olympique de Lyon',
  'as monaco': 'Mónaco',
  'ogc nice': 'Niza',
  'nice': 'Niza',
  'rc strasbourg': 'Estrasburgo',
  'strasbourg': 'Estrasburgo',
  'rc strasbourg alsace': 'Estrasburgo',
  'stade rennais': 'Rennes',
  'stade brestois': 'Brest',
  'as saint etienne': 'Saint-Étienne',
  'saint etienne': 'Saint-Étienne',

  // Spain
  'atletico madrid': 'Atlético de Madrid',
  'athletic bilbao': 'Athletic Club',
  'deportivo la coruna': 'Deportivo La Coruña',
  'sporting gijon': 'Sporting de Gijón',

  // Portugal
  'sporting cp': 'Sporting de Lisboa',
  'sporting lisbon': 'Sporting de Lisboa',
  'fc porto': 'Oporto',
  'sl benfica': 'Benfica',
  'vitoria guimaraes': 'Vitória Guimarães',
  'vitoria sc': 'Vitória Guimarães',

  // Netherlands & Belgium
  'club brugge': 'Club Brujas',
  'club brugge kv': 'Club Brujas',
  'cercle brugge': 'Círculo de Brujas',
  'royal antwerp': 'Amberes',
  'antwerp': 'Amberes',
  'standard liege': 'Standard de Lieja',
  'kaa gent': 'Gante',
  'gent': 'Gante',
  'union saint gilloise': 'Union Saint-Gilloise',
  'royale union saint gilloise': 'Union Saint-Gilloise',
  'feyenoord rotterdam': 'Feyenoord',
  'ajax amsterdam': 'Ajax',
  'az alkmaar': 'AZ Alkmaar',
  'fc twente': 'Twente',
  'fc utrecht': 'Utrecht',

  // Austria & Switzerland
  'red bull salzburg': 'RB Salzburgo',
  'fc salzburg': 'RB Salzburgo',
  'rapid vienna': 'Rapid Viena',
  'sk rapid vienna': 'Rapid Viena',
  'austria vienna': 'Austria Viena',
  'fk austria vienna': 'Austria Viena',
  'fc basel': 'Basilea',
  'fc zurich': 'Zúrich',
  'bsc young boys': 'Young Boys',
  'fc luzern': 'Lucerna',
  'fc st gallen': 'San Galo',

  // Czechia, Poland, Serbia, Croatia, Ukraine, Russia, Greece, Romania, Hungary, Turkey, Denmark
  'sparta prague': 'Sparta Praga',
  'ac sparta prague': 'Sparta Praga',
  'slavia prague': 'Slavia Praga',
  'sk slavia prague': 'Slavia Praga',
  'viktoria plzen': 'Viktoria Pilsen',
  'fc viktoria plzen': 'Viktoria Pilsen',
  'legia warsaw': 'Legia Varsovia',
  'wisla krakow': 'Wisla Cracovia',
  'cracovia': 'Cracovia',
  'red star belgrade': 'Estrella Roja',
  'crvena zvezda': 'Estrella Roja',
  'fk crvena zvezda': 'Estrella Roja',
  'partizan belgrade': 'Partizán de Belgrado',
  'dinamo zagreb': 'Dinamo de Zagreb',
  'hajduk split': 'Hajduk Split',
  'dynamo kyiv': 'Dinamo de Kiev',
  'fc dynamo kyiv': 'Dinamo de Kiev',
  'cska moscow': 'CSKA Moscú',
  'spartak moscow': 'Spartak Moscú',
  'lokomotiv moscow': 'Lokomotiv Moscú',
  'dynamo moscow': 'Dinamo Moscú',
  'zenit st petersburg': 'Zenit San Petersburgo',
  'zenit saint petersburg': 'Zenit San Petersburgo',
  'krasnodar': 'Krasnodar',
  'aek athens': 'AEK Atenas',
  'olympiacos': 'Olympiacos',
  'olympiakos': 'Olympiacos',
  'aris thessaloniki': 'Aris Salónica',
  'paok thessaloniki': 'PAOK Salónica',
  'steaua bucharest': 'Steaua de Bucarest',
  'rapid bucharest': 'Rapid de Bucarest',
  'dinamo bucharest': 'Dinamo de Bucarest',
  'ferencvaros': 'Ferencváros',
  'fc copenhagen': 'FC Copenhague',
  'copenhagen': 'Copenhague',
  'besiktas': 'Beşiktaş',
  'fenerbahce': 'Fenerbahçe',
  'istanbul basaksehir': 'İstanbul Başakşehir',

  // Scotland & England (keep authentic English club names; only localize ambiguous/common suffixes if needed)
  'glasgow rangers': 'Rangers',
  'celtic glasgow': 'Celtic',
  'hearts': 'Hearts',
  'heart of midlothian': 'Hearts',

  // Americas & Middle East / Asia
  'new york city fc': 'New York City',
  'atletico mg': 'Atlético Mineiro',
  'atletico mineiro': 'Atlético Mineiro',
  'athletico paranaense': 'Athletico Paranaense',
  'central espanol futbol club': 'Central Español',
  'alianza fc': 'Alianza FC',
  'internacional de bogota': 'Internacional de Bogotá',
};

const COMBINED_TEAMS_ES: Record<string, string> = {
  ...NATIONAL_TEAMS_ES,
  ...CLUB_NAMES_ES,
};

/**
 * Translates any team or national selection name to Spanish while preserving
 * authentic proper nouns that do not have a distinct Spanish exonym.
 * Handles youth/women suffixes (e.g., "England U21" -> "Inglaterra Sub-21",
 * "France Women" -> "Francia Femenino").
 */
export function getLocalizedTeamName(rawName?: string | null): string {
  if (!rawName) return '';
  const trimmed = rawName.trim();
  if (!trimmed) return '';

  const directKey = normalizeTeamKey(trimmed);
  if (COMBINED_TEAMS_ES[directKey]) {
    return COMBINED_TEAMS_ES[directKey];
  }

  // Handle common age-group / gender suffixes from ESPN (U23, U21, U20, U19, U17, Women, (W))
  const suffixPatterns: Array<{ regex: RegExp; mapSuffix: (m: RegExpMatchArray) => string }> = [
    {
      regex: /^(.*?)\s+(?:U-?(\d{2}))$/i,
      mapSuffix: (m) => `Sub-${m[2]}`,
    },
    {
      regex: /^(.*?)\s+(?:\(W\)|Women|Femenino|Fem\.?)$/i,
      mapSuffix: () => 'Femenino',
    },
    {
      regex: /^(.*?)\s+(?:II|B)$/i,
      mapSuffix: (m) => m[0].trim().split(/\s+/).pop() || 'B',
    },
  ];

  for (const { regex, mapSuffix } of suffixPatterns) {
    const match = trimmed.match(regex);
    if (match && match[1]) {
      const baseKey = normalizeTeamKey(match[1]);
      const baseTranslated = COMBINED_TEAMS_ES[baseKey];
      if (baseTranslated) {
        return `${baseTranslated} ${mapSuffix(match)}`;
      }
    }
  }

  return trimmed;
}

/**
 * Localizes a team short name / abbreviation.
 * Preserves 2-4 uppercase FIFA/club codes (e.g. ENG, BEL, UZB, PSG) unless
 * the shortName is actually a full/partial English team name.
 */
export function getLocalizedShortTeamName(
  fullName?: string | null,
  shortName?: string | null
): string {
  const localizedFull = getLocalizedTeamName(fullName);
  if (!shortName) {
    return localizedFull.split(' ')[0] || '';
  }

  const trimmedShort = shortName.trim();
  const shortKey = normalizeTeamKey(trimmedShort);

  if (COMBINED_TEAMS_ES[shortKey]) {
    return COMBINED_TEAMS_ES[shortKey];
  }

  // If shortName is an abbreviation (e.g. "ENG", "BEL", "MCI"), keep it as a compact badge code,
  // unless it looks like a full word (>4 chars) that should fall back to localized name.
  if (/^[A-Z0-9]{2,4}$/.test(trimmedShort)) {
    return trimmedShort;
  }

  return getLocalizedTeamName(trimmedShort) || localizedFull.split(' ')[0] || '';
}

/**
 * Localizes market/selection phrases that embed a team name (e.g. "Victoria England" -> "Victoria Inglaterra").
 */
export function getLocalizedMarketText(text?: string | null): string {
  if (!text) return '';
  const trimmed = text.trim();

  const prefixes = ['Victoria ', 'Gana ', 'Win ', 'Draw or '];
  for (const prefix of prefixes) {
    if (trimmed.toLowerCase().startsWith(prefix.toLowerCase())) {
      const rest = trimmed.slice(prefix.length).trim();
      const localizedPrefix = prefix === 'Win ' ? 'Victoria ' : prefix;
      return `${localizedPrefix}${getLocalizedTeamName(rest)}`;
    }
  }

  return getLocalizedTeamName(trimmed);
}

/**
 * Checks whether a match or team text matches a user search query in either its
 * original ESPN name or its Spanish localized name (accent-insensitive).
 */
export function matchesTeamSearchQuery(
  rawTeamName: string | undefined | null,
  query: string,
  shortName?: string | null
): boolean {
  const q = normalizeTeamKey(query);
  if (!q) return true;

  const rawNorm = normalizeTeamKey(rawTeamName || '');
  const locNorm = normalizeTeamKey(getLocalizedTeamName(rawTeamName));
  const shortNorm = normalizeTeamKey(shortName || '');

  return rawNorm.includes(q) || locNorm.includes(q) || shortNorm.includes(q);
}
