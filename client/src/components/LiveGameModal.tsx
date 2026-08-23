import React, { useState, useEffect } from 'react';
import { Player, ActiveGameInfo, ActiveGameParticipant } from '../types';
import {
  getChampionIconUrl,
  getSpellIconUrl,
  getRuneIconUrl,
  getTierColorClass,
  getOpGgUrl,
} from '../data/ddragon';
import { RoleIcon } from './RoleIcon';
import {
  X,
  Radio,
  ExternalLink,
  Clock,
  Sparkles,
} from 'lucide-react';

interface LiveGameModalProps {
  player: Player | null;
  activeGame: ActiveGameInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: (playerId: string) => void;
}

export const LiveGameModal: React.FC<LiveGameModalProps> = ({
  player,
  activeGame,
  isOpen,
  onClose,
}) => {
  const [secondsElapsed, setSecondsElapsed] = useState(activeGame?.gameLength || 0);

  // Live timer tick every second
  useEffect(() => {
    if (!activeGame) return;
    setSecondsElapsed(activeGame.gameLength || 0);

    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeGame]);

  if (!isOpen || !player || !activeGame) return null;

  const mins = Math.floor(secondsElapsed / 60);
  const secs = secondsElapsed % 60;
  const formattedTime = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  const blueTeam = activeGame.teams.blue;
  const redTeam = activeGame.teams.red;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-[#070b14] border-2 border-emerald-500/50 rounded-3xl w-full max-w-6xl max-h-[94vh] overflow-hidden shadow-2xl flex flex-col my-auto shadow-emerald-950/40">
        {/* Top Live Match Header */}
        <div className="relative bg-gradient-to-r from-[#061412] via-[#091f1a] to-[#061412] p-5 sm:p-6 border-b border-emerald-500/30 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Live indicator & Queue Info */}
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 shadow-neon-green relative">
                <Radio className="w-6 h-6 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black font-mono uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    PARTIDA EN CURSO EN VIVO
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {activeGame.queueName}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white font-display mt-1 flex items-center gap-2">
                  <span>{player.displayName}</span>
                  <span className="text-slate-400 text-sm font-normal font-sans">
                    está jugando con
                  </span>
                  <span className="text-emerald-400">{activeGame.playerChampion}</span>
                </h2>
              </div>
            </div>

            {/* Live Clock Timer */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-2xl bg-[#030a08] border border-emerald-500/40 text-center shadow-inner">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" /> Tiempo de Juego
                </span>
                <span className="text-2xl font-black font-mono text-emerald-400 tracking-wider">
                  {formattedTime}
                </span>
              </div>

              <a
                href={getOpGgUrl(player.gameName, player.tagLine, player.region)}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-md shadow-emerald-500/20 items-center gap-1.5 transition-all"
              >
                <span>Espectar en OP.GG</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Content Body (10 Players Matchup) */}
        <div className="p-5 sm:p-7 space-y-6 overflow-y-auto flex-1">
          
          {/* Bans Bar */}
          {activeGame.bannedChampions && activeGame.bannedChampions.length > 0 && (
            <div className="bg-[#0b101c] border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              {/* Blue Bans */}
              <div className="flex items-center gap-2">
                <span className="text-sky-400 font-bold uppercase tracking-wider text-[11px] font-mono">
                  Bans Equipo Azul:
                </span>
                <div className="flex items-center gap-1.5">
                  {blueTeam.bans.map((ban, idx) => (
                    <div
                      key={idx}
                      className="relative group w-7 h-7 rounded-lg overflow-hidden border border-slate-700 bg-slate-900"
                      title={`Baneado: ${ban.championName}`}
                    >
                      <img
                        src={getChampionIconUrl(ban.championName || 'Ahri')}
                        alt={ban.championName}
                        className="w-full h-full object-cover grayscale opacity-75 group-hover:grayscale-0 transition-all"
                      />
                      <div className="absolute inset-0 bg-red-950/40 flex items-center justify-center">
                        <span className="text-[10px] text-red-400 font-black">✕</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                FASE DE SELECCIÓN Y BLOQUEOS
              </div>

              {/* Red Bans */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  {redTeam.bans.map((ban, idx) => (
                    <div
                      key={idx}
                      className="relative group w-7 h-7 rounded-lg overflow-hidden border border-slate-700 bg-slate-900"
                      title={`Baneado: ${ban.championName}`}
                    >
                      <img
                        src={getChampionIconUrl(ban.championName || 'Ahri')}
                        alt={ban.championName}
                        className="w-full h-full object-cover grayscale opacity-75 group-hover:grayscale-0 transition-all"
                      />
                      <div className="absolute inset-0 bg-red-950/40 flex items-center justify-center">
                        <span className="text-[10px] text-red-400 font-black">✕</span>
                      </div>
                    </div>
                  ))}
                </div>
                <span className="text-rose-400 font-bold uppercase tracking-wider text-[11px] font-mono">
                  :Bans Equipo Rojo
                </span>
              </div>
            </div>
          )}

          {/* 2 Teams Comparison Grid (Blue Team vs Red Team) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* BLUE TEAM (Equipo Azul 100) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-sky-500/30">
                <h3 className="text-sm font-black text-sky-400 uppercase tracking-widest font-display flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-sm shadow-sky-400"></span>
                  <span>Equipo Azul</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">5 Invocadores</span>
              </div>

              <div className="space-y-2.5">
                {blueTeam.participants.map((p, idx) => (
                  <LiveParticipantCard key={idx} participant={p} teamColor="blue" />
                ))}
              </div>
            </div>

            {/* RED TEAM (Equipo Rojo 200) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-rose-500/30">
                <h3 className="text-sm font-black text-rose-400 uppercase tracking-widest font-display flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-sm shadow-rose-400"></span>
                  <span>Equipo Rojo</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">5 Invocadores</span>
              </div>

              <div className="space-y-2.5">
                {redTeam.participants.map((p, idx) => (
                  <LiveParticipantCard key={idx} participant={p} teamColor="red" />
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#050810] border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Datos en tiempo real sincronizados con Riot Spectator API</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// Sub-component: Live Participant Row Card
interface LiveParticipantCardProps {
  participant: ActiveGameParticipant;
  teamColor: 'blue' | 'red';
}

const LiveParticipantCard: React.FC<LiveParticipantCardProps> = ({
  participant,
  teamColor,
}) => {
  const isBlue = teamColor === 'blue';
  const isSelf = participant.isPlayer;
  const tierColor = getTierColorClass(participant.currentTier || 'UNRANKED');

  return (
    <div
      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
        isSelf
          ? 'bg-[#0d221c] border-emerald-400 shadow-lg shadow-emerald-950/40 ring-2 ring-emerald-500/40'
          : isBlue
          ? 'bg-[#090f1c] border-sky-900/40 hover:border-sky-700/60'
          : 'bg-[#180d12] border-rose-900/40 hover:border-rose-700/60'
      }`}
    >
      {/* Left: Champion Avatar, Spells, Runes */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Champion Avatar */}
        <div className="relative shrink-0">
          <img
            src={getChampionIconUrl(participant.championName)}
            alt={participant.championName}
            className={`w-12 h-12 rounded-xl object-cover border-2 ${
              isSelf ? 'border-emerald-400' : isBlue ? 'border-sky-500/60' : 'border-rose-500/60'
            }`}
          />
          {participant.role && (
            <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-slate-900 border border-slate-700">
              <RoleIcon role={participant.role} size={12} />
            </div>
          )}
        </div>

        {/* Spells & Runes */}
        <div className="flex flex-col gap-1 shrink-0">
          <div className="flex gap-1">
            <img
              src={getSpellIconUrl(participant.spell1Id)}
              alt="Spell 1"
              className="w-4 h-4 rounded border border-slate-700"
            />
            <img
              src={getSpellIconUrl(participant.spell2Id)}
              alt="Spell 2"
              className="w-4 h-4 rounded border border-slate-700"
            />
          </div>
          {participant.primaryRuneId && (
            <div className="flex gap-1">
              <img
                src={getRuneIconUrl(participant.primaryRuneId)}
                alt="Primary Rune"
                className="w-4 h-4 rounded-full bg-black border border-slate-800 p-0.5"
              />
            </div>
          )}
        </div>

        {/* Invocador & Champion Name */}
        <div className="truncate min-w-0">
          <div className="flex items-center gap-1.5">
            <h5
              className={`text-xs font-bold truncate ${
                isSelf ? 'text-emerald-300 font-extrabold text-sm' : 'text-white'
              }`}
            >
              {participant.summonerName}
            </h5>
            {isSelf && (
              <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-black text-[9px] font-black uppercase font-mono">
                TÚ / TORNEO
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 font-mono block truncate">
            {participant.championName}
          </span>
        </div>
      </div>

      {/* Right: Current Rank, LP & Winrate */}
      <div className="text-right shrink-0 font-mono">
        <span className={`text-xs font-black block ${tierColor.text}`}>
          {participant.currentTier} {participant.currentDivision}
        </span>
        <div className="flex items-center gap-2 justify-end text-[11px] text-slate-400">
          <span>{participant.currentLP || 0} LP</span>
          <span>•</span>
          <span className="text-emerald-400 font-bold">
            {participant.winRate || 50}% WR
          </span>
        </div>
      </div>
    </div>
  );
};
