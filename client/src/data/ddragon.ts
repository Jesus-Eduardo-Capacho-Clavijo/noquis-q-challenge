import { LoLTier, RegionRouting } from '../types';

export const DDRAGON_VERSION = '16.16.1';

export function getProfileIconUrl(iconId?: number): string {
  const id = iconId && iconId > 0 ? iconId : 29;
  return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${id}.jpg`;
}

export const CHAMPION_NAME_MAP: Record<string, string> = {
  MonkeyKing: 'Wukong',
  monkeyking: 'Wukong',
  Chogath: "Cho'Gath",
  Kaisa: "Kai'Sa",
  Khazix: "Kha'Zix",
  KogMaw: "Kog'Maw",
  Leblanc: 'LeBlanc',
  RekSai: "Rek'Sai",
  Velkoz: "Vel'Koz",
  KSante: "K'Sante",
  Belveth: "Bel'Veth",
  DrMundo: 'Dr. Mundo',
  JarvanIV: 'Jarvan IV',
  MasterYi: 'Maestro Yi',
  MissFortune: 'Miss Fortune',
  TahmKench: 'Tahm Kench',
  TwistedFate: 'Twisted Fate',
  AurelionSol: 'Aurelion Sol',
  XinZhao: 'Xin Zhao',
  LeeSin: 'Lee Sin',
  Renata: 'Renata Glasc',
  Nunu: 'Nunu y Willump',
};

export const CHAMPION_DDRAGON_KEY_MAP: Record<string, string> = {
  Wukong: 'MonkeyKing',
  wukong: 'MonkeyKing',
  "Cho'Gath": 'Chogath',
  "chogath": 'Chogath',
  "Kai'Sa": 'Kaisa',
  "kaisa": 'Kaisa',
  "Kha'Zix": 'Khazix',
  "khazix": 'Khazix',
  "Kog'Maw": 'KogMaw',
  "kogmaw": 'KogMaw',
  "Rek'Sai": 'RekSai',
  "reksai": 'RekSai',
  "Vel'Koz": 'Velkoz',
  "velkoz": 'Velkoz',
  "K'Sante": 'KSante',
  "ksante": 'KSante',
  "Bel'Veth": 'Belveth',
  "belveth": 'Belveth',
  'Dr. Mundo': 'DrMundo',
  'Dr Mundo': 'DrMundo',
  'drmundo': 'DrMundo',
  'Jarvan IV': 'JarvanIV',
  'jarvaniv': 'JarvanIV',
  'Maestro Yi': 'MasterYi',
  'Master Yi': 'MasterYi',
  'masteryi': 'MasterYi',
  'Miss Fortune': 'MissFortune',
  'missfortune': 'MissFortune',
  'Tahm Kench': 'TahmKench',
  'tahmkench': 'TahmKench',
  'Twisted Fate': 'TwistedFate',
  'twistedfate': 'TwistedFate',
  'Aurelion Sol': 'AurelionSol',
  'aurelionsol': 'AurelionSol',
  'Xin Zhao': 'XinZhao',
  'xinzhao': 'XinZhao',
  'Lee Sin': 'LeeSin',
  'leesin': 'LeeSin',
  'Renata Glasc': 'Renata',
  'renataglasc': 'Renata',
  'Nunu y Willump': 'Nunu',
  'nunu': 'Nunu',
};

export function formatChampionName(name?: string): string {
  if (!name) return '';
  const trimmed = name.trim();
  if (CHAMPION_NAME_MAP[trimmed]) return CHAMPION_NAME_MAP[trimmed];
  
  const lower = trimmed.toLowerCase();
  for (const [rawKey, displayName] of Object.entries(CHAMPION_NAME_MAP)) {
    if (rawKey.toLowerCase() === lower) return displayName;
  }
  return trimmed;
}

export function getChampionIconUrl(championName: string): string {
  if (!championName) return 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Aatrox_0.jpg';
  
  const trimmed = championName.trim();
  const ddragonKey =
    CHAMPION_DDRAGON_KEY_MAP[trimmed] ||
    CHAMPION_DDRAGON_KEY_MAP[trimmed.toLowerCase()] ||
    trimmed.replace(/[^a-zA-Z0-9]/g, '');
    
  return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${ddragonKey}.png`;
}

export function getItemIconUrl(itemId: number): string {
  if (!itemId || itemId === 0) return '';
  return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/item/${itemId}.png`;
}

export function getCountryFlagUrl(countryCode: string = 'es'): string {
  const code = countryCode.toLowerCase();
  return `https://flagcdn.com/w40/${code}.png`;
}

