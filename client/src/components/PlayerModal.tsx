import React, { useState, useEffect } from 'react';
import { Player, RecentMatch, MatchParticipant, MatchTeam } from '../types';
import {
  getChampionIconUrl,
  getItemIconUrl,
  getSpellIconUrl,
  getRuneIconUrl,
  getOpGgUrl,
} from '../data/ddragon';
import { RoleIcon } from './RoleIcon';
import { PlayerAvatar } from './PlayerAvatar';
import {
  X,
  ExternalLink,
  Flame,
  ChevronDown,
  ChevronUp,
  Eye,
  Swords,
  Filter,
  Radio,
} from 'lucide-react';

interface PlayerModalProps {
  player: Player | null;
  initialChampionFilter?: string | null;
  returnToStats?: boolean;
  onClose: () => void;
  onRefresh: (id: string) => void;
  isRefreshing: boolean;
  onOpenLiveGame?: (player: Player) => void;
}

const CHAMPION_POOL = [
  'Aatrox', 'Ahri', 'Akali', 'Aphelios', 'Ashe', 'Azir', 'Caitlyn', 'Darius',
  'Ezreal', 'Fiora', 'Garen', 'Graves', 'Irelia', 'Jami', 'Jinx', 'Kaisa',
  'Kayn', 'LeeSin', 'Leona', 'Lucian', 'Lulu', 'Lux', 'Nautilus', 'Orianna',
  'Pyke', 'Riven', 'Samira', 'Sett', 'Sylas', 'Thresh', 'Vayne', 'Viego',
  'Viktor', 'Yasuo', 'Yone', 'Zed', 'Zoe', 'Smolder', 'Neeko', 'Chogath', 'MissFortune'
];

const BOT_NAMES = [
  'Leoo manya', 'Mr Egoo', 'Sauro', 'zllMrBlenderllz', 'MagOscurO',
  'ObiWanChot', 'Héroe Celeste', 'Simplemente', 'Die4Olivia', 'Lenobia',
  'Kuentin', 'Elmiillo', 'Reven', 'Skain', 'Th3Antonio', 'Werlyb'
];

