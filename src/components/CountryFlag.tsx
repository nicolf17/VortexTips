import React from 'react';

interface CountryFlagProps {
  country?: string;
  leagueCode?: string;
  icon?: string;
  className?: string;
}

/**
 * High-fidelity, crisp SVG Country Flag renderer.
 * Guarantees 100% visible, vibrant national flags across all operating systems
 * (bypassing missing emoji flags in Windows / Linux fonts, especially England and Colombia).
 */
export const CountryFlag: React.FC<CountryFlagProps> = ({
  country = '',
  leagueCode = '',
  icon = '⚽',
  className = 'w-5 h-3.5',
}) => {
  const code = (leagueCode || '').toUpperCase().trim();
  const cName = (country || '').toLowerCase().trim();

  // England / Premier League
  if (code === 'EPL' || cName.includes('inglaterra') || cName.includes('england')) {
    return (
      <svg
        viewBox="0 0 50 30"
        className={`${className} rounded-xs shadow-xs shrink-0 border border-black/20`}
        role="img"
        aria-label="Inglaterra"
      >
        <title>Inglaterra</title>
        <rect width="50" height="30" fill="#FFFFFF" />
        <rect x="21" width="8" height="30" fill="#CF081F" />
        <rect y="11" width="50" height="8" fill="#CF081F" />
      </svg>
    );
  }

  // Colombia / Liga BetPlay
  if (code === 'COL' || cName.includes('colombia')) {
    return (
      <svg
        viewBox="0 0 50 30"
        className={`${className} rounded-xs shadow-xs shrink-0 border border-black/20`}
        role="img"
        aria-label="Colombia"
      >
        <title>Colombia</title>
        <rect width="50" height="15" fill="#FCD116" />
        <rect y="15" width="50" height="7.5" fill="#003893" />
        <rect y="22.5" width="50" height="7.5" fill="#CE1126" />
      </svg>
    );
  }

  // Spain / LaLiga
  if (code === 'ESP' || code === 'ESP2' || cName.includes('españa') || cName.includes('spain')) {
    return (
      <svg
        viewBox="0 0 50 30"
        className={`${className} rounded-xs shadow-xs shrink-0 border border-black/20`}
        role="img"
        aria-label="España"
      >
        <title>España</title>
        <rect width="50" height="7.5" fill="#AA151B" />
        <rect y="7.5" width="50" height="15" fill="#F1BF00" />
        <rect y="22.5" width="50" height="7.5" fill="#AA151B" />
        {/* Simplified Shield */}
        <circle cx="15" cy="15" r="3.2" fill="#AA151B" opacity="0.85" />
      </svg>
    );
  }

  // Italy / Serie A
  if (code === 'ITA' || cName.includes('italia') || cName.includes('italy')) {
    return (
      <svg
        viewBox="0 0 50 30"
        className={`${className} rounded-xs shadow-xs shrink-0 border border-black/20`}
        role="img"
        aria-label="Italia"
      >
        <title>Italia</title>
        <rect width="16.6" height="30" fill="#009246" />
        <rect x="16.6" width="16.8" height="30" fill="#FFFFFF" />
        <rect x="33.4" width="16.6" height="30" fill="#CE2B37" />
      </svg>
    );
  }

  // Germany / Bundesliga
  if (code === 'GER' || cName.includes('alemania') || cName.includes('germany')) {
    return (
      <svg
        viewBox="0 0 50 30"
        className={`${className} rounded-xs shadow-xs shrink-0 border border-black/20`}
        role="img"
        aria-label="Alemania"
      >
        <title>Alemania</title>
        <rect width="50" height="10" fill="#000000" />
        <rect y="10" width="50" height="10" fill="#DD0000" />
        <rect y="20" width="50" height="10" fill="#FFCE00" />
      </svg>
    );
  }

  // France / Ligue 1
  if (code === 'FRA' || cName.includes('francia') || cName.includes('france')) {
    return (
      <svg
        viewBox="0 0 50 30"
        className={`${className} rounded-xs shadow-xs shrink-0 border border-black/20`}
        role="img"
        aria-label="Francia"
      >
        <title>Francia</title>
        <rect width="16.6" height="30" fill="#002395" />
        <rect x="16.6" width="16.8" height="30" fill="#FFFFFF" />
        <rect x="33.4" width="16.6" height="30" fill="#ED2939" />
      </svg>
    );
  }

  // Mexico / Liga MX
  if (code === 'LMX' || cName.includes('mexico') || cName.includes('méxico')) {
    return (
      <svg
        viewBox="0 0 50 30"
        className={`${className} rounded-xs shadow-xs shrink-0 border border-black/20`}
        role="img"
        aria-label="México"
      >
        <title>México</title>
        <rect width="16.6" height="30" fill="#006847" />
        <rect x="16.6" width="16.8" height="30" fill="#FFFFFF" />
        <rect x="33.4" width="16.6" height="30" fill="#CE1126" />
        <circle cx="25" cy="15" r="2.5" fill="#8B5A2B" />
      </svg>
    );
  }

  // Argentina / Liga Profesional
  if (code === 'ARG' || cName.includes('argentina')) {
    return (
      <svg
        viewBox="0 0 50 30"
        className={`${className} rounded-xs shadow-xs shrink-0 border border-black/20`}
        role="img"
        aria-label="Argentina"
      >
        <title>Argentina</title>
        <rect width="50" height="10" fill="#75AADB" />
        <rect y="10" width="50" height="10" fill="#FFFFFF" />
        <rect y="20" width="50" height="10" fill="#75AADB" />
        <circle cx="25" cy="15" r="2.5" fill="#F6B40E" />
      </svg>
    );
  }

  // Brazil / Brasileirao
  if (code === 'BRA' || cName.includes('brasil') || cName.includes('brazil')) {
    return (
      <svg
        viewBox="0 0 50 30"
        className={`${className} rounded-xs shadow-xs shrink-0 border border-black/20`}
        role="img"
        aria-label="Brasil"
      >
        <title>Brasil</title>
        <rect width="50" height="30" fill="#009C3B" />
        <polygon points="25,4 45,15 25,26 5,15" fill="#FFDF00" />
        <circle cx="25" cy="15" r="5" fill="#002776" />
      </svg>
    );
  }

  // International: Champions League
  if (code === 'UCL' || cName.includes('champions')) {
    return (
      <span className="inline-flex items-center justify-center text-sm" title="Champions League">
        ⭐
      </span>
    );
  }

  // International: Libertadores / Cup
  if (code === 'LIB' || cName.includes('libertadores')) {
    return (
      <span className="inline-flex items-center justify-center text-sm" title="Copa Libertadores">
        🏆
      </span>
    );
  }

  // International: Europa League
  if (code === 'UEL' || cName.includes('europa league')) {
    return (
      <span className="inline-flex items-center justify-center text-sm" title="Europa League">
        🛡️
      </span>
    );
  }

  // Default fallback: display the unicode icon or soccer ball
  return (
    <span className="text-sm shrink-0 inline-flex items-center justify-center">
      {icon || '⚽'}
    </span>
  );
};
