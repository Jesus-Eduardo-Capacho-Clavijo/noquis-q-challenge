import React, { useState } from 'react';
import { getProfileIconUrl, getCountryFlagUrl } from '../data/ddragon';

interface PlayerAvatarProps {
  profileIconId?: number;
  avatarUrl?: string;
  countryCode?: string;
  displayName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showFlag?: boolean;
  className?: string;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  profileIconId = 29,
  avatarUrl,
  countryCode = 'es',
  displayName = 'Player',
  size = 'md',
  showFlag = true,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);
  const hasCustomAvatar = Boolean(avatarUrl && avatarUrl.trim() && !imageError);

  // Sizing configurations - both icons get the EXACT same dimensions
  const config = {
    sm: {
      boxSize: 'w-8 h-8 rounded-lg',
      flagSize: 'w-3.5 h-2.5',
      gap: 'gap-1.5',
    },
    md: {
      boxSize: 'w-10 h-10 rounded-xl',
      flagSize: 'w-4 h-3',
      gap: 'gap-2',
    },
    lg: {
      boxSize: 'w-14 h-14 rounded-2xl',
      flagSize: 'w-5 h-3.5',
      gap: 'gap-2.5',
    },
    xl: {
      boxSize: 'w-16 h-16 rounded-2xl',
      flagSize: 'w-5.5 h-4',
      gap: 'gap-3',
    },
  }[size];

  if (hasCustomAvatar) {
    return (
      <div className={`inline-flex items-center ${config.gap} shrink-0 ${className}`}>
        {/* 1. Custom Avatar / Photo (Same Size) */}
        <div className={`relative shrink-0 overflow-hidden ${config.boxSize} border-2 border-cyan-400/90 shadow-neon-cyan bg-[#0a0f1d]`}>
          <img
            src={avatarUrl}
            alt={`Foto de ${displayName}`}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
            title={`Foto personalizada: ${displayName}`}
          />
        </div>

        {/* 2. Official LoL Summoner Icon (Same Size) with Flag */}
        <div className={`relative shrink-0 ${config.boxSize}`}>
          <img
            src={getProfileIconUrl(profileIconId)}
            alt={`Icono LoL de ${displayName}`}
            onError={(e) => {
              e.currentTarget.src = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/29.jpg';
            }}
            className="w-full h-full object-cover rounded-inherit border border-slate-700 bg-slate-900 shadow-md"
            title={`Icono de Invocador LoL: ${displayName}`}
          />
          {showFlag && countryCode && (
            <img
              src={getCountryFlagUrl(countryCode)}
              alt={countryCode}
              className={`absolute -bottom-1 -right-1 ${config.flagSize} rounded shadow object-cover border border-slate-950`}
              title={`País: ${countryCode.toUpperCase()}`}
            />
          )}
        </div>
      </div>
    );
  }

  // Fallback: Standard LoL Summoner Profile Icon with Flag
  return (
    <div className={`relative shrink-0 ${config.boxSize} ${className}`}>
      <img
        src={getProfileIconUrl(profileIconId)}
        alt={displayName}
        onError={(e) => {
          e.currentTarget.src = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/29.jpg';
        }}
        className="w-full h-full rounded-inherit border border-slate-700 object-cover bg-slate-900 shadow-md"
        title={`Icono de Invocador de ${displayName}`}
      />
      {showFlag && countryCode && (
        <img
          src={getCountryFlagUrl(countryCode)}
          alt={countryCode}
          className={`absolute -bottom-1 -right-1 ${config.flagSize} rounded shadow object-cover border border-slate-950`}
          title={`País: ${countryCode.toUpperCase()}`}
        />
      )}
    </div>
  );
};