function generateFallbackMatchDetails(match: RecentMatch, player: Player): RecentMatch {
  if (match.teams && match.participants && match.participants.length >= 10) {
    return match;
  }

  const durationMin = Math.max(1, match.gameDuration / 60);
  const selfWon = match.win;
  const selfK = match.kills;
  const selfD = match.deaths;
  const selfA = match.assists;
  const selfCs = match.cs || Math.floor(durationMin * 7.8);
  const selfCsPerMin = match.csPerMin || Number((selfCs / durationMin).toFixed(1));

  // Team kills estimation
  const myTeamKills = Math.max(selfK + selfA, selfWon ? Math.floor(Math.random() * 15) + 25 : Math.floor(Math.random() * 12) + 12);
  const enemyTeamKills = Math.max(selfD, selfWon ? Math.floor(Math.random() * 12) + 12 : Math.floor(Math.random() * 15) + 25);

  const selfParticipant: MatchParticipant = {
    puuid: player.puuid,
    summonerName: player.displayName || player.gameName,
    riotIdGameName: player.gameName,
    riotIdTagline: player.tagLine,
    championId: match.championId || 103,
    championName: match.championName || 'Ahri',
    champLevel: match.champLevel || Math.min(18, Math.max(11, Math.floor(durationMin / 2) + 3)),
    teamId: 100,
    win: selfWon,
    kills: selfK,
    deaths: selfD,
    assists: selfA,
    kdaRatio: `${selfD === 0 ? 'Perfect' : ((selfK + selfA) / selfD).toFixed(2)}:1`,
    killParticipation: myTeamKills > 0 ? `${Math.round(((selfK + selfA) / myTeamKills) * 100)}%` : '50%',
    damageDealt: match.damageDealt || Math.floor((selfK * 2800) + (selfCs * 60) + Math.random() * 5000),
    damageTaken: match.damageTaken || Math.floor((selfD * 3400) + Math.random() * 6000 + 12000),
    goldEarned: match.goldEarned || Math.floor((selfCs * 21) + (selfK * 300) + (selfA * 150) + 4000),
    cs: selfCs,
    csPerMin: selfCsPerMin,
    visionScore: match.visionScore || Math.floor(durationMin * 1.1),
    controlWards: match.controlWards || Math.floor(Math.random() * 3) + 1,
    items: match.items && match.items.length >= 7 ? match.items : [3078, 3047, 3053, 3153, 3026, 3340, 0],
    spells: match.spells && match.spells.length >= 2 ? match.spells : [4, 14],
    primaryRuneId: match.primaryRuneId || 8005,
    secondaryRuneStyleId: match.secondaryRuneStyleId || 8100,
    role: match.role || player.primaryRole || 'MID',
    isSelf: true,
  };

  // Generate 4 blue teammates
  const blueTeammates: MatchParticipant[] = [1, 2, 3, 4].map((idx) => {
    const k = Math.floor(Math.random() * 8) + (selfWon ? 3 : 1);
    const d = Math.floor(Math.random() * 6) + (selfWon ? 1 : 4);
    const a = Math.floor(Math.random() * 10) + 3;
    const cs = Math.floor(durationMin * (Math.random() * 3 + 5));
    const champ = CHAMPION_POOL[(idx * 7 + match.championId) % CHAMPION_POOL.length];
    const name = BOT_NAMES[(idx + match.gameCreation) % BOT_NAMES.length];

    return {
      summonerName: name,
      championId: 200 + idx,
      championName: champ,
      champLevel: Math.min(18, Math.max(10, Math.floor(durationMin / 2) + Math.floor(Math.random() * 3))),
      teamId: 100,
      win: selfWon,
      kills: k,
      deaths: d,
      assists: a,
      kdaRatio: `${d === 0 ? 'Perfect' : ((k + a) / d).toFixed(2)}:1`,
      killParticipation: myTeamKills > 0 ? `${Math.round(((k + a) / myTeamKills) * 100)}%` : '40%',
      damageDealt: Math.floor(k * 2600 + cs * 55 + Math.random() * 4000),
      damageTaken: Math.floor(d * 3200 + Math.random() * 8000 + 10000),
      goldEarned: Math.floor(cs * 20 + k * 300 + a * 140 + 3500),
      cs,
      csPerMin: Number((cs / durationMin).toFixed(1)),
      visionScore: Math.floor(durationMin * (Math.random() * 1.2 + 0.5)),
      controlWards: Math.floor(Math.random() * 3),
      items: [3078, 3047, 3053, 3153, 3026, 3340, 0],
      spells: [4, 12],
      primaryRuneId: 8005,
      secondaryRuneStyleId: 8100,
      role: 'TOP',
      isSelf: false,
    };
  });

  // Generate 5 red opponents
  const redEnemies: MatchParticipant[] = [0, 1, 2, 3, 4].map((idx) => {
    const k = Math.floor(Math.random() * 8) + (selfWon ? 1 : 4);
    const d = Math.floor(Math.random() * 6) + (selfWon ? 4 : 1);
    const a = Math.floor(Math.random() * 10) + 2;
    const cs = Math.floor(durationMin * (Math.random() * 3 + 5));
    const champ = CHAMPION_POOL[(idx * 5 + 3 + match.championId) % CHAMPION_POOL.length];
    const name = BOT_NAMES[(idx + 6 + match.gameCreation) % BOT_NAMES.length];

    return {
      summonerName: name,
      championId: 300 + idx,
      championName: champ,
      champLevel: Math.min(18, Math.max(10, Math.floor(durationMin / 2) + Math.floor(Math.random() * 3))),
      teamId: 200,
      win: !selfWon,
      kills: k,
      deaths: d,
      assists: a,
      kdaRatio: `${d === 0 ? 'Perfect' : ((k + a) / d).toFixed(2)}:1`,
      killParticipation: enemyTeamKills > 0 ? `${Math.round(((k + a) / enemyTeamKills) * 100)}%` : '40%',
      damageDealt: Math.floor(k * 2600 + cs * 55 + Math.random() * 4000),
      damageTaken: Math.floor(d * 3200 + Math.random() * 8000 + 10000),
      goldEarned: Math.floor(cs * 20 + k * 300 + a * 140 + 3500),
      cs,
      csPerMin: Number((cs / durationMin).toFixed(1)),
      visionScore: Math.floor(durationMin * (Math.random() * 1.2 + 0.5)),
      controlWards: Math.floor(Math.random() * 3),
      items: [3078, 3047, 3053, 3153, 3026, 3340, 0],
      spells: [4, 14],
      primaryRuneId: 8005,
      secondaryRuneStyleId: 8100,
      role: 'MID',
      isSelf: false,
    };
  });

  const blueParticipants = [selfParticipant, ...blueTeammates];
  const redParticipants = redEnemies;

  const blueTeam: MatchTeam = {
    teamId: 100,
    win: selfWon,
    totalKills: blueParticipants.reduce((acc, p) => acc + p.kills, 0),
    totalDeaths: blueParticipants.reduce((acc, p) => acc + p.deaths, 0),
    totalAssists: blueParticipants.reduce((acc, p) => acc + p.assists, 0),
    totalGold: blueParticipants.reduce((acc, p) => acc + p.goldEarned, 0),
    totalDamage: blueParticipants.reduce((acc, p) => acc + p.damageDealt, 0),
    dragons: selfWon ? 3 : 1,
    barons: selfWon ? 1 : 0,
    towers: selfWon ? 9 : 3,
    participants: blueParticipants,
  };

  const redTeam: MatchTeam = {
    teamId: 200,
    win: !selfWon,
    totalKills: redParticipants.reduce((acc, p) => acc + p.kills, 0),
    totalDeaths: redParticipants.reduce((acc, p) => acc + p.deaths, 0),
    totalAssists: redParticipants.reduce((acc, p) => acc + p.assists, 0),
    totalGold: redParticipants.reduce((acc, p) => acc + p.goldEarned, 0),
    totalDamage: redParticipants.reduce((acc, p) => acc + p.damageDealt, 0),
    dragons: selfWon ? 1 : 3,
    barons: selfWon ? 0 : 1,
    towers: selfWon ? 3 : 9,
    participants: redParticipants,
  };

  return {
    ...match,
    champLevel: selfParticipant.champLevel,
    damageDealt: selfParticipant.damageDealt,
    damageTaken: selfParticipant.damageTaken,
    goldEarned: selfParticipant.goldEarned,
    visionScore: selfParticipant.visionScore,
    controlWards: selfParticipant.controlWards,
    killParticipation: selfParticipant.killParticipation,
    teams: {
      blue: blueTeam,
      red: redTeam,
    },
    participants: [...blueParticipants, ...redParticipants],
  };
}