export function getOpGgUrl(gameName: string, tagLine: string, region: RegionRouting): string {
  const regionMap: Record<string, string> = {
    la1: 'lan',
    la2: 'las',
    na1: 'na',
    euw1: 'euw',
    eun1: 'eune',
    kr: 'kr',
    br1: 'br',
    jp1: 'jp',
    oc1: 'oce',
  };
  const opRegion = regionMap[region] || 'lan';
  return `https://www.op.gg/summoners/${opRegion}/${encodeURIComponent(gameName)}-${encodeURIComponent(tagLine)}`;
}

export function getTierBadgeUrl(tier: LoLTier): string {
  const normalized = tier.toLowerCase();
  // We can use CommunityDragon or high quality Riot ranked crests
  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/ranked-emblem/wings_${normalized}.png`;
}

export function getTierColorClass(tier: LoLTier): { text: string; glow: string; badgeBg: string; border: string } {
  switch (tier) {
    case 'CHALLENGER':
      return {
        text: 'text-cyan-400 font-extrabold',
        glow: 'glow-challenger',
        badgeBg: 'bg-cyan-950/40 text-cyan-300 border-cyan-500/50',
        border: 'border-cyan-500/40',
      };
    case 'GRANDMASTER':
      return {
        text: 'text-red-500 font-extrabold',
        glow: 'glow-grandmaster',
        badgeBg: 'bg-red-950/40 text-red-300 border-red-500/50',
        border: 'border-red-500/40',
      };
    case 'MASTER':
      return {
        text: 'text-purple-400 font-extrabold',
        glow: 'glow-master',
        badgeBg: 'bg-purple-950/40 text-purple-300 border-purple-500/50',
        border: 'border-purple-500/40',
      };
    case 'DIAMOND':
      return {
        text: 'text-blue-400 font-bold',
        glow: 'glow-diamond',
        badgeBg: 'bg-blue-950/40 text-blue-300 border-blue-500/40',
        border: 'border-blue-500/30',
      };
    case 'EMERALD':
      return {
        text: 'text-emerald-400 font-bold',
        glow: 'glow-emerald',
        badgeBg: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40',
        border: 'border-emerald-500/30',
      };
    case 'PLATINUM':
      return {
        text: 'text-teal-400 font-bold',
        glow: '',
        badgeBg: 'bg-teal-950/40 text-teal-300 border-teal-500/30',
        border: 'border-teal-500/30',
      };
    case 'GOLD':
      return {
        text: 'text-amber-400 font-bold',
        glow: 'glow-gold',
        badgeBg: 'bg-amber-950/40 text-amber-300 border-amber-500/30',
        border: 'border-amber-500/30',
      };
    case 'SILVER':
      return {
        text: 'text-slate-300 font-semibold',
        glow: '',
        badgeBg: 'bg-slate-800/60 text-slate-300 border-slate-600/30',
        border: 'border-slate-600/30',
      };
    case 'BRONZE':
      return {
        text: 'text-amber-700 font-semibold',
        glow: '',
        badgeBg: 'bg-amber-950/30 text-amber-600 border-amber-800/30',
        border: 'border-amber-800/30',
      };
    case 'IRON':
      return {
        text: 'text-zinc-400 font-semibold',
        glow: '',
        badgeBg: 'bg-zinc-800/40 text-zinc-400 border-zinc-700/30',
        border: 'border-zinc-700/30',
      };
    default:
      return {
        text: 'text-gray-400',
        glow: '',
        badgeBg: 'bg-gray-800/40 text-gray-400 border-gray-700/30',
        border: 'border-gray-700/30',
      };
  }
}

const SPELL_MAP: Record<number, string> = {
  1: 'SummonerBoost',
  3: 'SummonerExhaust',
  4: 'SummonerFlash',
  6: 'SummonerHaste',
  7: 'SummonerHeal',
  11: 'SummonerSmite',
  12: 'SummonerTeleport',
  13: 'SummonerMana',
  14: 'SummonerDot',
  21: 'SummonerBarrier',
  32: 'SummonerSnowball',
};

export function getSpellIconUrl(spellId?: number): string {
  if (!spellId) return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/spell/SummonerFlash.png`;
  const name = SPELL_MAP[spellId] || 'SummonerFlash';
  return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/spell/${name}.png`;
}

export function getRuneIconUrl(runeId?: number): string {
  if (!runeId) return `https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/Conqueror/Conqueror.png`;
  // Riot/CommunityDragon CDN path for perks
  return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/${runeId}.png`;
}
