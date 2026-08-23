import React from 'react';
import { Player, TournamentConfig } from '../types';
import { getProfileIconUrl, getCountryFlagUrl, getTierColorClass, getOpGgUrl } from '../data/ddragon';
import { RoleIcon } from './RoleIcon';
import { PlayerAvatar } from './PlayerAvatar';
import { Trophy, Flame, Swords, ExternalLink, KeyRound, AlertCircle } from 'lucide-react';

interface HeroSectionProps {
  config: TournamentConfig;
  players: Player[];
  onOpenRules: () => void;
  onOpenAddPlayer: () => void;
  onOpenSettings: () => void;
  onSelectPlayer: (player: Player) => void;
  hasApiKey: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  config,
  players,
  onOpenRules,
  onOpenAddPlayer,
  onOpenSettings,
  onSelectPlayer,
  hasApiKey,
}) => {
  // Top 3 players
  const top1 = players[0];
  const top2 = players[1];
  const top3 = players[2];

  // Tournament aggregate stats
  const totalGames = players.reduce((acc, p) => acc + p.stats.totalGames, 0);
  const avgWinRate = players.length > 0
    ? (players.reduce((acc, p) => acc + p.stats.winRate, 0) / players.length).toFixed(1)
    : '0';
  const hotStreakPlayers = players.filter((p) => p.stats.hotStreak).length;

  return (
    <div className="relative overflow-hidden pt-8 pb-12">
      {/* Background ambient lighting glows */}
      <div className="absolute top-0 left-1/4 -z-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -z-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Title and Description */}
        <div className="pb-2">
          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-display">
              {config.name}
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl">
              {config.tagline} • Sigue la carrera de SoloQ, LP, winrate y partidas en tiempo real.
            </p>
          </div>
        </div>

        {/* Global Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="glass-card rounded-2xl p-4 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Participantes</span>
              <Trophy className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-black font-display text-white mt-2">
              {players.length} <span className="text-xs font-normal text-slate-400">cuentas</span>
            </p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Partidas Totales</span>
              <Swords className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-black font-display text-white mt-2">
              {totalGames} <span className="text-xs font-normal text-slate-400">partidas</span>
            </p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Winrate Promedio</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black font-display text-white mt-2">
              {avgWinRate}% <span className="text-xs font-normal text-slate-400">promedio</span>
            </p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>En Racha de Victoria</span>
              <Flame className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-2xl font-black font-display text-white mt-2">
              {hotStreakPlayers} <span className="text-xs font-normal text-slate-400">on fire 🔥</span>
            </p>
          </div>
        </div>

        {/* Empty state or Podium */}
        {players.length === 0 ? (
          <div className="mt-6 bg-[#0c121e] border border-cyan-500/30 rounded-2xl p-8 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 mx-auto flex items-center justify-center shadow-neon-cyan">
              <Trophy className="w-8 h-8 text-cyan-400" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-xl font-black text-white font-display">¡El torneo está listo para comenzar!</h3>
              <p className="text-xs text-slate-400">
                Añade tu cuenta de Riot Games o la de tus amigos para empezar a registrar los rangos, LP y estadísticas en vivo.
              </p>
            </div>
            <button
              onClick={onOpenAddPlayer}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition-all shadow-neon-cyan"
            >
              + Añadir Primera Cuenta
            </button>
          </div>
        ) : players.length >= 3 && (
          <div className="mt-8 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Podio de Líderes</span>
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={onOpenRules}
                  className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition-colors"
                >
                  Ver Normas y Premios
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-end">
              {/* 2nd Place (Silver) */}
              <div
                onClick={() => onSelectPlayer(top2)}
                className="order-2 md:order-1 glass-card rounded-2xl p-5 border border-slate-700/60 hover:border-slate-500 transition-all cursor-pointer group hover:scale-[1.02] relative"
              >
                <div className="absolute top-3 right-3 text-xs font-black font-display text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-600">
                  #2 SEGUNDO LUGAR
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <PlayerAvatar
                    profileIconId={top2.profileIconId}
                    avatarUrl={top2.avatarUrl}
                    countryCode={top2.countryCode}
                    displayName={top2.displayName}
                    size="lg"
                  />
                  <div>
                    <h4 className="font-display font-bold text-lg text-white group-hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                      {top2.displayName}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                      {top2.gameName}#{top2.tagLine}
                    </p>
                  </div>
                </div>

                <div className="bg-[#0b101c] p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className={`text-sm font-extrabold block ${getTierColorClass(top2.stats.tier).text}`}>
                      {top2.stats.tier} {top2.stats.division}
                    </span>
                    <span className="text-xs text-slate-400 font-mono font-semibold">
                      {top2.stats.leaguePoints} LP
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-400 block">{top2.stats.winRate}% WR</span>
                    <span className="text-xs text-slate-500 font-mono">
                      {top2.stats.wins}V - {top2.stats.losses}D
                    </span>
                  </div>
                </div>
              </div>

              {/* 1st Place (Gold) - Elevated & Highlighted */}
              <div
                onClick={() => onSelectPlayer(top1)}
                className="order-1 md:order-2 glass-card rounded-2xl p-6 border-2 border-amber-500/70 hover:border-amber-400 transition-all cursor-pointer group hover:scale-[1.03] relative shadow-neon-gold bg-gradient-to-b from-[#1c180e] via-[#111722] to-[#0a0d14] md:-translate-y-3"
              >
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black font-display font-black text-xs px-4 py-1 rounded-full shadow-lg flex items-center gap-1.5 uppercase tracking-wider">
                  <Trophy className="w-3.5 h-3.5 fill-black" />
                  <span>#1 LÍDER DEL TORNEO</span>
                </div>

                <div className="flex items-center gap-4 mb-4 mt-2">
                  <PlayerAvatar
                    profileIconId={top1.profileIconId}
                    avatarUrl={top1.avatarUrl}
                    countryCode={top1.countryCode}
                    displayName={top1.displayName}
                    size="xl"
                  />
                  <div>
                    <h4 className="font-display font-black text-xl text-white group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                      {top1.displayName}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                      {top1.gameName}#{top1.tagLine}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {top1.primaryRole}
                      </span>
                      {top1.stats.hotStreak && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 flex items-center gap-0.5">
                          <Flame className="w-3 h-3" /> RACHA
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-[#14120a]/80 p-3.5 rounded-xl border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <span className={`text-base font-black block ${getTierColorClass(top1.stats.tier).text}`}>
                      {top1.stats.tier} {top1.stats.division}
                    </span>
                    <span className="text-xs text-amber-300 font-mono font-bold">
                      {top1.stats.leaguePoints} LP
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-emerald-400 block">{top1.stats.winRate}% WR</span>
                    <span className="text-xs text-slate-400 font-mono">
                      {top1.stats.wins}V - {top1.stats.losses}D
                    </span>
                  </div>
                </div>
              </div>

              {/* 3rd Place (Bronze) */}
              <div
                onClick={() => onSelectPlayer(top3)}
                className="order-3 md:order-3 glass-card rounded-2xl p-5 border border-amber-800/50 hover:border-amber-700 transition-all cursor-pointer group hover:scale-[1.02] relative"
              >
                <div className="absolute top-3 right-3 text-xs font-black font-display text-amber-600 bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-800/60">
                  #3 TERCER LUGAR
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <PlayerAvatar
                    profileIconId={top3.profileIconId}
                    avatarUrl={top3.avatarUrl}
                    countryCode={top3.countryCode}
                    displayName={top3.displayName}
                    size="lg"
                  />
                  <div>
                    <h4 className="font-display font-bold text-lg text-white group-hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                      {top3.displayName}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                      {top3.gameName}#{top3.tagLine}
                    </p>
                  </div>
                </div>

                <div className="bg-[#0b101c] p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className={`text-sm font-extrabold block ${getTierColorClass(top3.stats.tier).text}`}>
                      {top3.stats.tier} {top3.stats.division}
                    </span>
                    <span className="text-xs text-slate-400 font-mono font-semibold">
                      {top3.stats.leaguePoints} LP
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-400 block">{top3.stats.winRate}% WR</span>
                    <span className="text-xs text-slate-500 font-mono">
                      {top3.stats.wins}V - {top3.stats.losses}D
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
