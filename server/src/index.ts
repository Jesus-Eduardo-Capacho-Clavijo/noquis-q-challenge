import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { storage, calculateMMR } from './storage.js';
import { riotService, generateFallbackActiveGame } from './riotService.js';
import { Player, RegionRouting, LoLRole } from './types.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support base64 image uploads

// Initialize active API key from storage
const activeKey = storage.getApiKey();
if (activeKey) {
  riotService.setApiKey(activeKey);
  console.log('⚡ Active Riot API Key initialized from tournament storage.');
}

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// --- Player Routes ---

// Get all players (sorted by MMR / Rank descending)
app.get('/api/players', (req: Request, res: Response) => {
  const players = storage.getPlayers();

  // If first player has no activeGame and no API key, give sample active game for live test
  if (players.length > 0 && !players[0].activeGame && !riotService.hasApiKey()) {
    players[0].activeGame = generateFallbackActiveGame(players[0], 'Smolder');
    storage.updatePlayer(players[0].id, players[0]);
  }

  // Sort descending by calculatedMMR
  const sorted = [...players].sort((a, b) => b.stats.calculatedMMR - a.stats.calculatedMMR);
  res.json({ success: true, data: sorted });
});

// Get a single player
app.get('/api/players/:id', (req: Request, res: Response) => {
  const player = storage.getPlayerById(req.params.id);
  if (!player) {
    return res.status(404).json({ success: false, message: 'Jugador no encontrado' });
  }
  res.json({ success: true, data: player });
});

// Check/Get live active game for a player
app.get('/api/players/:id/active-game', async (req: Request, res: Response) => {
  const player = storage.getPlayerById(req.params.id);
  if (!player) {
    return res.status(404).json({ success: false, message: 'Jugador no encontrado' });
  }

  const simulate = req.query.simulate === 'true';

  // Try live Riot Spectator v5 if API key is present
  if (riotService.hasApiKey() && !simulate) {
    try {
      const liveGame = await riotService.getActiveGame(player);
      if (liveGame) {
        player.activeGame = liveGame;
        storage.updatePlayer(player.id, player);
        return res.json({ success: true, inGame: true, data: liveGame });
      }
    } catch (err) {
      console.warn('Spectator API check error:', err);
    }
  }

  // Check stored active game
  if (player.activeGame) {
    return res.json({ success: true, inGame: true, data: player.activeGame });
  }

  if (simulate) {
    const mockGame = generateFallbackActiveGame(player);
    return res.json({ success: true, inGame: true, data: mockGame });
  }

  return res.json({ success: true, inGame: false, data: null });
});

// Toggle simulated active game for testing
app.post('/api/players/:id/toggle-live-game', (req: Request, res: Response) => {
  const player = storage.getPlayerById(req.params.id);
  if (!player) {
    return res.status(404).json({ success: false, message: 'Jugador no encontrado' });
  }

  const champName = req.body.championName;
  if (player.activeGame) {
    player.activeGame = null;
    storage.updatePlayer(player.id, player);
    return res.json({ success: true, inGame: false, data: null, message: 'Estado en partida desactivado.' });
  } else {
    const mockGame = generateFallbackActiveGame(player, champName);
    player.activeGame = mockGame;
    storage.updatePlayer(player.id, player);
    return res.json({ success: true, inGame: true, data: mockGame, message: '¡Partida en vivo activada!' });
  }
});

