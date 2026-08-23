export type LoLRole = 'TOP' | 'JNG' | 'MID' | 'ADC' | 'SUP';

export type LoLTier =
  | 'CHALLENGER'
  | 'GRANDMASTER'
  | 'MASTER'
  | 'DIAMOND'
  | 'EMERALD'
  | 'PLATINUM'
  | 'GOLD'
  | 'SILVER'
  | 'BRONZE'
  | 'IRON'
  | 'UNRANKED';

export type LoLDivision = 'I' | 'II' | 'III' | 'IV' | '';

export type RegionRouting = 'la1' | 'la2' | 'na1' | 'euw1' | 'eun1' | 'kr' | 'br1' | 'oc1' | 'jp1' | 'tr1' | 'ru' | 'ph2' | 'sg2' | 'th2' | 'tw2' | 'vn2';

export interface MatchParticipant {
  puuid?: string;
  summonerName: string;
  riotIdGameName?: string;
  riotIdTagline?: string;
  championId: number;
  championName: string;
  champLevel: number;
  teamId: number; // 100 or 200
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  kdaRatio: string;
  killParticipation?: string;
  damageDealt: number;
  damageTaken: number;
  goldEarned: number;
  cs: number;
  csPerMin: number;
  visionScore?: number;
  controlWards?: number;
  items: number[];
  spells: number[];
  primaryRuneId?: number;
  secondaryRuneStyleId?: number;
  role?: string;
  isSelf?: boolean;
}

export interface MatchTeam {
  teamId: number;
  win: boolean;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  totalGold: number;
  totalDamage: number;
  dragons?: number;
  barons?: number;
  towers?: number;
  participants: MatchParticipant[];
}

export interface RecentMatch {
  matchId: string;
  gameCreation: number;
  gameDuration: number;
  gameMode: string;
  queueId: number;
  win: boolean;
  championId: number;
  championName: string;
  champLevel?: number;
  kills: number;
  deaths: number;
  assists: number;
  kda: string;
  kdaRatio?: string;
  killParticipation?: string;
  cs: number;
  csPerMin: number;
  damageDealt?: number;
  damageTaken?: number;
  goldEarned?: number;
  visionScore?: number;
  controlWards?: number;
  items: number[];
  spells: number[];
  primaryRuneId?: number;
  secondaryRuneStyleId?: number;
  role: string;
  lane: string;
  lpChange?: number;
  teams?: {
    blue: MatchTeam;
    red: MatchTeam;
  };
  participants?: MatchParticipant[];
}

export interface ChampionStat {
  championId: number;
  championName: string;
  games: number;
  wins: number;
  losses: number;
  winRate: number;
  kills: number;
  deaths: number;
  assists: number;
  kda: string;
}

export interface PlayerStats {
  tier: LoLTier;
  division: LoLDivision;
  leaguePoints: number;
  calculatedMMR: number; // For unified sorting (Challenger > GM > Master > Dia I...)
  wins: number;
  losses: number;
  totalGames: number;
  winRate: number;
  hotStreak: boolean;
  veteran: boolean;
  freshBlood: boolean;
  inactive: boolean;
  trend: number; // LP change in recent games
  recentMatchesSummary: ('W' | 'L')[]; // Last up to 20 results: ['W', 'W', 'L', ...]
  peakTier?: LoLTier;
  peakLP?: number;
  recentMatches?: RecentMatch[];
  topChampions?: ChampionStat[];
  lastUpdated: string;
}

export interface ActiveGameParticipant {
  puuid?: string;
  summonerName: string;
  riotId?: string;
  championId: number;
  championName: string;
  teamId: number; // 100 or 200
  spell1Id: number;
  spell2Id: number;
  primaryRuneId?: number;
  secondaryRuneStyleId?: number;
  currentTier?: LoLTier;
  currentDivision?: LoLDivision;
  currentLP?: number;
  winRate?: number;
  isPlayer?: boolean;
  role?: LoLRole;
}

export interface ActiveGameBannedChampion {
  championId: number;
  championName?: string;
  teamId: number;
  pickTurn: number;
}

export interface ActiveGameInfo {
  gameId: number | string;
  gameType: string;
  gameStartTime: number;
  gameLength: number;
  gameMode: string;
  gameQueueConfigId: number;
  queueName: string;
  mapId: number;
  bannedChampions?: ActiveGameBannedChampion[];
  participants: ActiveGameParticipant[];
  teams: {
    blue: {
      teamId: 100;
      participants: ActiveGameParticipant[];
      bans: ActiveGameBannedChampion[];
    };
    red: {
      teamId: 200;
      participants: ActiveGameParticipant[];
      bans: ActiveGameBannedChampion[];
    };
  };
  playerChampion: string;
  playerChampionId: number;
  playerTeamId: number;
}

export interface Player {
  id: string; // Unique internal ID
  displayName: string; // Custom nickname or streamer name (e.g. "Siler", "Yisus", "ElXokas")
  gameName: string; // Riot Game Name (e.g. "Faker")
  tagLine: string; // Riot Tag (e.g. "LAS", "EUW", "0001")
  region: RegionRouting; // Region (la1, la2, euw1, na1, etc.)
  puuid?: string; // Riot PUUID
  summonerId?: string;
  profileIconId?: number;
  summonerLevel?: number;
  primaryRole: LoLRole; // TOP, JNG, MID, ADC, SUP
  countryCode: string; // e.g. "es", "ar", "mx", "cl", "co", "pe", "us"
  avatarUrl?: string; // Custom avatar or generated
  aegisCount: number; // Tournament specific item/points
  shellsCount: number; // Tournament specific item/points
  tournamentPoints: number; // Custom challenge score calculation
  notes?: string;
  stats: PlayerStats;
  isLive?: boolean;
  livePlatform?: 'twitch' | 'kick' | 'youtube' | null;
  liveChannel?: string;
  activeGame?: ActiveGameInfo | null;
}

export interface TournamentConfig {
  name: string;
  tagline: string;
  startDate: string;
  endDate: string;
  prizePool: string;
  rules: {
    title: string;
    description: string;
  }[];
  customItemsEnabled: boolean;
  defaultRegion: RegionRouting;
  activeApiKey?: string;
}