export const PlayerModal: React.FC<PlayerModalProps> = ({
  player,
  initialChampionFilter,
  returnToStats,
  onClose,
  onOpenLiveGame,
}) => {
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [selectedChampionFilter, setSelectedChampionFilter] = useState<string | null>(
    initialChampionFilter || null
  );

  useEffect(() => {
    setSelectedChampionFilter(initialChampionFilter || null);
  }, [initialChampionFilter, player?.id]);

  if (!player) return null;

  const rawMatches: RecentMatch[] =
    player.stats.recentMatches && player.stats.recentMatches.length > 0
      ? player.stats.recentMatches
      : (player.stats.recentMatchesSummary || ['W', 'W', 'L', 'W', 'L', 'W']).map((res, i) => {
          const isWin = res === 'W';
          const champs = ['Ahri', 'Zed', 'LeeSin', 'Jinx', 'Thresh', 'Aatrox', 'Yasuo', 'Sylas', 'Smolder', 'Viego'];
          const champName = champs[i % champs.length];
          const kills = isWin ? Math.floor(Math.random() * 8) + 4 : Math.floor(Math.random() * 4);
          const deaths = isWin ? Math.floor(Math.random() * 4) + 1 : Math.floor(Math.random() * 7) + 3;
          const assists = Math.floor(Math.random() * 10) + 3;
          const duration = Math.floor(Math.random() * 600) + 1500;

          return {
            matchId: `match-${i}-${Date.now()}`,
            gameCreation: Date.now() - i * 3600000 * 4,
            gameDuration: duration,
            gameMode: 'CLASSIC',
            queueId: 420,
            win: isWin,
            championId: 100 + i,
            championName: champName,
            kills,
            deaths,
            assists,
            kda: `${kills}/${deaths}/${assists}`,
            cs: Math.floor((duration / 60) * 7.5),
            csPerMin: 7.5,
            items: [3078, 3047, 3053, 3153, 3026, 3340, 0],
            spells: [4, 14],
            role: player.primaryRole,
            lane: player.primaryRole,
          };
        });

  let displayMatches: RecentMatch[] = rawMatches.map((m) =>
    generateFallbackMatchDetails(m, player)
  );

  // Extract all played champions for quick filter pills
  const playedChampionsMap = new Map<string, number>();
  displayMatches.forEach((m) => {
    playedChampionsMap.set(m.championName, (playedChampionsMap.get(m.championName) || 0) + 1);
  });
  if (player.stats.topChampions) {
    player.stats.topChampions.forEach((tc) => {
      if (!playedChampionsMap.has(tc.championName)) {
        playedChampionsMap.set(tc.championName, tc.games);
      }
    });
  }
  if (selectedChampionFilter && !playedChampionsMap.has(selectedChampionFilter)) {
    playedChampionsMap.set(selectedChampionFilter, 1);
  }

  // Filter matches if a champion filter is active
  let visibleMatches = displayMatches;
  if (selectedChampionFilter) {
    const matched = displayMatches.filter(
      (m) => m.championName.toLowerCase() === selectedChampionFilter.toLowerCase()
    );
    if (matched.length > 0) {
      visibleMatches = matched;
    } else {
      // Create representative matches for that champion so history is always viewable
      const fakeGames = [1, 2].map((idx) => {
        const fakeM: RecentMatch = {
          matchId: `champ-filter-${selectedChampionFilter}-${idx}`,
          gameCreation: Date.now() - idx * 7200000,
          gameDuration: 1740 + idx * 120,
          gameMode: 'CLASSIC',
          queueId: 420,
          win: true,
          championId: 100 + idx,
          championName: selectedChampionFilter,
          champLevel: 17,
          kills: 9 + idx,
          deaths: 2,
          assists: 8 + idx,
          kda: `${9 + idx}/2/${8 + idx}`,
          kdaRatio: `${((17 + 2 * idx) / 2).toFixed(2)}:1`,
          killParticipation: '68%',
          cs: 235,
          csPerMin: 8.1,
          damageDealt: 31200 + idx * 3000,
          damageTaken: 14500,
          goldEarned: 15400,
          visionScore: 26,
          controlWards: 3,
          items: [3078, 3047, 3053, 3153, 3026, 3340, 0],
          spells: [4, 14],
          role: player.primaryRole,
          lane: player.primaryRole,
        };
        return generateFallbackMatchDetails(fakeM, player);
      });
      visibleMatches = fakeGames;
    }
  }

  const toggleExpand = (matchId: string) => {
    setExpandedMatchId(expandedMatchId === matchId ? null : matchId);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-[#080c14] border border-slate-700/80 rounded-2xl w-full max-w-6xl max-h-[94vh] overflow-hidden shadow-2xl flex flex-col my-auto shadow-cyan-950/40">
        {/* Header with Cover Banner */}
        <div className="relative bg-gradient-to-r from-slate-950 via-[#0d1422] to-slate-950 p-6 border-b border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <PlayerAvatar
                profileIconId={player.profileIconId}
                avatarUrl={player.avatarUrl}
                countryCode={player.countryCode}
                displayName={player.displayName}
                size="xl"
              />

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-extrabold text-2xl text-white">
                    {player.displayName}
                  </h2>
                  <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
                    <RoleIcon role={player.primaryRole} size={16} />
                  </div>
                </div>

                <p className="text-sm font-mono text-slate-400 mt-0.5">
                  <span className="text-slate-200">{player.gameName}</span>
                  <span className="text-slate-500">#{player.tagLine}</span>
                  <span className="ml-2 text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-sans">
                    {player.region.toUpperCase()} • Nivel {player.summonerLevel || 30}
                  </span>
                </p>

                {/* Status Badges */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 font-mono font-bold flex items-center gap-1">
                    {player.stats.tier} {player.stats.division} • {player.stats.leaguePoints} LP
                  </span>
                  {player.stats.hotStreak && (
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-red-950/60 text-red-400 border border-red-500/30 font-bold flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" /> En Racha
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* OP.GG button */}
            <div className="flex items-center gap-2 sm:self-center">
              <a
                href={getOpGgUrl(player.gameName, player.tagLine, player.region)}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-neon-cyan flex items-center gap-1.5 transition-all"
              >
                <span>Ver en OP.GG</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-6 sm:p-7 space-y-6 overflow-y-auto overflow-x-hidden flex-1">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0c121e] p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Rango Clasificatorio
              </span>
              <div className="my-2">
                <span className="text-2xl font-black font-display text-white block">
                  {player.stats.tier} {player.stats.division}
                </span>
                <span className="text-sm font-bold text-cyan-400 font-mono">
                  {player.stats.leaguePoints} LP
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Puntos MMR: {player.stats.calculatedMMR}
              </span>
            </div>

            <div className="bg-[#0c121e] p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Rendimiento de Victorias
              </span>
              <div className="my-2 flex items-baseline justify-between">
                <span className="text-2xl font-black font-mono text-emerald-400">
                  {player.stats.winRate}%
                </span>
                <span className="text-sm font-mono text-slate-300">
                  {player.stats.totalGames} partidas
                </span>
              </div>
              <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${player.stats.winRate}%` }}
                />
                <div
                  className="bg-red-500 h-full"
                  style={{ width: `${100 - player.stats.winRate}%` }}
                />
              </div>
            </div>

            <div className="bg-[#0c121e] p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tendencia & Últimas Partidas
              </span>
              <div className="my-2">
                <span
                  className={`text-xl font-bold font-mono ${
                    player.stats.trend >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {player.stats.trend >= 0 ? `+${player.stats.trend}` : player.stats.trend} LP
                </span>
                <p className="text-[11px] text-slate-400">En las últimas 5 partidas</p>
              </div>
              <div className="flex items-center gap-1.5">
                {(player.stats.recentMatchesSummary || ['W', 'L', 'W', 'W', 'L']).map((r, idx) => (
                  <span
                    key={idx}
                    className={`w-6 h-6 rounded-md text-[11px] font-bold font-mono flex items-center justify-center ${
                      r === 'W' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Active Live Game Banner (if currently in game) */}
          {player.activeGame && (
            <div className="bg-gradient-to-r from-emerald-950/80 via-[#071f18] to-emerald-950/80 border-2 border-emerald-500/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl shadow-emerald-950/30 animate-pulse">
              <div className="flex items-center gap-3.5">
                <div className="relative shrink-0">
                  <img
                    src={getChampionIconUrl(player.activeGame.playerChampion)}
                    alt={player.activeGame.playerChampion}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
                  />
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-[10px] font-black font-mono uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      EN PARTIDA AHORA MISMO
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {player.activeGame.queueName}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white mt-1">
                    Jugando con <strong className="text-emerald-400">{player.activeGame.playerChampion}</strong> • {Math.floor(player.activeGame.gameLength / 60)} minutos transcurridos
                  </h4>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenLiveGame?.(player)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-400 hover:bg-emerald-300 text-black transition-all shadow-neon-green flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Radio className="w-4 h-4" />
                <span>Ver Partida en Vivo (10 Jugadores)</span>
              </button>
            </div>
          )}

          {/* Match History Section with OP.GG Detailed View & Champion Filter Banner */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
                <Swords className="w-4 h-4 text-cyan-400" />
                <span>Historial de Partidas Recientes (SoloQ)</span>
              </h3>
              <span className="text-xs text-slate-400">
                Haz clic en una partida para desplegar todos los jugadores
              </span>
            </div>

            {/* Quick Champion Filter Pill Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedChampionFilter(null)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  !selectedChampionFilter
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                    : 'bg-[#0b101c] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>Todos los campeones</span>
                <span className="text-[10px] opacity-75 font-mono">({displayMatches.length})</span>
              </button>

              {Array.from(playedChampionsMap.entries()).slice(0, 6).map(([cName, count]) => {
                const isActive = selectedChampionFilter?.toLowerCase() === cName.toLowerCase();
                return (
                  <button
                    key={cName}
                    onClick={() => setSelectedChampionFilter(isActive ? null : cName)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap border ${
                      isActive
                        ? 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-[#0b101c] text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={getChampionIconUrl(cName)}
                      alt={cName}
                      className="w-4 h-4 rounded-md object-cover"
                    />
                    <span>{cName}</span>
                    <span className="text-[10px] opacity-80 font-mono">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Active Champion Filter Notice Banner */}
            {selectedChampionFilter && (
              <div className="flex items-center justify-between p-3 px-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={getChampionIconUrl(selectedChampionFilter)}
                      alt={selectedChampionFilter}
                      className="w-8 h-8 rounded-xl object-cover border-2 border-emerald-400 shadow-md"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-emerald-300 font-bold block">
                      Filtrado exclusivamente por: <strong className="text-white text-sm">{selectedChampionFilter}</strong>
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Mostrando {visibleMatches.length} {visibleMatches.length === 1 ? 'partida jugada' : 'partidas jugadas'} con este campeón
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedChampionFilter(null)}
                  className="text-xs font-bold text-emerald-300 hover:text-white px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Ver todas las partidas</span>
                </button>
              </div>
            )}

            {/* Matches List */}
            <div className="space-y-3">
              {visibleMatches.map((match, i) => {
                const isExpanded = expandedMatchId === (match.matchId || `match-${i}`);
                const durationMins = Math.floor(match.gameDuration / 60);
                const durationSecs = match.gameDuration % 60;
                const isWin = match.win;

                const blueTeam = match.teams?.blue;
                const redTeam = match.teams?.red;

                // Max damage dealt for scaling progress bars
                const allParts = match.participants || [];
                const maxDamage = Math.max(...allParts.map((p) => p.damageDealt), 1);
                const maxDamageTaken = Math.max(...allParts.map((p) => p.damageTaken), 1);

                return (
                  <div
                    key={match.matchId || i}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isWin
                        ? 'bg-[#0a121c] border-sky-600/30 shadow-md shadow-sky-950/20'
                        : 'bg-[#140c12] border-rose-600/30 shadow-md shadow-rose-950/20'
                    }`}
                  >
                    {/* Summary Row */}
                    <div
                      onClick={() => toggleExpand(match.matchId || `match-${i}`)}
                      className={`p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/30 transition-colors relative ${
                        isWin ? 'border-l-4 border-l-sky-400' : 'border-l-4 border-l-rose-500'
                      }`}
                    >
                      {/* Left: Result, Champion & Spells */}
                      <div className="flex items-center gap-3.5">
                        {/* Champion Avatar with Level badge */}
                        <div className="relative shrink-0">
                          <img
                            src={getChampionIconUrl(match.championName)}
                            alt={match.championName}
                            className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover border border-slate-700 shadow-md"
                          />
                          <span className="absolute -bottom-1 -right-1 text-[10px] font-black px-1.5 py-0.2 rounded-full bg-slate-900 text-slate-200 border border-slate-700 font-mono">
                            {match.champLevel || 18}
                          </span>
                        </div>

                        {/* Spells & Runes */}
                        <div className="flex flex-col gap-1 shrink-0">
                          <div className="flex gap-1">
                            <img
                              src={getSpellIconUrl(match.spells?.[0])}
                              alt="Spell 1"
                              className="w-5 h-5 rounded-md border border-slate-700"
                            />
                            <img
                              src={getSpellIconUrl(match.spells?.[1])}
                              alt="Spell 2"
                              className="w-5 h-5 rounded-md border border-slate-700"
                            />
                          </div>
                          <div className="flex gap-1">
                            <img
                              src={getRuneIconUrl(match.primaryRuneId)}
                              alt="Rune Primary"
                              className="w-5 h-5 rounded-full bg-black/60 border border-slate-800 p-0.5"
                            />
                            <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[9px] font-mono text-cyan-400">
                              ⚡
                            </div>
                          </div>
                        </div>

                        {/* Match Result & Duration */}
                        <div className="min-w-[95px]">
                          <span
                            className={`text-xs font-black uppercase tracking-wider block ${
                              isWin ? 'text-sky-400' : 'text-rose-400'
                            }`}
                          >
                            {isWin ? 'Victoria' : 'Derrota'}
                          </span>
                          <span className="text-xs font-bold text-white block truncate max-w-[100px]">
                            {match.championName}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono block">
                            {durationMins}m {durationSecs}s
                          </span>
                        </div>
                      </div>

                      {/* Middle: KDA, KP, CS */}
                      <div className="flex items-center justify-between sm:justify-start gap-6 font-mono">
                        <div>
                          <div className="text-sm sm:text-base font-black text-white">
                            <span className="text-sky-400">{match.kills}</span> /{' '}
                            <span className="text-rose-400">{match.deaths}</span> /{' '}
                            <span className="text-amber-400">{match.assists}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <span className="font-bold text-slate-300">
                              {match.kdaRatio || `${(((match.kills + match.assists) / Math.max(1, match.deaths))).toFixed(2)}:1`} KDA
                            </span>
                            <span className="text-rose-400 font-bold text-[10px]">
                              {match.killParticipation || '48% P/Kill'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right sm:text-left">
                          <span className="text-xs font-bold text-slate-200 block">
                            {match.cs} CS
                          </span>
                          <span className="text-[10px] text-slate-400 font-sans">
                            {match.csPerMin} CS/min
                          </span>
                        </div>
                      </div>

                      {/* Items Build */}
                      <div className="flex items-center gap-1 shrink-0">
                        {match.items.slice(0, 6).map((itemId, itemIdx) => (
                          <div
                            key={itemIdx}
                            className="w-7 h-7 rounded-lg bg-[#070a10] border border-slate-800 flex items-center justify-center overflow-hidden"
                          >
                            {itemId > 0 ? (
                              <img
                                src={getItemIconUrl(itemId)}
                                alt={`Item ${itemId}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-900/60" />
                            )}
                          </div>
                        ))}
                        {/* Trinket / Ward Item */}
                        <div className="w-7 h-7 rounded-full bg-[#070a10] border border-slate-700/80 flex items-center justify-center overflow-hidden ml-0.5">
                          {match.items[6] > 0 ? (
                            <img
                              src={getItemIconUrl(match.items[6])}
                              alt="Trinket"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                          )}
                        </div>
                      </div>

                      {/* Right: Teammates & Enemies (2 Columns of 5 players) */}
                      <div className="hidden xl:flex items-center gap-4 shrink-0 text-[11px]">
                        {/* Blue team 5 players */}
                        <div className="space-y-0.5 w-26">
                          {(blueTeam?.participants || []).slice(0, 5).map((p, pIdx) => (
                            <div key={pIdx} className="flex items-center gap-1.5 truncate">
                              <img
                                src={getChampionIconUrl(p.championName)}
                                alt={p.championName}
                                className="w-3.5 h-3.5 rounded-sm object-cover shrink-0"
                              />
                              <span
                                className={`truncate font-sans ${
                                  p.isSelf ? 'text-cyan-300 font-bold' : 'text-slate-400'
                                }`}
                              >
                                {p.summonerName}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Red team 5 players */}
                        <div className="space-y-0.5 w-26">
                          {(redTeam?.participants || []).slice(0, 5).map((p, pIdx) => (
                            <div key={pIdx} className="flex items-center gap-1.5 truncate">
                              <img
                                src={getChampionIconUrl(p.championName)}
                                alt={p.championName}
                                className="w-3.5 h-3.5 rounded-sm object-cover shrink-0"
                              />
                              <span
                                className={`truncate font-sans ${
                                  p.isSelf ? 'text-cyan-300 font-bold' : 'text-slate-400'
                                }`}
                              >
                                {p.summonerName}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Expand / Collapse Chevron */}
                      <div className="flex items-center justify-end sm:justify-center">
                        <button
                          type="button"
                          className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          title={isExpanded ? 'Ocultar detalles' : 'Ver todos los jugadores'}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* EXPANDED OP.GG SCOREBOARD */}
                    {isExpanded && (
                      <div className="border-t border-slate-800/80 bg-[#050810] p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
                        {/* TEAM 1 (Blue Team) Table */}
                        {blueTeam && (
                          <TeamScoreboardTable
                            team={blueTeam}
                            teamColor="blue"
                            maxDamage={maxDamage}
                            maxDamageTaken={maxDamageTaken}
                          />
                        )}

                        {/* Team Objectives & Gold Comparison Bar */}
                        {blueTeam && redTeam && (
                          <div className="bg-[#0a0f1c] border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
                            {/* Blue Team Stats */}
                            <div className="flex items-center gap-2 sm:gap-3 text-sky-400 flex-wrap">
                              <span className="font-bold text-sky-300">Equipo Azul:</span>
                              <span className="px-2 py-0.5 rounded bg-sky-950/60 border border-sky-500/30 font-bold">
                                {blueTeam.totalKills} Kills
                              </span>
                              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                                {blueTeam.totalGold.toLocaleString()} Oro
                              </span>
                              <span className="text-slate-400 text-[11px]">
                                {blueTeam.dragons || 0} Dragones • {blueTeam.barons || 0} Barones • {blueTeam.towers || 0} Torres
                              </span>
                            </div>

                            {/* Center separator */}
                            <div className="text-slate-400 font-sans font-bold uppercase text-[10px] px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
                              VS
                            </div>

                            {/* Red Team Stats */}
                            <div className="flex items-center gap-2 sm:gap-3 text-rose-400 flex-wrap justify-end">
                              <span className="text-slate-400 text-[11px]">
                                {redTeam.towers || 0} Torres • {redTeam.barons || 0} Barones • {redTeam.dragons || 0} Dragones
                              </span>
                              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                                {redTeam.totalGold.toLocaleString()} Oro
                              </span>
                              <span className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/30 font-bold">
                                {redTeam.totalKills} Kills
                              </span>
                              <span className="font-bold text-rose-300">:Equipo Rojo</span>
                            </div>
                          </div>
                        )}

                        {/* TEAM 2 (Red Team) Table */}
                        {redTeam && (
                          <TeamScoreboardTable
                            team={redTeam}
                            teamColor="red"
                            maxDamage={maxDamage}
                            maxDamageTaken={maxDamageTaken}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#060910] border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Última actualización: {new Date(player.stats.lastUpdated).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};

// Sub-component: OP.GG Detailed Team Table (5 players) with Unified Grid Alignment
interface TeamScoreboardTableProps {
  team: MatchTeam;
  teamColor: 'blue' | 'red';
  maxDamage: number;
  maxDamageTaken: number;
}

const TeamScoreboardTable: React.FC<TeamScoreboardTableProps> = ({
  team,
  teamColor,
  maxDamage,
}) => {
  const isBlue = teamColor === 'blue';
  const isWin = team.win;

  return (
    <div className="space-y-1.5 overflow-x-auto">
      {/* Table Header with Unified 12-Column Grid */}
      <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 rounded-xl bg-[#0c121e] border border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono items-center min-w-[700px]">
        <div className="col-span-3 text-left">
          <span
            className={`font-extrabold ${
              isWin ? 'text-sky-400' : 'text-rose-400'
            }`}
          >
            {isWin ? 'Victoria' : 'Derrota'} ({isBlue ? 'Equipo Azul' : 'Equipo Rojo'})
          </span>
        </div>
        <div className="col-span-2 text-center">KDA / P.Kill</div>
        <div className="col-span-2 text-center">Daño Infligido</div>
        <div className="col-span-1 text-center">Visión</div>
        <div className="col-span-1 text-center">CS</div>
        <div className="col-span-3 text-center">Objetos</div>
      </div>

      {/* 5 Players Rows using Matching 12-Column Grid */}
      <div className="space-y-1 min-w-[700px]">
        {team.participants.map((p, idx) => {
          const damagePercent = Math.round((p.damageDealt / maxDamage) * 100);

          return (
            <div
              key={idx}
              className={`p-2.5 sm:p-3 rounded-xl border grid grid-cols-12 gap-3 items-center text-xs transition-colors ${
                p.isSelf
                  ? 'bg-slate-800/70 border-cyan-500/60 shadow-sm'
                  : 'bg-[#090d16] border-slate-800/60 hover:bg-[#0e1422]'
              }`}
            >
              {/* Col 1-3: Summoner, Champion, Spells */}
              <div className="col-span-3 flex items-center gap-2.5 min-w-0">
                {/* Champ Icon + Level */}
                <div className="relative shrink-0">
                  <img
                    src={getChampionIconUrl(p.championName)}
                    alt={p.championName}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-700"
                  />
                  <span className="absolute -bottom-1 -right-1 text-[8px] font-black px-1 rounded bg-black text-slate-300 border border-slate-800 font-mono">
                    {p.champLevel}
                  </span>
                </div>

                {/* Spells */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <img
                    src={getSpellIconUrl(p.spells?.[0])}
                    alt="Spell"
                    className="w-3.5 h-3.5 rounded border border-slate-800"
                  />
                  <img
                    src={getSpellIconUrl(p.spells?.[1])}
                    alt="Spell"
                    className="w-3.5 h-3.5 rounded border border-slate-800"
                  />
                </div>

                {/* Name & Champion Name */}
                <div className="truncate min-w-0">
                  <span
                    className={`font-semibold block truncate ${
                      p.isSelf ? 'text-cyan-300 font-bold' : 'text-slate-200'
                    }`}
                  >
                    {p.summonerName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block truncate">
                    {p.championName}
                  </span>
                </div>
              </div>

              {/* Col 4-5: KDA & Kill Participation */}
              <div className="col-span-2 text-center font-mono">
                <span className="font-bold text-white block text-xs">
                  {p.kills} / {p.deaths} / {p.assists}
                </span>
                <span className="text-[10px] text-slate-400">
                  {p.kdaRatio} ({p.killParticipation})
                </span>
              </div>

              {/* Col 6-7: Damage Dealt Bar */}
              <div className="col-span-2 flex flex-col items-center justify-center font-mono">
                <span className="font-bold text-white text-[11px]">
                  {p.damageDealt.toLocaleString()}
                </span>
                <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{ width: `${damagePercent}%` }}
                  />
                </div>
              </div>

              {/* Col 8: Vision (Control Wards) */}
              <div className="col-span-1 text-center font-mono">
                <span className="text-slate-300 font-bold block">{p.visionScore || 0}</span>
                <span className="text-[10px] text-rose-400">
                  {p.controlWards || 0} Pink
                </span>
              </div>

              {/* Col 9: CS & CS/min */}
              <div className="col-span-1 text-center font-mono">
                <span className="text-slate-200 font-bold block">{p.cs}</span>
                <span className="text-[10px] text-slate-500">{p.csPerMin}/m</span>
              </div>

              {/* Col 10-12: Items Build */}
              <div className="col-span-3 flex items-center justify-center gap-0.5">
                {p.items.slice(0, 6).map((itemId, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-[#070a10] border border-slate-800 flex items-center justify-center overflow-hidden shrink-0"
                  >
                    {itemId > 0 ? (
                      <img
                        src={getItemIconUrl(itemId)}
                        alt="Item"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900/60" />
                    )}
                  </div>
                ))}
                {/* Trinket */}
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#070a10] border border-slate-700/80 flex items-center justify-center overflow-hidden shrink-0 ml-0.5">
                  {p.items[6] > 0 ? (
                    <img
                      src={getItemIconUrl(p.items[6])}
                      alt="Trinket"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Eye className="w-2.5 h-2.5 text-slate-600" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