// Add a new player
app.post('/api/players', async (req: Request, res: Response) => {
  try {
    const {
      gameName,
      tagLine,
      region = 'la1',
      primaryRole = 'MID',
      displayName,
      countryCode = 'es',
      avatarUrl,
      aegisCount = 0,
      shellsCount = 0,
    } = req.body;

    if (!gameName || !tagLine) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de invocador (gameName) y el TAG (tagLine) son requeridos.',
      });
    }

    const cleanGameName = gameName.trim();
    const cleanTagLine = tagLine.trim().replace(/^#/, '');
    const cleanAvatarUrl = avatarUrl ? String(avatarUrl).trim() : undefined;

    // Check if player already exists
    const existing = storage
      .getPlayers()
      .find(
        (p) =>
          p.gameName.toLowerCase() === cleanGameName.toLowerCase() &&
          p.tagLine.toLowerCase() === cleanTagLine.toLowerCase() &&
          p.region === region
      );

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `El jugador ${cleanGameName}#${cleanTagLine} ya está registrado en el torneo.`,
      });
    }

    let newPlayer: Player;

    if (riotService.hasApiKey()) {
      // Create skeleton and fetch from Riot
      const tempPlayer: Player = {
        id: `player-${Date.now()}`,
        displayName: displayName || cleanGameName,
        gameName: cleanGameName,
        tagLine: cleanTagLine,
        region: region as RegionRouting,
        primaryRole: primaryRole as LoLRole,
        countryCode,
        avatarUrl: cleanAvatarUrl,
        aegisCount: Number(aegisCount) || 0,
        shellsCount: Number(shellsCount) || 0,
        tournamentPoints: 0,
        stats: {
          tier: 'UNRANKED',
          division: 'I',
          leaguePoints: 0,
          calculatedMMR: -1000,
          wins: 0,
          losses: 0,
          totalGames: 0,
          winRate: 0,
          hotStreak: false,
          veteran: false,
          freshBlood: false,
          inactive: false,
          trend: 0,
          recentMatchesSummary: [],
          lastUpdated: new Date().toISOString(),
        },
      };

      try {
        newPlayer = await riotService.fetchPlayerLiveStats(tempPlayer);
      } catch (err) {
        console.warn('Error fetching live stats from Riot, falling back to initialized player:', err);
        newPlayer = tempPlayer;
      }
    } else {
      // Fallback: create mock/simulated player
      newPlayer = riotService.createMockPlayer(
        cleanGameName,
        cleanTagLine,
        region as RegionRouting,
        primaryRole as LoLRole,
        countryCode,
        displayName
      );
      newPlayer.avatarUrl = cleanAvatarUrl;
      newPlayer.aegisCount = Number(aegisCount) || 0;
      newPlayer.shellsCount = Number(shellsCount) || 0;
    }

    const saved = storage.addPlayer(newPlayer);
    res.status(201).json({
      success: true,
      data: saved,
      isRealData: riotService.hasApiKey(),
      message: riotService.hasApiKey()
        ? `Jugador ${cleanGameName}#${cleanTagLine} agregado con datos en tiempo real de Riot Games.`
        : `Jugador ${cleanGameName}#${cleanTagLine} agregado en Modo Simulado (Ingresa tu Riot API Key para sincronizar estadísticas reales).`,
    });
  } catch (error: any) {
    console.error('Error adding player:', error);
    res.status(500).json({ success: false, message: error.message || 'Error al agregar jugador' });
  }
});

// Update a player
app.put('/api/players/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const updated = storage.updatePlayer(id, updates);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Jugador no encontrado' });
  }
  res.json({ success: true, data: updated });
});

// Delete a player
app.delete('/api/players/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = storage.deletePlayer(id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Jugador no encontrado' });
  }
  res.json({ success: true, message: 'Jugador eliminado con éxito' });
});

// Refresh a single player stats from Riot
app.post('/api/players/:id/refresh', async (req: Request, res: Response) => {
  try {
    const player = storage.getPlayerById(req.params.id);
    if (!player) {
      return res.status(404).json({ success: false, message: 'Jugador no encontrado' });
    }

    if (!riotService.hasApiKey()) {
      return res.status(400).json({
        success: false,
        message: 'No hay Riot API Key configurada. Por favor agrega tu API Key en la configuración.',
      });
    }

    const refreshed = await riotService.fetchPlayerLiveStats(player);
    storage.updatePlayer(player.id, refreshed);

    res.json({ success: true, data: refreshed, message: 'Estadísticas actualizadas con éxito desde Riot Games.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error al actualizar jugador' });
  }
});

