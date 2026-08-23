"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = void 0;
exports.calculateMMR = calculateMMR;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ROOT_DIR = process.cwd();
const DATA_DIR = fs_1.default.existsSync(path_1.default.join(ROOT_DIR, 'server'))
    ? path_1.default.join(ROOT_DIR, 'server', 'data')
    : path_1.default.join(ROOT_DIR, 'data');
const PLAYERS_FILE = path_1.default.join(DATA_DIR, 'players.json');
const CONFIG_FILE = path_1.default.join(DATA_DIR, 'config.json');
function calculateMMR(tier, division, lp) {
    const tierBase = {
        CHALLENGER: 3200,
        GRANDMASTER: 2800,
        MASTER: 2400,
        DIAMOND: 2000,
        EMERALD: 1600,
        PLATINUM: 1200,
        GOLD: 800,
        SILVER: 400,
        BRONZE: 0,
        IRON: -400,
        UNRANKED: -1000,
    };
    const divisionBonus = {
        I: 300,
        II: 200,
        III: 100,
        IV: 0,
        '': 0,
    };
    const base = tierBase[tier] ?? -1000;
    if (tier === 'CHALLENGER' || tier === 'GRANDMASTER' || tier === 'MASTER') {
        return base + lp;
    }
    return base + (divisionBonus[division] || 0) + lp;
}
const DEFAULT_CONFIG = {
    name: 'Ñoquis Q Challenge 2026',
    tagline: 'Torneo de SoloQ entre amigos y comunidad',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    prizePool: '10,000 RP + Corona de Ñoqui Legendario',
    customItemsEnabled: true,
    defaultRegion: 'la1',
    rules: [
        {
            title: 'Solo Queue Obligatorio',
            description: 'Solo cuentan las partidas de Ranked Solo/Duo 5v5 jugadas durante el periodo del torneo.',
        },
        {
            title: 'Objetivo de Clasificación',
            description: 'El ranking se ordena por LP y División alcanzada en SoloQ. Quien alcance mayor elo al final del tiempo gana el desafío.',
        },
        {
            title: 'Desempates y Puntuación',
            description: 'En caso de empate en LP y División, el desempate se decide por el porcentaje de Winrate (%) y mayor cantidad de victorias.',
        },
        {
            title: 'Fair Play',
            description: 'Prohibido el duo boosteo o el wintrading. Todas las cuentas deben ser jugadas exclusivamente por su participante.',
        },
    ],
    activeApiKey: 'RGAPI-ef2ced72-6870-4868-8502-1e29271231fe',
};
const INITIAL_PLAYERS = [];
class StorageService {
    constructor() {
        this.ensureDataDir();
    }
    ensureDataDir() {
        if (!fs_1.default.existsSync(DATA_DIR)) {
            fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
        }
        if (!fs_1.default.existsSync(PLAYERS_FILE)) {
            fs_1.default.writeFileSync(PLAYERS_FILE, JSON.stringify(INITIAL_PLAYERS, null, 2), 'utf-8');
        }
        if (!fs_1.default.existsSync(CONFIG_FILE)) {
            fs_1.default.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf-8');
        }
    }
    getPlayers() {
        try {
            this.ensureDataDir();
            const content = fs_1.default.readFileSync(PLAYERS_FILE, 'utf-8');
            return JSON.parse(content);
        }
        catch (err) {
            console.error('Error reading players file:', err);
            return INITIAL_PLAYERS;
        }
    }
    savePlayers(players) {
        try {
            this.ensureDataDir();
            fs_1.default.writeFileSync(PLAYERS_FILE, JSON.stringify(players, null, 2), 'utf-8');
        }
        catch (err) {
            console.error('Error saving players file:', err);
        }
    }
    getPlayerById(id) {
        return this.getPlayers().find((p) => p.id === id);
    }
    addPlayer(player) {
        const players = this.getPlayers();
        players.push(player);
        this.savePlayers(players);
        return player;
    }
    updatePlayer(id, updates) {
        const players = this.getPlayers();
        const index = players.findIndex((p) => p.id === id);
        if (index === -1)
            return null;
        players[index] = { ...players[index], ...updates };
        if (updates.stats) {
            players[index].stats.calculatedMMR = calculateMMR(players[index].stats.tier, players[index].stats.division, players[index].stats.leaguePoints);
        }
        this.savePlayers(players);
        return players[index];
    }
    deletePlayer(id) {
        const players = this.getPlayers();
        const filtered = players.filter((p) => p.id !== id);
        if (filtered.length === players.length)
            return false;
        this.savePlayers(filtered);
        return true;
    }
    getConfig() {
        try {
            this.ensureDataDir();
            const content = fs_1.default.readFileSync(CONFIG_FILE, 'utf-8');
            return JSON.parse(content);
        }
        catch (err) {
            console.error('Error reading config file:', err);
            return DEFAULT_CONFIG;
        }
    }
    saveConfig(config) {
        try {
            this.ensureDataDir();
            fs_1.default.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
        }
        catch (err) {
            console.error('Error saving config file:', err);
        }
    }
    getApiKey() {
        const config = this.getConfig();
        return (config.activeApiKey || process.env.RIOT_API_KEY || '').trim();
    }
    setApiKey(key) {
        const config = this.getConfig();
        config.activeApiKey = key.trim();
        this.saveConfig(config);
    }
}
exports.storage = new StorageService();
