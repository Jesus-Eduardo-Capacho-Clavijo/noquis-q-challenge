import React, { useState, useMemo } from 'react';
import { Player, LoLRole } from '../types';
import {
  getProfileIconUrl,
  getCountryFlagUrl,
  getTierColorClass,
  getOpGgUrl,
  getChampionIconUrl,
} from '../data/ddragon';
import { RoleIcon } from './RoleIcon';
import { PlayerAvatar } from './PlayerAvatar';
import {
  Search,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Trash2,
  Edit2,
  RefreshCw,
  SlidersHorizontal,
  Flame,
  Users,
  Radio,
} from 'lucide-react';

interface LeaderboardProps {
  players: Player[];
  isAdmin?: boolean;
  onSelectPlayer: (player: Player) => void;
  onOpenLiveGame?: (player: Player) => void;
  onEditPlayer: (player: Player) => void;
  onDeletePlayer: (player: Player) => void;
  onRefreshPlayer: (playerId: string) => void;
  refreshingPlayerId: string | null;
}

type SortField = 'MMR' | 'TREND' | 'WINRATE' | 'GAMES' | 'WINS';

export const Leaderboard: React.FC<LeaderboardProps> = ({
  players,
  isAdmin = false,
  onSelectPlayer,
  onOpenLiveGame,
  onEditPlayer,
  onDeletePlayer,
  onRefreshPlayer,
  refreshingPlayerId,
}) => {
  const [selectedRole, setSelectedRole] = useState<LoLRole | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('MMR');

  // Filter and Sort players
  const filteredPlayers = useMemo(() => {
    return players
      .filter((player) => {
        // Role filter
        if (selectedRole !== 'ALL' && player.primaryRole !== selectedRole) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesName = player.displayName.toLowerCase().includes(query);
          const matchesGameName = player.gameName.toLowerCase().includes(query);
          const matchesTag = player.tagLine.toLowerCase().includes(query);
          const matchesRiotId = `${player.gameName}#${player.tagLine}`.toLowerCase().includes(query);
          return matchesName || matchesGameName || matchesTag || matchesRiotId;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortField) {
          case 'TREND':
            return b.stats.trend - a.stats.trend || b.stats.calculatedMMR - a.stats.calculatedMMR;
          case 'WINRATE':
            return b.stats.winRate - a.stats.winRate;
          case 'GAMES':
            return b.stats.totalGames - a.stats.totalGames;
          case 'WINS':
            return b.stats.wins - a.stats.wins;
          case 'MMR':
          default:
            return b.stats.calculatedMMR - a.stats.calculatedMMR;
        }
      });
  }, [players, selectedRole, searchQuery, sortField]);

  const rolesList: { role: LoLRole | 'ALL'; label: string }[] = [
    { role: 'ALL', label: 'Todos' },
    { role: 'TOP', label: 'Top' },
    { role: 'JNG', label: 'Jungle' },
    { role: 'MID', label: 'Mid' },
    { role: 'ADC', label: 'ADC' },
    { role: 'SUP', label: 'Support' },
  ];

  return (
    <section id="ranking" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Controls & Filters Bar */}
      <div className="bg-[#0e1422]/90 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6 backdrop-blur-md shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Total Participants Badge */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#090d16] border border-slate-800/80 w-fit">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-300">
              Tabla General: <strong className="text-white">{players.length}</strong> {players.length === 1 ? 'jugador' : 'jugadores'}
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por jugador o Riot ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#080c14] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 hidden sm:block" />
            <span className="text-xs text-slate-400 hidden sm:block font-medium">Ordenar por:</span>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="bg-[#080c14] border border-slate-700/80 text-white text-xs font-semibold rounded-xl px-3.5 py-2 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="MMR">Rango / LP (Default)</option>
              <option value="TREND">🚀 Mayor Subida de LP (El Trepador)</option>
              <option value="WINRATE">Mayor Winrate %</option>
              <option value="WINS">Más Victorias</option>
              <option value="GAMES">Más Partidas</option>
            </select>
          </div>
        </div>

        {/* Roles Filter Buttons with Official LoL Icons */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
            Rol:
          </span>
          {rolesList.map(({ role, label }) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedRole === role
                  ? 'bg-cyan-500 text-black shadow-neon-cyan'
                  : 'bg-[#090d16] text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              <RoleIcon
                role={role}
                size={18}
                className={selectedRole === role ? 'brightness-0' : 'brightness-125'}
              />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-800/90 bg-[#080b12] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-4 w-16 text-center">#</th>
                <th className="py-4 px-4">Jugador</th>
                <th className="py-4 px-4">ID de Riot</th>
                <th className="py-4 px-4 text-center">Rol</th>
                <th className="py-4 px-4">Elo / LP</th>
                <th className="py-4 px-4">Winrate (V / D)</th>
                <th className="py-4 px-4">Tendencia / Últimas</th>
                <th className="py-4 px-4 text-center">Stats</th>
                {isAdmin && <th className="py-4 px-3 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="py-12 text-center text-slate-500">
                    No hay jugadores que coincidan con la búsqueda o filtro de rol.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player, index) => {
                  const rankNumber = index + 1;
                  const tierClasses = getTierColorClass(player.stats.tier);
                  const isRefreshingThis = refreshingPlayerId === player.id;

                  return (
                    <tr
                      key={player.id}
                      className="table-row-hover group cursor-pointer"
                      onClick={() => onSelectPlayer(player)}
                    >
                      {/* Rank Position */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-xl font-display font-black text-sm ${
                            rankNumber === 1
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-neon-gold'
                              : rankNumber === 2
                              ? 'bg-slate-300/20 text-slate-200 border border-slate-400/50'
                              : rankNumber === 3
                              ? 'bg-amber-800/20 text-amber-600 border border-amber-800/50'
                              : 'text-slate-400 bg-slate-900/50'
                          }`}
                        >
                          {rankNumber}
                        </span>
                      </td>

                      {/* Player Profile & Country */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <PlayerAvatar
                            profileIconId={player.profileIconId}
                            avatarUrl={player.avatarUrl}
                            countryCode={player.countryCode}
                            displayName={player.displayName}
                            size="md"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-display font-bold text-sm text-white group-hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                                {player.displayName}
                                {player.stats.hotStreak && (
                                  <span title="¡En Racha!">
                                    <Flame className="w-3.5 h-3.5 text-red-500 animate-bounce" />
                                  </span>
                                )}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono block">
                              Nivel {player.summonerLevel || 30} • {player.region.toUpperCase()}
                            </span>

                            {/* Live Active Game Badge */}
                            {player.activeGame && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenLiveGame?.(player);
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 rounded-full bg-emerald-950/90 border border-emerald-500/70 text-emerald-300 text-[10px] font-bold tracking-wide hover:bg-emerald-900 transition-all shadow-sm shadow-emerald-950/50 hover:scale-105"
                                title="Clic para ver la partida en vivo y los 10 jugadores"
                              >
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="font-mono uppercase text-[9px] text-emerald-400 font-black">EN PARTIDA</span>
                                <span className="text-slate-600">•</span>
                                <img
                                  src={getChampionIconUrl(player.activeGame.playerChampion)}
                                  alt={player.activeGame.playerChampion}
                                  className="w-3.5 h-3.5 rounded object-cover"
                                />
                                <span className="text-white font-semibold">{player.activeGame.playerChampion}</span>
                                <span className="text-emerald-400/80 font-mono text-[9px]">({Math.floor(player.activeGame.gameLength / 60)}m)</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Riot ID */}
                      <td className="py-4 px-4 font-mono text-xs text-slate-300">
                        <span className="font-semibold text-white">{player.gameName}</span>
                        <span className="text-slate-500">#{player.tagLine}</span>
                      </td>

                      {/* Role with Official LoL Icon */}
                      <td className="py-4 px-4 text-center">
                        <div
                          className="inline-flex items-center justify-center p-1.5 rounded-lg bg-slate-900/80 border border-slate-800"
                          title={`Rol: ${player.primaryRole}`}
                        >
                          <RoleIcon role={player.primaryRole} size={20} />
                        </div>
                      </td>

                      {/* Elo / LP */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className={`text-xs uppercase tracking-wider ${tierClasses.text}`}>
                            {player.stats.tier} {player.stats.division}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-200">
                            {player.stats.leaguePoints} LP
                          </span>
                        </div>
                      </td>

                      {/* Winrate */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-black font-mono ${
                                player.stats.winRate >= 55
                                  ? 'text-emerald-400'
                                  : player.stats.winRate >= 50
                                  ? 'text-cyan-400'
                                  : 'text-amber-400'
                              }`}
                            >
                              {player.stats.winRate}%
                            </span>
                            {/* Winrate Mini Bar */}
                            <div className="w-16 h-1.5 bg-red-950/60 rounded-full overflow-hidden flex">
                              <div
                                className="bg-emerald-500 h-full rounded-full"
                                style={{ width: `${player.stats.winRate}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {player.stats.wins}V · {player.stats.losses}D ({player.stats.totalGames})
                          </span>
                        </div>
                      </td>

                      {/* Trend & Last matches pills */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1.5">
                          <div
                            className={`flex items-center gap-1 text-xs font-mono font-bold ${
                              player.stats.trend >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {player.stats.trend >= 0 ? (
                              <TrendingUp className="w-3.5 h-3.5" />
                            ) : (
                              <TrendingDown className="w-3.5 h-3.5" />
                            )}
                            <span>{player.stats.trend >= 0 ? `+${player.stats.trend}` : player.stats.trend}</span>
                          </div>

                          {/* Last 5 matches mini pills */}
                          <div className="flex items-center gap-0.5">
                            {(player.stats.recentMatchesSummary || []).slice(0, 5).map((result, idx) => (
                              <span
                                key={idx}
                                className={`w-3 h-3 rounded-[3px] font-mono text-[8px] font-black flex items-center justify-center text-black ${
                                  result === 'W' ? 'bg-emerald-400' : 'bg-red-500'
                                }`}
                                title={result === 'W' ? 'Victoria' : 'Derrota'}
                              >
                                {result}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* OP.GG and Live Game button */}
                      <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {player.activeGame && (
                            <button
                              onClick={() => onOpenLiveGame?.(player)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 hover:bg-emerald-400 hover:text-black text-emerald-300 border border-emerald-500/40 transition-all shadow-sm shadow-emerald-950/20 animate-pulse"
                              title="Ver partida en curso en vivo (10 jugadores)"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              <span>En Vivo</span>
                            </button>
                          )}
                          <a
                            href={getOpGgUrl(player.gameName, player.tagLine, player.region)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#1e293b]/70 hover:bg-cyan-500 hover:text-black text-cyan-300 border border-slate-700 hover:border-cyan-400 transition-all shadow-sm"
                            title="Ver perfil completo en OP.GG"
                          >
                            <span>OP.GG</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </td>

                      {/* Actions (Admin Only) */}
                      {isAdmin && (
                        <td className="py-4 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onRefreshPlayer(player.id)}
                              disabled={isRefreshingThis}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Sincronizar con Riot Games"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingThis ? 'animate-spin text-cyan-400' : ''}`} />
                            </button>
                            <button
                              onClick={() => onEditPlayer(player)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Editar Jugador"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeletePlayer(player)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Eliminar Jugador"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
