"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const storage_js_1 = require("./storage.js");
const riotService_js_1 = require("./riotService.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' })); // Support base64 image uploads
// Initialize active API key from storage
const activeKey = storage_js_1.storage.getApiKey();
if (activeKey) {
    riotService_js_1.riotService.setApiKey(activeKey);
    console.log('⚡ Active Riot API Key initialized from tournament storage.');
}
// Log incoming requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
// --- Player Routes ---
// Get all players (sorted by MMR / Rank descending)
app.get('/api/players', (req, res) => {
    const players = storage_js_1.storage.getPlayers();
    // If first player has no activeGame and no API key, give sample active game for live test
    if (players.length > 0 && !players[0].activeGame && !riotService_js_1.riotService.hasApiKey()) {
        players[0].activeGame = (0, riotService_js_1.generateFallbackActiveGame)(players[0], 'Smolder');
        storage_js_1.storage.updatePlayer(players[0].id, players[0]);
    }
    // Sort descending by calculatedMMR
    const sorted = [...players].sort((a, b) => b.stats.calculatedMMR - a.stats.calculatedMMR);
    res.json({ success: true, data: sorted });
});
// Get a single player
app.get('/api/players/:id', (req, res) => {
    const player = storage_js_1.storage.getPlayerById(req.params.id);
    if (!player) {
        return res.status(404).json({ success: false, message: 'Jugador no encontrado' });
    }
    res.json({ success: true, data: player });
});
// Check/Get live active game for a player
app.get('/api/players/:id/active-game', async (req, res) => {
    const player = storage_js_1.storage.getPlayerById(req.params.id);
    if (!player) {
        return res.status(404).json({ success: false, message: 'Jugador no encontrado' });
    }
    const simulate = req.query.simulate === 'true';
    // Try live Riot Spectator v5 if API key is present
    if (riotService_js_1.riotService.hasApiKey() && !simulate) {
        try {
            const liveGame = await riotService_js_1.riotService.getActiveGame(player);
            if (liveGame) {
                player.activeGame = liveGame;
                storage_js_1.storage.updatePlayer(player.id, player);
                return res.json({ success: true, inGame: true, data: liveGame });
            }
        }
        catch (err) {
            console.warn('Spectator API check error:', err);
        }
    }
    // Check stored active game
    if (player.activeGame) {
        return res.json({ success: true, inGame: true, data: player.activeGame });
    }
    if (simulate) {
        const mockGame = (0, riotService_js_1.generateFallbackActiveGame)(player);
        return res.json({ success: true, inGame: true, data: mockGame });
    }
    return res.json({ success: true, inGame: false, data: null });
});
// Toggle simulated active game for testing
app.post('/api/players/:id/toggle-live-game', (req, res) => {
    const player = storage_js_1.storage.getPlayerById(req.params.id);
    if (!player) {
        return res.status(404).json({ success: false, message: 'Jugador no encontrado' });
    }
    const champName = req.body.championName;
    if (player.activeGame) {
        player.activeGame = null;
        storage_js_1.storage.updatePlayer(player.id, player);
        return res.json({ success: true, inGame: false, data: null, message: 'Estado en partida desactivado.' });
    }
    else {
        const mockGame = (0, riotService_js_1.generateFallbackActiveGame)(player, champName);
        player.activeGame = mockGame;
        storage_js_1.storage.updatePlayer(player.id, player);
        return res.json({ success: true, inGame: true, data: mockGame, message: '¡Partida en vivo activada!' });
    }
});
// Add a new player
app.post('/api/players', async (req, res) => {
    try {
        const { gameName, tagLine, region = 'la1', primaryRole = 'MID', displayName, countryCode = 'es', avatarUrl, aegisCount = 0, shellsCount = 0, } = req.body;
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
        const existing = storage_js_1.storage
            .getPlayers()
            .find((p) => p.gameName.toLowerCase() === cleanGameName.toLowerCase() &&
            p.tagLine.toLowerCase() === cleanTagLine.toLowerCase() &&
            p.region === region);
        if (existing) {
            return res.status(409).json({
                success: false,
                message: `El jugador ${cleanGameName}#${cleanTagLine} ya está registrado en el torneo.`,
            });
        }
        let newPlayer;
        if (riotService_js_1.riotService.hasApiKey()) {
            // Create skeleton and fetch from Riot
            const tempPlayer = {
                id: `player-${Date.now()}`,
                displayName: displayName || cleanGameName,
                gameName: cleanGameName,
                tagLine: cleanTagLine,
                region: region,
                primaryRole: primaryRole,
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
                newPlayer = await riotService_js_1.riotService.fetchPlayerLiveStats(tempPlayer);
            }
            catch (err) {
                console.warn('Error fetching live stats from Riot, falling back to initialized player:', err);
                newPlayer = tempPlayer;
            }
        }
        else {
            // Fallback: create mock/simulated player
            newPlayer = riotService_js_1.riotService.createMockPlayer(cleanGameName, cleanTagLine, region, primaryRole, countryCode, displayName);
            newPlayer.avatarUrl = cleanAvatarUrl;
            newPlayer.aegisCount = Number(aegisCount) || 0;
            newPlayer.shellsCount = Number(shellsCount) || 0;
        }
        const saved = storage_js_1.storage.addPlayer(newPlayer);
        res.status(201).json({
            success: true,
            data: saved,
            isRealData: riotService_js_1.riotService.hasApiKey(),
            message: riotService_js_1.riotService.hasApiKey()
                ? `Jugador ${cleanGameName}#${cleanTagLine} agregado con datos en tiempo real de Riot Games.`
                : `Jugador ${cleanGameName}#${cleanTagLine} agregado en Modo Simulado (Ingresa tu Riot API Key para sincronizar estadísticas reales).`,
        });
    }
    catch (error) {
        console.error('Error adding player:', error);
        res.status(500).json({ success: false, message: error.message || 'Error al agregar jugador' });
    }
});
// Update a player
app.put('/api/players/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const updated = storage_js_1.storage.updatePlayer(id, updates);
    if (!updated) {
        return res.status(404).json({ success: false, message: 'Jugador no encontrado' });
    }
    res.json({ success: true, data: updated });
});
// Delete a player
app.delete('/api/players/:id', (req, res) => {
    const { id } = req.params;
    const deleted = storage_js_1.storage.deletePlayer(id);
    if (!deleted) {
        return res.status(404).json({ success: false, message: 'Jugador no encontrado' });
    }
    res.json({ success: true, message: 'Jugador eliminado con éxito' });
});
// Refresh a single player stats from Riot
app.post('/api/players/:id/refresh', async (req, res) => {
    try {
        const player = storage_js_1.storage.getPlayerById(req.params.id);
        if (!player) {
            return res.status(404).json({ success: false, message: 'Jugador no encontrado' });
        }
        if (!riotService_js_1.riotService.hasApiKey()) {
            return res.status(400).json({
                success: false,
                message: 'No hay Riot API Key configurada. Por favor agrega tu API Key en la configuración.',
            });
        }
        const refreshed = await riotService_js_1.riotService.fetchPlayerLiveStats(player);
        storage_js_1.storage.updatePlayer(player.id, refreshed);
        res.json({ success: true, data: refreshed, message: 'Estadísticas actualizadas con éxito desde Riot Games.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error al actualizar jugador' });
    }
});
// Refresh all players
app.post('/api/players/refresh-all', async (req, res) => {
    try {
        const players = storage_js_1.storage.getPlayers();
        if (!riotService_js_1.riotService.hasApiKey()) {
            return res.status(400).json({
                success: false,
                message: 'No hay Riot API Key configurada. Por favor agrega tu API Key en la configuración.',
            });
        }
        const updatedList = [];
        for (const player of players) {
            try {
                const refreshed = await riotService_js_1.riotService.fetchPlayerLiveStats(player);
                storage_js_1.storage.updatePlayer(player.id, refreshed);
                updatedList.push(refreshed);
                // Small delay to respect rate limit
                await new Promise((r) => setTimeout(r, 200));
            }
            catch (err) {
                console.error(`Error refreshing ${player.displayName}:`, err);
                updatedList.push(player);
            }
        }
        res.json({
            success: true,
            data: updatedList,
            message: `Se actualizaron ${updatedList.length} jugadores en tiempo real desde Riot Games.`,
        });
    }
    catch (error) {
        console.error('Error refreshing all players:', error);
        res.status(500).json({ success: false, message: error.message || 'Error al actualizar todos los jugadores' });
    }
});
// --- Tournament Config Routes ---
app.get('/api/tournament', (req, res) => {
    const config = storage_js_1.storage.getConfig();
    res.json({ success: true, data: config });
});
app.put('/api/tournament', (req, res) => {
    storage_js_1.storage.saveConfig(req.body);
    res.json({ success: true, data: req.body, message: 'Configuración de torneo guardada.' });
});
// --- API Key & Status Routes ---
app.get('/api/config/api-status', (req, res) => {
    const hasKey = riotService_js_1.riotService.hasApiKey();
    const currentKey = riotService_js_1.riotService.getApiKey();
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
app.post('/api/config/api-key', async (req, res) => {
    const { apiKey } = req.body;
    if (!apiKey || !apiKey.trim()) {
        return res.status(400).json({ success: false, message: 'La clave de API es requerida.' });
    }
    const cleanKey = apiKey.trim();
    // 1. Universal validation across Riot platforms
    const verification = await riotService_js_1.riotService.verifyApiKey(cleanKey);
    if (!verification.valid) {
        return res.status(400).json({ success: false, message: verification.message });
    }
    // 2. Set new active key and remove previous key
    riotService_js_1.riotService.setApiKey(cleanKey);
    storage_js_1.storage.setApiKey(cleanKey);
    res.json({
        success: true,
        message: 'Riot API Key validada y activada con éxito. Se reemplazó cualquier clave anterior.',
    });
});
// Remove API key
app.delete('/api/config/api-key', (req, res) => {
    riotService_js_1.riotService.setApiKey('');
    storage_js_1.storage.setApiKey('');
    res.json({ success: true, message: 'API Key eliminada.' });
});
// Admin authentication endpoint
app.post('/api/auth/admin-login', (req, res) => {
    const { code } = req.body;
    const ADMIN_CODE = process.env.ADMIN_CODE || 'mainvayne13';
    if (code && String(code).trim() === ADMIN_CODE) {
        return res.json({ success: true, message: 'Autenticación de administrador exitosa.' });
    }
    return res.status(401).json({ success: false, message: 'Código de administrador incorrecto.' });
});
// --- Production Frontend Static Files Serving ---
const possibleDistPaths = [
    path_1.default.join(process.cwd(), 'client', 'dist'),
    path_1.default.join(process.cwd(), '..', 'client', 'dist'),
    path_1.default.join(process.cwd(), 'dist', 'client'),
];
for (const distPath of possibleDistPaths) {
    if (fs_1.default.existsSync(distPath)) {
        console.log(`📦 Serving static client build from: ${distPath}`);
        app.use(express_1.default.static(distPath));
        app.get('*', (req, res, next) => {
            if (req.path.startsWith('/api')) {
                return next();
            }
            res.sendFile(path_1.default.join(distPath, 'index.html'));
        });
        break;
    }
}
app.listen(PORT, () => {
    console.log(`🚀 Ñoquis Q Challenge API Server running at http://localhost:${PORT}`);
});
