import React, { useState } from 'react';
import { Player, LoLRole } from '../types';
import { RoleIcon } from './RoleIcon';
import { getTierColorClass, getProfileIconUrl, getChampionIconUrl } from '../data/ddragon';
import {
  X,
  BarChart3,
  Crown,
  Sparkles,
  Target,
  Flame,
  Award,
  Eye,
  Coins,
} from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  onSelectPlayer: (player: Player, championFilter?: string) => void;
}

interface PlayerPerf {
  player: Player;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  avgCsPerMin: number;
  totalVisionScore: number;
  avgVisionScore: number;
  totalControlWards: number;
  avgControlWards: number;
  totalPinkGoldSpent: number;
  kda: number;
  totalGames: number;
  winRate: number;
}

interface TournamentChampStat {
  championName: string;
  championId?: number;
  games: number;
  wins: number;
  winRate: number;
  bestPlayerName?: string;
  bestPlayer?: Player;
}

interface PlayerOTPStat {
  player: Player;
  mainChampion: string;
  champGames: number;
  totalGames: number;
  otpPercentage: number;
}

function calculatePlayerPerformance(player: Player): PlayerPerf {
  const matches = player.stats.recentMatches || [];
  const champs = player.stats.topChampions || [];
  const totalGames = Math.max(1, player.stats.totalGames || 1);
  const winRate = player.stats.winRate || 0;

  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;
  let avgCsPerMin = 0;
  let totalVisionScore = 0;
  let totalControlWards = 0;

  if (matches.length > 0) {
    const matchKills = matches.reduce((acc, m) => acc + (m.kills || 0), 0);
    const matchDeaths = matches.reduce((acc, m) => acc + (m.deaths || 0), 0);
    const matchAssists = matches.reduce((acc, m) => acc + (m.assists || 0), 0);
    const matchCsPerMin =
      matches.reduce((acc, m) => acc + (m.csPerMin || 0), 0) / matches.length;
    const matchVision = matches.reduce((acc, m) => acc + (m.visionScore || 0), 0);
    const matchControl = matches.reduce((acc, m) => acc + (m.controlWards || 0), 0);

    const avgK = matchKills / matches.length;
    const avgD = matchDeaths / matches.length;
    const avgA = matchAssists / matches.length;
    const avgV = matchVision > 0 ? matchVision / matches.length : (player.primaryRole === 'SUP' ? 48 : player.primaryRole === 'JNG' ? 36 : 22);
    const avgCW = matchControl > 0 ? matchControl / matches.length : (player.primaryRole === 'SUP' ? 4.8 : player.primaryRole === 'JNG' ? 3.6 : 1.8);

    totalKills = Math.round(avgK * totalGames);
    totalDeaths = Math.round(avgD * totalGames);
    totalAssists = Math.round(avgA * totalGames);
    avgCsPerMin = Number(matchCsPerMin.toFixed(2));
    totalVisionScore = Math.round(avgV * totalGames);
    totalControlWards = Math.round(avgCW * totalGames);
  } else if (champs.length > 0) {
    const champGames = champs.reduce((acc, c) => acc + c.games, 0) || 1;
    const champK = champs.reduce((acc, c) => acc + c.kills * c.games, 0) / champGames;
    const champD = champs.reduce((acc, c) => acc + c.deaths * c.games, 0) / champGames;
    const champA = champs.reduce((acc, c) => acc + c.assists * c.games, 0) / champGames;

    totalKills = Math.round(champK * totalGames);
    totalDeaths = Math.round(champD * totalGames);
    totalAssists = Math.round(champA * totalGames);
    avgCsPerMin = player.primaryRole === 'SUP' ? 1.8 : player.primaryRole === 'JNG' ? 5.8 : 7.6;

    const roleVision: Record<LoLRole, { vs: number; cw: number }> = {
      SUP: { vs: 48, cw: 4.8 },
      JNG: { vs: 36, cw: 3.6 },
      MID: { vs: 24, cw: 2.2 },
      TOP: { vs: 22, cw: 1.8 },
      ADC: { vs: 19, cw: 1.4 },
    };
    const vF = roleVision[player.primaryRole] || { vs: 25, cw: 2.0 };
    totalVisionScore = Math.round(vF.vs * totalGames);
    totalControlWards = Math.round(vF.cw * totalGames);
  } else {
    const roleFactors: Record<LoLRole, { k: number; d: number; a: number; cs: number; vs: number; cw: number }> = {
      TOP: { k: 5.8, d: 5.2, a: 5.1, cs: 7.4, vs: 22, cw: 1.8 },
      JNG: { k: 6.2, d: 4.8, a: 7.5, cs: 5.9, vs: 36, cw: 3.6 },
      MID: { k: 7.4, d: 4.9, a: 6.2, cs: 8.1, vs: 24, cw: 2.2 },
      ADC: { k: 8.2, d: 5.1, a: 5.8, cs: 8.4, vs: 19, cw: 1.4 },
      SUP: { k: 1.8, d: 4.6, a: 13.8, cs: 1.6, vs: 48, cw: 4.8 },
    };
    const factor = roleFactors[player.primaryRole] || { k: 6, d: 5, a: 6, cs: 7.0, vs: 25, cw: 2.0 };
    totalKills = Math.round(factor.k * totalGames);
    totalDeaths = Math.round(factor.d * totalGames);
    totalAssists = Math.round(factor.a * totalGames);
    avgCsPerMin = factor.cs;
    totalVisionScore = Math.round(factor.vs * totalGames);
    totalControlWards = Math.round(factor.cw * totalGames);
  }

  const kda = Number(((totalKills + totalAssists) / Math.max(1, totalDeaths)).toFixed(2));
  const avgKills = Number((totalKills / totalGames).toFixed(1));
  const avgDeaths = Number((totalDeaths / totalGames).toFixed(1));
  const avgAssists = Number((totalAssists / totalGames).toFixed(1));
  const avgVisionScore = Number((totalVisionScore / totalGames).toFixed(1));
  const avgControlWards = Number((totalControlWards / totalGames).toFixed(1));
  const totalPinkGoldSpent = totalControlWards * 75;

  return {
    player,
    totalKills,
    totalDeaths,
    totalAssists,
    avgKills,
    avgDeaths,
    avgAssists,
    avgCsPerMin,
    totalVisionScore,
    avgVisionScore,
    totalControlWards,
    avgControlWards,
    totalPinkGoldSpent,
    kda,
    totalGames,
    winRate,
  };
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  players,
  onSelectPlayer,
}) => {
  const [selectedRole, setSelectedRole] = useState<LoLRole | 'ALL'>('ALL');

  if (!isOpen) return null;

  // Filter players by selected role
  const filteredPlayers =
    selectedRole === 'ALL'
      ? players
      : players.filter((p) => p.primaryRole === selectedRole);

  const playerPerfs: PlayerPerf[] = filteredPlayers.map(calculatePlayerPerformance);

  // Rankings
  const eloRank = [...playerPerfs].sort(
    (a, b) => b.player.stats.calculatedMMR - a.player.stats.calculatedMMR
  );
  const killsRank = [...playerPerfs].sort((a, b) => b.totalKills - a.totalKills);
  const deathsRank = [...playerPerfs].sort((a, b) => b.totalDeaths - a.totalDeaths);
  const assistsRank = [...playerPerfs].sort((a, b) => b.totalAssists - a.totalAssists);
  const csRank = [...playerPerfs].sort((a, b) => b.avgCsPerMin - a.avgCsPerMin);
  const kdaRank = [...playerPerfs].sort((a, b) => b.kda - a.kda);
  const visionRank = [...playerPerfs].sort(
    (a, b) => b.avgVisionScore - a.avgVisionScore || b.totalVisionScore - a.totalVisionScore
  );
  const pinkRank = [...playerPerfs].sort(
    (a, b) => b.totalControlWards - a.totalControlWards || b.avgControlWards - a.avgControlWards
  );

  // Aggregate stats
  const totalPlayers = players.length;
  const totalGames = players.reduce((acc, p) => acc + p.stats.totalGames, 0);
  const avgWinrate =
    totalPlayers > 0
      ? (players.reduce((acc, p) => acc + p.stats.winRate, 0) / totalPlayers).toFixed(1)
      : '0';

  const roles: { id: LoLRole | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'TODOS' },
    { id: 'TOP', label: 'TOP' },
    { id: 'JNG', label: 'JNG' },
    { id: 'MID', label: 'MID' },
    { id: 'ADC', label: 'ADC' },
    { id: 'SUP', label: 'SUP' },
  ];

  // 1. Calculate Champion Winrates across all participants
  const champAggMap = new Map<string, {
    championName: string;
    championId?: number;
    games: number;
    wins: number;
    playerWins: Map<string, { player: Player; wins: number }>;
  }>();

  for (const p of filteredPlayers) {
    const topC = p.stats.topChampions || [];
    const recM = p.stats.recentMatches || [];

    if (topC.length > 0) {
      for (const tc of topC) {
        const existing = champAggMap.get(tc.championName) || {
          championName: tc.championName,
          championId: tc.championId,
          games: 0,
          wins: 0,
          playerWins: new Map(),
        };
        existing.games += tc.games;
        existing.wins += tc.wins;
        const curPw = existing.playerWins.get(p.id) || { player: p, wins: 0 };
        curPw.wins += tc.wins;
        existing.playerWins.set(p.id, curPw);
        champAggMap.set(tc.championName, existing);
      }
    } else if (recM.length > 0) {
      for (const m of recM) {
        const existing = champAggMap.get(m.championName) || {
          championName: m.championName,
          championId: m.championId,
          games: 0,
          wins: 0,
          playerWins: new Map(),
        };
        existing.games += 1;
        if (m.win) existing.wins += 1;
        const curPw = existing.playerWins.get(p.id) || { player: p, wins: 0 };
        if (m.win) curPw.wins += 1;
        existing.playerWins.set(p.id, curPw);
        champAggMap.set(m.championName, existing);
      }
    } else {
      const defaultChamps: Record<LoLRole, string> = {
        TOP: 'Aatrox',
        JNG: 'LeeSin',
        MID: 'Ahri',
        ADC: 'Jinx',
        SUP: 'Thresh',
      };
      const champ = defaultChamps[p.primaryRole] || 'Ahri';
      const existing = champAggMap.get(champ) || {
        championName: champ,
        games: 0,
        wins: 0,
        playerWins: new Map(),
      };
      const pGames = Math.max(1, p.stats.totalGames || 10);
      const pWins = p.stats.wins || Math.round(pGames * 0.55);
      existing.games += pGames;
      existing.wins += pWins;
      const curPw = existing.playerWins.get(p.id) || { player: p, wins: 0 };
      curPw.wins += pWins;
      existing.playerWins.set(p.id, curPw);
      champAggMap.set(champ, existing);
    }
  }

  const MIN_CHAMPION_GAMES_THRESHOLD = 15;

  const champWinrates: TournamentChampStat[] = Array.from(champAggMap.values())
    .filter((c) => c.games >= MIN_CHAMPION_GAMES_THRESHOLD)
    .map((c) => {
      const wr = c.games > 0 ? Number(((c.wins / c.games) * 100).toFixed(1)) : 0;
      let bestP: Player | undefined;
      let maxW = -1;
      c.playerWins.forEach((val) => {
        if (val.wins > maxW) {
          maxW = val.wins;
          bestP = val.player;
        }
      });
      return {
        championName: c.championName,
        championId: c.championId,
        games: c.games,
        wins: c.wins,
        winRate: wr,
        bestPlayerName: bestP?.displayName,
        bestPlayer: bestP,
      };
    })
    .sort((a, b) => b.winRate - a.winRate || b.games - a.games);

  // 2. Calculate OTP (One-Trick Pony) Ranking
  const otpRankings: PlayerOTPStat[] = filteredPlayers
    .map((p) => {
      const topC = p.stats.topChampions || [];
      const recM = p.stats.recentMatches || [];
      let mainChamp = 'Ahri';
      let mainChampGames = 0;
      const totalGames = Math.max(1, p.stats.totalGames || recM.length || 1);

      if (topC.length > 0) {
        mainChamp = topC[0].championName;
        mainChampGames = topC[0].games;
      } else if (recM.length > 0) {
        const freq = new Map<string, number>();
        recM.forEach((m) => freq.set(m.championName, (freq.get(m.championName) || 0) + 1));
        let maxF = 0;
        freq.forEach((cnt, name) => {
          if (cnt > maxF) {
            maxF = cnt;
            mainChamp = name;
          }
        });
        mainChampGames = maxF;
      } else {
        const defaultChamps: Record<LoLRole, string> = {
          TOP: 'Aatrox',
          JNG: 'LeeSin',
          MID: 'Ahri',
          ADC: 'Jinx',
          SUP: 'Thresh',
        };
        mainChamp = defaultChamps[p.primaryRole] || 'Ahri';
        mainChampGames = Math.round(totalGames * 0.65);
      }

      const otpPercentage = Math.min(100, Number(((mainChampGames / totalGames) * 100).toFixed(1)));
      return {
        player: p,
        mainChampion: mainChamp,
        champGames: mainChampGames,
        totalGames,
        otpPercentage,
      };
    })
    .sort((a, b) => b.otpPercentage - a.otpPercentage || b.champGames - a.champGames);

  const top1Champ = champWinrates[0];
  const restChamps = champWinrates.slice(1, 5);

  const top1Otp = otpRankings[0];
  const restOtps = otpRankings.slice(1, 5);

  const top1Vision = visionRank[0];
  const restVision = visionRank.slice(1, 5);

  const top1Pink = pinkRank[0];
  const restPink = pinkRank.slice(1, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#080c14] border border-slate-700/80 rounded-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col my-auto shadow-cyan-950/30">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 sm:py-5 border-b border-slate-800 bg-[#060910] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-lime-500/10 text-lime-400 border border-lime-500/30 shadow-sm">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">
                Estadísticas Oficiales del Torneo
              </h3>
              <p className="text-xs text-slate-400">
                Récords de Mayor ELO, Kills, Farmeo, KDA, Meta de Campeones y One-Trick Ponies
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-6 sm:p-7 space-y-7 overflow-y-auto overflow-x-hidden flex-1">
          {/* Top Quick Bar & Role Filters */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#0c121e] p-3.5 rounded-2xl border border-slate-800">
            {/* Global quick numbers */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Jugadores:</span>
                <span className="font-bold text-white font-mono">{totalPlayers}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-700" />
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Partidas Totales:</span>
                <span className="font-bold text-cyan-400 font-mono">{totalGames}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-700" />
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Winrate Promedio:</span>
                <span className="font-bold text-emerald-400 font-mono">{avgWinrate}%</span>
              </div>
            </div>

            {/* Role Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-[#070a12] p-1 rounded-xl border border-slate-800 shrink-0 overflow-x-auto">
              {roles.map((r) => {
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#c6f135] text-black shadow-md shadow-[#c6f135]/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {r.id !== 'ALL' && <RoleIcon role={r.id as LoLRole} size={14} />}
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 1. MAYOR ELO / MÁS LP SECTION (Podium Showcase) */}
          <div className="bg-[#0b101c] border border-amber-500/30 rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg shadow-amber-950/10">
            <div className="text-center space-y-0.5">
              <h4 className="text-sm font-black tracking-widest text-amber-400 uppercase font-display flex items-center justify-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>MAYOR ELO / MÁS LP</span>
                <Crown className="w-4 h-4 text-amber-400" />
              </h4>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Líderes de Clasificación y Puntos de Liga (SoloQ)
              </p>
            </div>

            {eloRank.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                No hay jugadores registrados en esta posición.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
                {eloRank.slice(0, 4).map((perf, index) => {
                  const p = perf.player;
                  const rankNumber = index + 1;
                  const tierColor = getTierColorClass(p.stats.tier);
                  const isTop1 = rankNumber === 1;

                  return (
                    <div
                      key={p.id}
                      onClick={() => onSelectPlayer(p)}
                      className={`bg-[#070b13] hover:bg-[#0e1526] border ${
                        isTop1 ? 'border-amber-500/50 shadow-neon-gold' : 'border-slate-800/80 hover:border-amber-500/40'
                      } p-4 rounded-2xl transition-all cursor-pointer flex flex-col items-center text-center relative group`}
                    >
                      {/* Rank number top left */}
                      <span className="absolute top-3 left-3 text-xs font-mono font-bold text-slate-500 group-hover:text-amber-400">
                        #{rankNumber}
                      </span>

                      {/* Avatar with top-right position badge */}
                      <div className="relative mb-2 mt-1">
                        <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${
                          isTop1 ? 'border-amber-400' : 'border-slate-700 group-hover:border-amber-400'
                        } transition-colors shadow-inner`}>
                          <img
                            src={p.avatarUrl || getProfileIconUrl(p.profileIconId)}
                            alt={p.displayName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full ${
                          isTop1 ? 'bg-amber-400 text-black' : 'bg-[#c6f135] text-black'
                        } font-black text-xs flex items-center justify-center shadow-md font-mono border-2 border-[#070b13]`}>
                          {rankNumber}
                        </div>
                      </div>

                      {/* Name */}
                      <h5 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate max-w-[120px]">
                        {p.displayName}
                      </h5>

                      {/* Tier Tag */}
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 ${tierColor.badgeBg}`}
                      >
                        {p.stats.tier} {p.stats.division}
                      </span>

                      {/* LP / MMR Value */}
                      <div className="mt-2 text-center">
                        <span className={`text-xl font-black font-mono ${tierColor.text} block`}>
                          {p.stats.leaguePoints} LP
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {p.stats.wins}V · {p.stats.losses}D ({p.stats.winRate}% WR)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. 4 Category Columns Grid (KILLS, MUERTES, ASISTENCIAS, CS/MIN) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* 1. KILLS */}
            <CategoryRankingCard
              title="KILLS"
              subtitle="MÁS ASESINATOS"
              unitLabel="Kills Totales"
              rankings={killsRank}
              valueFormatter={(p) => p.totalKills.toLocaleString()}
              averageFormatter={(p) => `${p.avgKills} por partida`}
              onSelectPlayer={(p) => onSelectPlayer(p)}
            />

            {/* 2. MUERTES */}
            <CategoryRankingCard
              title="MUERTES"
              subtitle="MÁS VECES ELIMINADO"
              unitLabel="Muertes Totales"
              rankings={deathsRank}
              valueFormatter={(p) => p.totalDeaths.toLocaleString()}
              averageFormatter={(p) => `${p.avgDeaths} por partida`}
              onSelectPlayer={(p) => onSelectPlayer(p)}
            />

            {/* 3. ASISTENCIAS */}
            <CategoryRankingCard
              title="ASISTENCIAS"
              subtitle="MÁS ASISTENCIAS"
              unitLabel="Asistencias Totales"
              rankings={assistsRank}
              valueFormatter={(p) => p.totalAssists.toLocaleString()}
              averageFormatter={(p) => `${p.avgAssists} por partida`}
              onSelectPlayer={(p) => onSelectPlayer(p)}
            />

            {/* 4. CS/MIN */}
            <CategoryRankingCard
              title="CS/MIN"
              subtitle="FARMEO POR MINUTO"
              unitLabel="CS / minuto"
              rankings={csRank}
              valueFormatter={(p) => `${p.avgCsPerMin.toFixed(2)}`}
              averageFormatter={(p) => `${p.avgCsPerMin.toFixed(2)} CS / min`}
              onSelectPlayer={(p) => onSelectPlayer(p)}
            />
          </div>

          {/* 3. NEW SECTION: META DE CAMPEONES & ONE-TRICK PONIES (2 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            {/* CARD 1: CAMPEÓN CON MAYOR WINRATE */}
            <div className="bg-[#0b101c] border border-emerald-500/30 rounded-2xl p-5 space-y-4 shadow-lg shadow-emerald-950/10">
              <div className="text-center border-b border-slate-800/80 pb-3">
                <h4 className="text-sm font-black tracking-widest text-emerald-400 uppercase font-display flex items-center justify-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span>CAMPEÓN CON MAYOR WINRATE</span>
                  <Target className="w-4 h-4 text-emerald-400" />
                </h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  El campeón más letal del torneo (Mínimo 15 partidas)
                </p>
              </div>

              {top1Champ ? (
                <div className="space-y-4">
                  {/* Top 1 Champion Spotlight */}
                  <div
                    onClick={() => {
                      if (top1Champ.bestPlayer) {
                        onClose();
                        onSelectPlayer(top1Champ.bestPlayer, top1Champ.championName);
                      }
                    }}
                    className="bg-[#070b13] hover:bg-[#0e1526] border border-emerald-500/40 p-4 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-4 group shadow-sm"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="relative shrink-0">
                        <img
                          src={getChampionIconUrl(top1Champ.championName)}
                          alt={top1Champ.championName}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 shadow-md group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-400 text-black font-black text-[10px] flex items-center justify-center font-mono border-2 border-[#070b13]">
                          #1
                        </span>
                      </div>

                      <div>
                        <h5 className="text-sm font-black text-white group-hover:text-emerald-300 transition-colors">
                          {top1Champ.championName}
                        </h5>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {top1Champ.wins}V · {top1Champ.games - top1Champ.wins}D ({top1Champ.games} partidas)
                        </p>
                        {top1Champ.bestPlayerName && (
                          <span className="text-[10px] text-emerald-400/90 font-medium">
                            Mejor piloto: {top1Champ.bestPlayerName} (clic para ver historial)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-2xl font-black text-emerald-400 block group-hover:scale-105 transition-transform">
                        {top1Champ.winRate}%
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans font-bold uppercase">
                        Winrate
                      </span>
                    </div>
                  </div>

                  {/* Top 2 to 5 Champions List */}
                  <div className="space-y-1.5">
                    {restChamps.map((champ, idx) => (
                      <div
                        key={champ.championName}
                        onClick={() => {
                          if (champ.bestPlayer) {
                            onClose();
                            onSelectPlayer(champ.bestPlayer, champ.championName);
                          }
                        }}
                        className="bg-[#070b13] hover:bg-[#0e1526] border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono font-bold text-slate-500 w-4 text-center text-[11px]">
                            #{idx + 2}
                          </span>
                          <img
                            src={getChampionIconUrl(champ.championName)}
                            alt={champ.championName}
                            className="w-7 h-7 rounded-lg object-cover border border-slate-700 shrink-0"
                          />
                          <span className="font-semibold text-slate-200 group-hover:text-white truncate">
                            {champ.championName}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 font-mono">
                          <span className="text-[10px] text-slate-400">
                            {champ.games} partidas
                          </span>
                          <span className="font-black text-emerald-400 text-xs">
                            {champ.winRate}% WR
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-400 space-y-1.5">
                  <Target className="w-8 h-8 text-emerald-400/40 mx-auto mb-1" />
                  <p className="font-semibold text-slate-300">Mínimo 15 partidas requeridas</p>
                  <p className="text-slate-500 text-[11px]">
                    Ningún campeón ha alcanzado 15 partidas en SoloQ todavía.
                  </p>
                </div>
              )}
            </div>

            {/* CARD 2: EL "OTP" DEL TORNEO (ONE-TRICK PONY) */}
            <div className="bg-[#0b101c] border border-lime-500/30 rounded-2xl p-5 space-y-4 shadow-lg shadow-lime-950/10">
              <div className="text-center border-b border-slate-800/80 pb-3">
                <h4 className="text-sm font-black tracking-widest text-[#c6f135] uppercase font-display flex items-center justify-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#c6f135]" />
                  <span>EL "OTP" DEL TORNEO</span>
                  <Flame className="w-4 h-4 text-[#c6f135]" />
                </h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Mayor fidelidad y % de partidas con un solo campeón
                </p>
              </div>

              {top1Otp ? (
                <div className="space-y-4">
                  {/* Top 1 OTP Spotlight */}
                  <div
                    onClick={() => {
                      onClose();
                      onSelectPlayer(top1Otp.player, top1Otp.mainChampion);
                    }}
                    className="bg-[#070b13] hover:bg-[#0e1526] border border-[#c6f135]/40 p-4 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-4 group shadow-sm"
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Avatar with champion overlay */}
                      <div className="relative shrink-0">
                        <img
                          src={top1Otp.player.avatarUrl || getProfileIconUrl(top1Otp.player.profileIconId)}
                          alt={top1Otp.player.displayName}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-[#c6f135] shadow-md group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg overflow-hidden border border-[#070b13] shadow-md">
                          <img
                            src={getChampionIconUrl(top1Otp.mainChampion)}
                            alt={top1Otp.mainChampion}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-[#c6f135]" />
                          <h5 className="text-sm font-black text-white group-hover:text-[#c6f135] transition-colors">
                            {top1Otp.player.displayName}
                          </h5>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Especialista en <span className="text-slate-200 font-bold">{top1Otp.mainChampion}</span>
                        </p>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {top1Otp.champGames} de {top1Otp.totalGames} partidas jugadas
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-2xl font-black text-[#c6f135] block group-hover:scale-105 transition-transform">
                        {top1Otp.otpPercentage}%
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans font-bold uppercase">
                        Devoción OTP
                      </span>
                    </div>
                  </div>

                  {/* Top 2 to 5 OTPs List */}
                  <div className="space-y-1.5">
                    {restOtps.map((otp, idx) => (
                      <div
                        key={otp.player.id}
                        onClick={() => {
                          onClose();
                          onSelectPlayer(otp.player, otp.mainChampion);
                        }}
                        className="bg-[#070b13] hover:bg-[#0e1526] border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono font-bold text-slate-500 w-4 text-center text-[11px]">
                            #{idx + 2}
                          </span>
                          <div className="relative shrink-0">
                            <img
                              src={otp.player.avatarUrl || getProfileIconUrl(otp.player.profileIconId)}
                              alt={otp.player.displayName}
                              className="w-7 h-7 rounded-full object-cover border border-slate-700"
                            />
                          </div>
                          <div className="truncate min-w-0">
                            <span className="font-semibold text-slate-200 group-hover:text-white truncate block">
                              {otp.player.displayName}
                            </span>
                            <span className="text-[10px] text-slate-500 truncate block">
                              {otp.mainChampion} ({otp.champGames} partidas)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 font-mono">
                          <span className="font-black text-[#c6f135] text-xs">
                            {otp.otpPercentage}% OTP
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">Sin datos de OTP</div>
              )}
            </div>

          </div>

          {/* 4. NEW SECTION: CONTROL DE VISIÓN & WARDS (2 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            {/* CARD 1: EL OJO QUE TODO LO VE (MAYOR PUNTUACIÓN DE VISIÓN) */}
            <div className="bg-[#0b101c] border border-cyan-500/30 rounded-2xl p-5 space-y-4 shadow-lg shadow-cyan-950/10">
              <div className="text-center border-b border-slate-800/80 pb-3">
                <h4 className="text-sm font-black tracking-widest text-cyan-400 uppercase font-display flex items-center justify-center gap-1.5">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>"EL OJO QUE TODO LO VE"</span>
                  <Eye className="w-4 h-4 text-cyan-400" />
                </h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Mayor Puntuación de Visión y Control de Mapa (Vision Score)
                </p>
              </div>

              {top1Vision ? (
                <div className="space-y-4">
                  {/* Top 1 Vision Spotlight */}
                  <div
                    onClick={() => onSelectPlayer(top1Vision.player)}
                    className="bg-[#070b13] hover:bg-[#0e1526] border border-cyan-500/40 p-4 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-4 group shadow-sm"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="relative shrink-0">
                        <img
                          src={top1Vision.player.avatarUrl || getProfileIconUrl(top1Vision.player.profileIconId)}
                          alt={top1Vision.player.displayName}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-400 shadow-md group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-cyan-400 text-black font-black text-[10px] flex items-center justify-center font-mono border-2 border-[#070b13]">
                          #1
                        </span>
                        <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-slate-900 border border-slate-700">
                          <RoleIcon role={top1Vision.player.primaryRole} size={12} />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-cyan-400" />
                          <h5 className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors">
                            {top1Vision.player.displayName}
                          </h5>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {top1Vision.totalVisionScore.toLocaleString()} pts de visión acumulados
                        </p>
                        <span className="text-[10px] text-cyan-400/90 font-mono">
                          Rol {top1Vision.player.primaryRole} • {top1Vision.totalGames} partidas
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-2xl font-black text-cyan-400 block group-hover:scale-105 transition-transform">
                        {top1Vision.avgVisionScore}
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans font-bold uppercase">
                        Visión / game
                      </span>
                    </div>
                  </div>

                  {/* Top 2 to 5 Vision List */}
                  <div className="space-y-1.5">
                    {restVision.map((perf, idx) => (
                      <div
                        key={perf.player.id}
                        onClick={() => onSelectPlayer(perf.player)}
                        className="bg-[#070b13] hover:bg-[#0e1526] border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono font-bold text-slate-500 w-4 text-center text-[11px]">
                            #{idx + 2}
                          </span>
                          <div className="relative shrink-0">
                            <img
                              src={perf.player.avatarUrl || getProfileIconUrl(perf.player.profileIconId)}
                              alt={perf.player.displayName}
                              className="w-7 h-7 rounded-full object-cover border border-slate-700"
                            />
                            <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-slate-900 border border-slate-700">
                              <RoleIcon role={perf.player.primaryRole} size={9} />
                            </div>
                          </div>
                          <div className="truncate min-w-0">
                            <span className="font-semibold text-slate-200 group-hover:text-white truncate block">
                              {perf.player.displayName}
                            </span>
                            <span className="text-[10px] text-slate-500 truncate block">
                              {perf.totalVisionScore.toLocaleString()} pts totales
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 font-mono">
                          <span className="font-black text-cyan-400 text-xs">
                            {perf.avgVisionScore} / game
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">Sin datos de visión</div>
              )}
            </div>

            {/* CARD 2: COMPRADOR COMPULSIVO DE PINKS */}
            <div className="bg-[#0b101c] border border-pink-500/30 rounded-2xl p-5 space-y-4 shadow-lg shadow-pink-950/10">
              <div className="text-center border-b border-slate-800/80 pb-3">
                <h4 className="text-sm font-black tracking-widest text-pink-400 uppercase font-display flex items-center justify-center gap-1.5">
                  <Coins className="w-4 h-4 text-pink-400" />
                  <span>COMPRADOR COMPULSIVO DE PINKS</span>
                  <Coins className="w-4 h-4 text-pink-400" />
                </h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Mayor Cantidad de Wards de Control y Oro Gastado en Visión
                </p>
              </div>

              {top1Pink ? (
                <div className="space-y-4">
                  {/* Top 1 Pink Spotlight */}
                  <div
                    onClick={() => onSelectPlayer(top1Pink.player)}
                    className="bg-[#070b13] hover:bg-[#0e1526] border border-pink-500/40 p-4 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-4 group shadow-sm"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="relative shrink-0">
                        <img
                          src={top1Pink.player.avatarUrl || getProfileIconUrl(top1Pink.player.profileIconId)}
                          alt={top1Pink.player.displayName}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-pink-400 shadow-md group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-pink-400 text-black font-black text-[10px] flex items-center justify-center font-mono border-2 border-[#070b13]">
                          #1
                        </span>
                        <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-slate-900 border border-slate-700">
                          <RoleIcon role={top1Pink.player.primaryRole} size={12} />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-pink-400" />
                          <h5 className="text-sm font-black text-white group-hover:text-pink-300 transition-colors">
                            {top1Pink.player.displayName}
                          </h5>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          <span className="text-pink-300 font-bold">{top1Pink.totalControlWards} Pink Wards</span> comprados
                        </p>
                        <span className="text-[10px] text-amber-300 font-mono">
                          💰 {top1Pink.totalPinkGoldSpent.toLocaleString()}g de oro invertido
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-2xl font-black text-pink-400 block group-hover:scale-105 transition-transform">
                        {top1Pink.avgControlWards}
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans font-bold uppercase">
                        Pinks / game
                      </span>
                    </div>
                  </div>

                  {/* Top 2 to 5 Pink List */}
                  <div className="space-y-1.5">
                    {restPink.map((perf, idx) => (
                      <div
                        key={perf.player.id}
                        onClick={() => onSelectPlayer(perf.player)}
                        className="bg-[#070b13] hover:bg-[#0e1526] border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono font-bold text-slate-500 w-4 text-center text-[11px]">
                            #{idx + 2}
                          </span>
                          <div className="relative shrink-0">
                            <img
                              src={perf.player.avatarUrl || getProfileIconUrl(perf.player.profileIconId)}
                              alt={perf.player.displayName}
                              className="w-7 h-7 rounded-full object-cover border border-slate-700"
                            />
                            <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-slate-900 border border-slate-700">
                              <RoleIcon role={perf.player.primaryRole} size={9} />
                            </div>
                          </div>
                          <div className="truncate min-w-0">
                            <span className="font-semibold text-slate-200 group-hover:text-white truncate block">
                              {perf.player.displayName}
                            </span>
                            <span className="text-[10px] text-slate-500 truncate block">
                              {perf.totalControlWards} pinks ({perf.totalPinkGoldSpent.toLocaleString()}g oro)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 font-mono">
                          <span className="font-black text-pink-400 text-xs">
                            {perf.avgControlWards} / game
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">Sin datos de control wards</div>
              )}
            </div>

          </div>

          {/* 5. KDA Podium Section */}
          <div className="bg-[#0b101c] border border-slate-800/90 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="text-center space-y-0.5">
              <h4 className="text-sm font-black tracking-widest text-[#c6f135] uppercase font-display flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#c6f135]" />
                <span>KDA</span>
                <Sparkles className="w-4 h-4 text-[#c6f135]" />
              </h4>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Kills + Asistencias / Muertes
              </p>
            </div>

            {kdaRank.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                No hay jugadores registrados en esta posición.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
                {kdaRank.slice(0, 4).map((perf, index) => {
                  const p = perf.player;
                  const rankNumber = index + 1;
                  return (
                    <div
                      key={p.id}
                      onClick={() => onSelectPlayer(p)}
                      className="bg-[#070b13] hover:bg-[#0e1526] border border-slate-800/80 hover:border-lime-500/40 p-4 rounded-2xl transition-all cursor-pointer flex flex-col items-center text-center relative group shadow-sm hover:shadow-lime-950/20"
                    >
                      {/* Rank number left badge */}
                      <span className="absolute top-3 left-3 text-xs font-mono font-bold text-slate-500 group-hover:text-lime-400">
                        #{rankNumber}
                      </span>

                      {/* Avatar with level/rank badge */}
                      <div className="relative mb-2 mt-1">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-700 group-hover:border-[#c6f135] transition-colors shadow-inner">
                          <img
                            src={p.avatarUrl || getProfileIconUrl(p.profileIconId)}
                            alt={p.displayName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* Number badge on top right */}
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#c6f135] text-black font-black text-xs flex items-center justify-center shadow-md font-mono border-2 border-[#070b13]">
                          {rankNumber}
                        </div>
                      </div>

                      {/* Name */}
                      <h5 className="text-xs font-bold text-white group-hover:text-[#c6f135] transition-colors truncate max-w-[120px]">
                        {p.displayName}
                      </h5>

                      {/* KDA Value */}
                      <div className="mt-2 text-center">
                        <span className="text-2xl font-black font-mono text-[#c6f135] block">
                          {perf.kda.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {perf.totalGames} partidas ({perf.winRate}% WR)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#060910] border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// Sub-component for individual column ranking (Kills, Deaths, Assists, CS/Min)
interface CategoryRankingCardProps {
  title: string;
  subtitle: string;
  unitLabel: string;
  rankings: PlayerPerf[];
  valueFormatter: (perf: PlayerPerf) => string;
  averageFormatter?: (perf: PlayerPerf) => string;
  onSelectPlayer: (player: Player) => void;
}

const CategoryRankingCard: React.FC<CategoryRankingCardProps> = ({
  title,
  subtitle,
  unitLabel,
  rankings,
  valueFormatter,
  averageFormatter,
  onSelectPlayer,
}) => {
  const top1 = rankings[0];
  const rest = rankings.slice(1, 5);

  return (
    <div className="bg-[#0b101c] border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
      {/* Category Title */}
      <div className="text-center border-b border-slate-800/80 pb-3">
        <h4 className="text-sm font-black tracking-widest text-[#c6f135] uppercase font-display">
          {title}
        </h4>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          {subtitle}
        </span>
      </div>

      {/* TOP 1 Hero Spotlight */}
      {top1 ? (
        <div
          onClick={() => onSelectPlayer(top1.player)}
          className="bg-[#070b13] hover:bg-[#0e1526] border border-slate-800 hover:border-lime-500/40 p-3.5 rounded-2xl transition-all cursor-pointer flex flex-col items-center text-center relative group shadow-sm"
        >
          <span className="absolute top-2.5 left-3 text-xs font-mono font-bold text-slate-500">
            #1
          </span>

          {/* Avatar with yellow level badge */}
          <div className="relative mb-1.5">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-700 group-hover:border-[#c6f135] transition-colors shadow-inner">
              <img
                src={top1.player.avatarUrl || getProfileIconUrl(top1.player.profileIconId)}
                alt={top1.player.displayName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#c6f135] text-black font-black text-xs flex items-center justify-center shadow-md font-mono border-2 border-[#070b13]">
              1
            </div>
          </div>

          <h5 className="text-xs font-bold text-white group-hover:text-[#c6f135] transition-colors truncate max-w-[120px]">
            {top1.player.displayName}
          </h5>

          <div className="mt-2 text-center">
            <span className="text-2xl font-black font-mono text-white group-hover:text-[#c6f135] transition-colors block">
              {valueFormatter(top1)}
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">
              {unitLabel}
            </span>
            <div className="mt-1 space-y-0.5">
              {averageFormatter && (
                <span className="text-[10px] text-lime-400 font-mono block font-semibold">
                  Promedio: {averageFormatter(top1)}
                </span>
              )}
              <span className="text-[10px] text-slate-400 font-mono block">
                {top1.totalGames} partidas ({top1.winRate}% WR)
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-xs text-slate-500">Sin datos</div>
      )}

      {/* TOP 2 to 5 Compact List */}
      <div className="space-y-1.5 pt-1">
        {rest.map((perf, index) => {
          const rankNumber = index + 2;
          const p = perf.player;
          return (
            <div
              key={p.id}
              onClick={() => onSelectPlayer(p)}
              className="bg-[#070b13] hover:bg-[#0e1526] border border-slate-800 hover:border-slate-700 px-2.5 py-2 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono font-bold text-slate-500 w-4 text-center text-[11px]">
                  #{rankNumber}
                </span>
                <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-700 shrink-0">
                  <img
                    src={p.avatarUrl || getProfileIconUrl(p.profileIconId)}
                    alt={p.displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="truncate min-w-0">
                  <span className="font-semibold text-slate-200 group-hover:text-white truncate block">
                    {p.displayName}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono block">
                    {perf.totalGames} partidas · {perf.winRate}% WR
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0 font-mono">
                <span className="font-black text-[#c6f135] text-xs">
                  {valueFormatter(perf)}
                </span>
                {averageFormatter && (
                  <span className="text-[9px] text-slate-400 font-sans">
                    {perf.avgCsPerMin ? `${perf.avgCsPerMin} /m` : `${averageFormatter(perf)}`}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
