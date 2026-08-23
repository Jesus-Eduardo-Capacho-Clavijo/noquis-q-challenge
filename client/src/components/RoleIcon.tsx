import React from 'react';
import { LoLRole } from '../types';

interface RoleIconProps {
  role: LoLRole | 'ALL' | 'FILL';
  className?: string;
  size?: number;
}

export function getRoleIconUrl(role: LoLRole | 'ALL' | 'FILL'): string {
  switch (role) {
    case 'TOP':
      return 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-top.png';
    case 'JNG':
      return 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-jungle.png';
    case 'MID':
      return 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-middle.png';
    case 'ADC':
      return 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-bottom.png';
    case 'SUP':
      return 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-utility.png';
    case 'ALL':
    case 'FILL':
    default:
      return 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-fill.png';
  }
}

export const RoleIcon: React.FC<RoleIconProps> = ({ role, className = '', size = 20 }) => {
  const url = getRoleIconUrl(role);
  const roleName =
    role === 'TOP'
      ? 'Top'
      : role === 'JNG'
      ? 'Jungle'
      : role === 'MID'
      ? 'Mid'
      : role === 'ADC'
      ? 'ADC / Bot'
      : role === 'SUP'
      ? 'Support'
      : 'Todos';

  return (
    <img
      src={url}
      alt={roleName}
      title={roleName}
      width={size}
      height={size}
      className={`inline-block object-contain filter drop-shadow brightness-110 ${className}`}
      style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px` }}
      loading="lazy"
    />
  );
};
