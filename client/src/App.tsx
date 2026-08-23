import React, { useState, useEffect } from 'react';
import { Player, TournamentConfig, RegionRouting, LoLRole } from './types';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { Leaderboard } from './components/Leaderboard';
import { AddPlayerModal } from './components/AddPlayerModal';
import { PlayerModal } from './components/PlayerModal';
import { RulesModal } from './components/RulesModal';
import { SettingsModal } from './components/SettingsModal';
import { EditPlayerModal } from './components/EditPlayerModal';
import { StatsModal } from './components/StatsModal';
import { LiveGameModal } from './components/LiveGameModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { Trophy, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [config, setConfig] = useState<TournamentConfig | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Admin authentication state
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('noquis_admin_auth') === 'true';
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Modals state
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [championFilter, setChampionFilter] = useState<string | null>(null);
  const [returnToStats, setReturnToStats] = useState(false);
  const [liveGamePlayer, setLiveGamePlayer] = useState<Player | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);

  // Loading & refresh states
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);
  const [refreshingPlayerId, setRefreshingPlayerId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [playersRes, configRes, statusRes] = await Promise.all([
        fetch('/api/players'),
        fetch('/api/tournament'),
        fetch('/api/config/api-status'),
      ]);

      const playersJson = await playersRes.json();
      const configJson = await configRes.json();
      const statusJson = await statusRes.json();

      if (playersJson.success) setPlayers(playersJson.data);
      if (configJson.success) setConfig(configJson.data);
      if (statusJson.success) {
        setHasApiKey(statusJson.hasApiKey);
        setMaskedKey(statusJson.maskedKey || '');
      }
    } catch (err) {
      console.error('Error fetching tournament data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add a player
  const handleAddPlayer = async (playerData: {
    gameName: string;
    tagLine: string;
    region: RegionRouting;
    primaryRole: LoLRole;
    displayName?: string;
    countryCode: string;
    aegisCount?: number;
    shellsCount?: number;
  }) => {
    const res = await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...playerData,
        aegisCount: playerData.aegisCount || 0,
        shellsCount: playerData.shellsCount || 0,
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Error al agregar jugador');
    }

    showToast(json.message || `Jugador ${playerData.gameName} agregado.`);
    await fetchData();
  };

  // Refresh single player
  const handleRefreshPlayer = async (playerId: string) => {
    setRefreshingPlayerId(playerId);
    try {
      const res = await fetch(`/api/players/${playerId}/refresh`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        showToast('Estadísticas sincronizadas con Riot Games.');
        await fetchData();
        if (selectedPlayer && selectedPlayer.id === playerId) {
          setSelectedPlayer(json.data);
        }
      } else {
        showToast(json.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error al sincronizar', 'error');
    } finally {
      setRefreshingPlayerId(null);
    }
  };

  // Refresh all players
  const handleRefreshAll = async () => {
    setIsRefreshingAll(true);
    try {
      const res = await fetch('/api/players/refresh-all', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        showToast('Todos los participantes han sido sincronizados.');
        await fetchData();
      } else {
        showToast(json.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error al sincronizar todos', 'error');
    } finally {
      setIsRefreshingAll(false);
    }
  };

  // Edit player
  const handleSavePlayer = async (id: string, updates: Partial<Player>) => {
    try {
      const res = await fetch(`/api/players/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Participante actualizado.');
        await fetchData();
        if (selectedPlayer && selectedPlayer.id === id) {
          setSelectedPlayer(json.data);
        }
      } else {
        showToast(json.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error al editar', 'error');
    }
  };

  // Delete player
  const handleDeletePlayer = async () => {
    if (!playerToDelete) return;
    try {
      const res = await fetch(`/api/players/${playerToDelete.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast(`Jugador ${playerToDelete.displayName} eliminado del torneo.`);
        setPlayerToDelete(null);
        await fetchData();
      } else {
        showToast(json.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar', 'error');
    }
  };

  // Save tournament config
  const handleSaveConfig = async (newConfig: TournamentConfig) => {
    try {
      const res = await fetch('/api/tournament', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      const json = await res.json();
      if (json.success) {
        setConfig(newConfig);
        showToast('Configuración del torneo guardada.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Riot API Key
  const handleSaveApiKey = async (apiKey: string) => {
    const res = await fetch('/api/config/api-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });
    const json = await res.json();
    if (json.success) {
      setHasApiKey(true);
      setMaskedKey(`${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
      showToast('Riot API Key validada y activada.');
    }
    return json;
  };

  // Delete Riot API Key
  const handleDeleteApiKey = async () => {
    const res = await fetch('/api/config/api-key', {
      method: 'DELETE',
    });
    const json = await res.json();
    if (json.success) {
      setHasApiKey(false);
      setMaskedKey('');
      showToast('API Key eliminada.');
    }
  };

  if (isLoading || !config) {
    return (
      <div className="min-h-screen bg-[#080b11] flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-neon-cyan mb-4 animate-pulse">
          <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover object-top" />
        </div>
        <p className="text-sm font-bold text-slate-300 font-display">Cargando Torneo SoloQ...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#07090f] text-slate-100 flex flex-col relative selection:bg-cyan-500 selection:text-black overflow-x-hidden"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(7, 9, 15, 0.25) 0%, rgba(7, 9, 15, 0.10) 40%, rgba(4, 6, 9, 0.45) 100%), url('/bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 12%',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Main Content inside relative z-10 */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-4 fade-in">
            <div
              className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-2xl flex items-center gap-2.5 border ${
                toastMessage.type === 'success'
                  ? 'bg-[#0f1d18] text-emerald-300 border-emerald-500/50 shadow-emerald-950/50'
                  : 'bg-[#220d11] text-red-300 border-red-500/50 shadow-red-950/50'
              }`}
            >
              {toastMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{toastMessage.text}</span>
            </div>
          </div>
        )}

        {/* Navbar */}
        <Navbar
          isAdmin={isAdmin}
          onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          onAdminLogout={() => {
            setIsAdmin(false);
            localStorage.removeItem('noquis_admin_auth');
            showToast('Sesión de administrador cerrada.', 'success');
          }}
          onOpenAddPlayer={() => setIsAddPlayerOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenRules={() => setIsRulesOpen(true)}
          onOpenStats={() => setIsStatsOpen(true)}
          onRefreshAll={handleRefreshAll}
          isRefreshing={isRefreshingAll}
          hasApiKey={hasApiKey}
          totalPlayers={players.length}
        />

        {/* Main Content */}
        <main className="flex-1">
          {/* Hero Section with Top 3 Podium */}
          <HeroSection
            config={config}
            players={players}
            onOpenRules={() => setIsRulesOpen(true)}
            onOpenAddPlayer={() => setIsAddPlayerOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onSelectPlayer={(p) => {
              setSelectedPlayer(p);
              setChampionFilter(null);
              setReturnToStats(false);
            }}
            hasApiKey={hasApiKey}
          />

        {/* Leaderboard Table */}
        <Leaderboard
          players={players}
          isAdmin={isAdmin}
          onSelectPlayer={(p) => {
            setSelectedPlayer(p);
            setChampionFilter(null);
            setReturnToStats(false);
          }}
          onOpenLiveGame={(p) => setLiveGamePlayer(p)}
          onEditPlayer={(p) => setEditingPlayer(p)}
          onDeletePlayer={(p) => setPlayerToDelete(p)}
          onRefreshPlayer={handleRefreshPlayer}
          refreshingPlayerId={refreshingPlayerId}
        />
      </main>

      {/* Modals */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdmin(true);
          showToast('¡Modo Administrador activado con éxito! Controles desbloqueados.', 'success');
        }}
      />

      <AddPlayerModal
        isOpen={isAddPlayerOpen}
        onClose={() => setIsAddPlayerOpen(false)}
        onAddPlayer={handleAddPlayer}
        hasApiKey={hasApiKey}
      />

      <PlayerModal
        player={selectedPlayer}
        initialChampionFilter={championFilter}
        returnToStats={returnToStats}
        onClose={() => {
          setSelectedPlayer(null);
          setChampionFilter(null);
          if (returnToStats) {
            setIsStatsOpen(true);
            setReturnToStats(false);
          }
        }}
        onOpenLiveGame={(p) => setLiveGamePlayer(p)}
        onRefresh={handleRefreshPlayer}
        isRefreshing={Boolean(refreshingPlayerId && selectedPlayer && refreshingPlayerId === selectedPlayer.id)}
      />

      <LiveGameModal
        player={liveGamePlayer}
        activeGame={liveGamePlayer?.activeGame || null}
        isOpen={Boolean(liveGamePlayer && liveGamePlayer.activeGame)}
        onClose={() => setLiveGamePlayer(null)}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => {
          setIsStatsOpen(false);
          setReturnToStats(false);
        }}
        players={players}
        onSelectPlayer={(p, champ) => {
          setSelectedPlayer(p);
          setChampionFilter(champ || null);
          setReturnToStats(true);
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />

      <EditPlayerModal
        player={editingPlayer}
        isOpen={Boolean(editingPlayer)}
        onClose={() => setEditingPlayer(null)}
        onSave={handleSavePlayer}
      />

      {/* Delete Confirmation Modal */}
      {playerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0e1422] border border-red-500/40 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl shadow-red-950/40">
            <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-400 w-fit">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">¿Eliminar participante?</h3>
              <p className="text-xs text-slate-400 mt-1">
                ¿Estás seguro de remover a <strong className="text-white">{playerToDelete.displayName}</strong> ({playerToDelete.gameName}#{playerToDelete.tagLine}) del torneo?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setPlayerToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeletePlayer}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition-all"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-[#06090e]/80 backdrop-blur-md py-8 mt-12 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <p className="font-semibold text-slate-400">
              {config.name} • SoloQ Challenge & Tournament Stats Tracker
            </p>
            <p className="text-[11px] text-slate-600 max-w-xl mx-auto leading-relaxed">
              Ñoquis Q Challenge no está respaldado por Riot Games y no refleja los puntos de vista u opiniones de Riot Games o cualquier persona involucrada oficialmente en la producción o administración de las propiedades de League of Legends.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