// Refresh all players
app.post('/api/players/refresh-all', async (req: Request, res: Response) => {
  try {
    const players = storage.getPlayers();
    if (!riotService.hasApiKey()) {
      return res.status(400).json({
        success: false,
        message: 'No hay Riot API Key configurada. Por favor agrega tu API Key en la configuración.',
      });
    }

    const updatedList: Player[] = [];
    for (const player of players) {
      try {
        const refreshed = await riotService.fetchPlayerLiveStats(player);
        storage.updatePlayer(player.id, refreshed);
        updatedList.push(refreshed);
        // Small delay to respect rate limit
        await new Promise((r) => setTimeout(r, 200));
      } catch (err) {
        console.error(`Error refreshing ${player.displayName}:`, err);
        updatedList.push(player);
      }
    }

    res.json({
      success: true,
      data: updatedList,
      message: `Se actualizaron ${updatedList.length} jugadores en tiempo real desde Riot Games.`,
    });
  } catch (error: any) {
    console.error('Error refreshing all players:', error);
    res.status(500).json({ success: false, message: error.message || 'Error al actualizar todos los jugadores' });
  }
});

// --- Tournament Config Routes ---

app.get('/api/tournament', (req: Request, res: Response) => {
  const config = storage.getConfig();
  res.json({ success: true, data: config });
});

app.put('/api/tournament', (req: Request, res: Response) => {
  storage.saveConfig(req.body);
  res.json({ success: true, data: req.body, message: 'Configuración de torneo guardada.' });
});

// --- API Key & Status Routes ---

app.get('/api/config/api-status', (req: Request, res: Response) => {
  const hasKey = riotService.hasApiKey();
  const currentKey = riotService.getApiKey();
  const maskedKey = currentKey
    ? `${currentKey.substring(0, 8)}...${currentKey.substring(currentKey.length - 4)}`
    : '';

  res.json({
    success: true,
    hasApiKey: hasKey,
    maskedKey,
  });
});

// Universal Validator & Dynamic Key Update: Validates, replaces old key, and stores dynamic key
app.post('/api/config/api-key', async (req: Request, res: Response) => {
  const { apiKey } = req.body;
  if (!apiKey || !apiKey.trim()) {
    return res.status(400).json({ success: false, message: 'La clave de API es requerida.' });
  }

  const cleanKey = apiKey.trim();

  // 1. Universal validation across Riot platforms
  const verification = await riotService.verifyApiKey(cleanKey);
  if (!verification.valid) {
    return res.status(400).json({ success: false, message: verification.message });
  }

  // 2. Set new active key and remove previous key
  riotService.setApiKey(cleanKey);
  storage.setApiKey(cleanKey);

  res.json({
    success: true,
    message: 'Riot API Key validada y activada con éxito. Se reemplazó cualquier clave anterior.',
  });
});

// Remove API key
app.delete('/api/config/api-key', (req: Request, res: Response) => {
  riotService.setApiKey('');
  storage.setApiKey('');
  res.json({ success: true, message: 'API Key eliminada.' });
});

// Admin authentication endpoint
app.post('/api/auth/admin-login', (req: Request, res: Response) => {
  const { code } = req.body;
  const ADMIN_CODE = process.env.ADMIN_CODE || 'mainvayne13';

  if (code && String(code).trim() === ADMIN_CODE) {
    return res.json({ success: true, message: 'Autenticación de administrador exitosa.' });
  }

  return res.status(401).json({ success: false, message: 'Código de administrador incorrecto.' });
});

// --- Production Frontend Static Files Serving ---
const possibleDistPaths = [
  path.join(process.cwd(), 'client', 'dist'),
  path.join(process.cwd(), '..', 'client', 'dist'),
  path.join(process.cwd(), 'dist', 'client'),
];

for (const distPath of possibleDistPaths) {
  if (fs.existsSync(distPath)) {
    console.log(`📦 Serving static client build from: ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
    break;
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Ñoquis Q Challenge API Server running at http://localhost:${PORT}`);
});
