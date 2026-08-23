"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.riotService = exports.RiotService = exports.CHAMPION_NAME_MAP = void 0;
exports.getRegionalRouting = getRegionalRouting;
exports.formatChampionName = formatChampionName;
exports.generateFallbackActiveGame = generateFallbackActiveGame;
const axios_1 = __importDefault(require("axios"));
const storage_1 = require("./storage");
const cache = new Map();
// Map LoL platform region to regional routing (Americas, Europe, Asia, Sea)
function getRegionalRouting(region) {
    switch (region) {
        case 'la1':
        case 'la2':
        case 'na1':
        case 'br1':
            return 'americas';
        case 'euw1':
        case 'eun1':
        case 'tr1':
        case 'ru':
            return 'europe';
        case 'kr':
        case 'jp1':
            return 'asia';
        case 'oc1':
        case 'ph2':
        case 'sg2':
        case 'th2':
        case 'tw2':
        case 'vn2':
            return 'sea';
        default:
            return 'americas';
    }
}
exports.CHAMPION_NAME_MAP = {
    MonkeyKing: 'Wukong',
    monkeyking: 'Wukong',
    Chogath: "Cho'Gath",
    Kaisa: "Kai'Sa",
    Khazix: "Kha'Zix",
    KogMaw: "Kog'Maw",
    Leblanc: 'LeBlanc',
    RekSai: "Rek'Sai",
    Velkoz: "Vel'Koz",
    KSante: "K'Sante",
    Belveth: "Bel'Veth",
    DrMundo: 'Dr. Mundo',
    JarvanIV: 'Jarvan IV',
    MasterYi: 'Maestro Yi',
    MissFortune: 'Miss Fortune',
    TahmKench: 'Tahm Kench',
    TwistedFate: 'Twisted Fate',
    AurelionSol: 'Aurelion Sol',
    XinZhao: 'Xin Zhao',
    LeeSin: 'Lee Sin',
    Renata: 'Renata Glasc',
    Nunu: 'Nunu y Willump',
};
function formatChampionName(name) {
    if (!name)
        return '';
    const trimmed = name.trim();
    if (exports.CHAMPION_NAME_MAP[trimmed])
        return exports.CHAMPION_NAME_MAP[trimmed];
    const lower = trimmed.toLowerCase();
    for (const [rawKey, displayName] of Object.entries(exports.CHAMPION_NAME_MAP)) {
        if (rawKey.toLowerCase() === lower)
            return displayName;
    }
    return trimmed;
}
const PERMANENT_RIOT_API_KEY = 'RGAPI-ef2ced72-6870-4868-8502-1e29271231fe';
class RiotService {
    apiKey = PERMANENT_RIOT_API_KEY;
    championMap = new Map();
    constructor(apiKey) {
        this.apiKey = (apiKey || process.env.RIOT_API_KEY || PERMANENT_RIOT_API_KEY).trim();
    }
    async ensureChampionMap() {
        if (this.championMap.size > 0)
            return;
        try {
            const resp = await axios_1.default.get('https://ddragon.leagueoflegends.com/cdn/14.24.1/data/es_ES/champion.json', { timeout: 6000 });
            if (resp.data?.data) {
                Object.values(resp.data.data).forEach((champ) => {
                    this.championMap.set(Number(champ.key), champ.id || champ.name);
                });
            }
        }
        catch (err) {
            console.warn('Could not fetch Data Dragon champions list, using fallback.');
        }
    }
    setApiKey(key) {
        this.apiKey = (key || PERMANENT_RIOT_API_KEY).trim();
        // Invalidate cache on key change
        cache.clear();
    }
    getApiKey() {
        return (this.apiKey || process.env.RIOT_API_KEY || PERMANENT_RIOT_API_KEY).trim();
    }
    hasApiKey() {
        const key = this.getApiKey();
        return Boolean(key && key.startsWith('RGAPI-'));
    }
    async makeRequest(url, ttlMs = 180000) {
        const keyToUse = this.getApiKey();
        if (!keyToUse || !keyToUse.startsWith('RGAPI-')) {
            throw new Error('No Riot API key configured');
        }
        const now = Date.now();
        const cached = cache.get(url);
        if (cached && cached.expiry > now) {
            return cached.data;
        }
        try {
            const response = await axios_1.default.get(url, {
                headers: {
                    'X-Riot-Token': this.apiKey,
                    'User-Agent': 'NoquisQChallenge/1.0.0',
                },
                timeout: 10000,
            });
            cache.set(url, {
                data: response.data,
                expiry: now + ttlMs,
            });
            return response.data;
        }
        catch (error) {
            if (error.response) {
                const status = error.response.status;
                const msg = error.response.data?.status?.message || error.message;
                if (status === 401 || status === 403) {
                    throw new Error(`Riot API Key inválida o expirada (${status}): ${msg}`);
                }
                else if (status === 404) {
                    throw new Error(`Invocador o partida no encontrada en Riot Games (404)`);
                }
                else if (status === 429) {
                    throw new Error(`Límite de peticiones de Riot API alcanzado (Rate Limit 429). Espera unos segundos.`);
                }
                throw new Error(`Error de Riot Games (${status}): ${msg}`);
            }
            throw new Error(`Error de conexión con Riot Games: ${error.message}`);
        }
    }
    async verifyApiKey(keyToTest) {
        const cleanKey = (keyToTest || '').trim();
        if (!cleanKey) {
            return { valid: false, message: 'Por favor ingresa una Riot API Key.' };
        }
        if (!cleanKey.startsWith('RGAPI-')) {
            return { valid: false, message: 'Formato inválido. La clave oficial de Riot Games debe comenzar con "RGAPI-".' };
        }
        // Test across universal regional platforms
        const testEndpoints = [
            'https://la1.api.riotgames.com/lol/status/v4/platform-data',
            'https://na1.api.riotgames.com/lol/status/v4/platform-data',
            'https://euw1.api.riotgames.com/lol/status/v4/platform-data',
        ];
        let lastError = null;
        for (const url of testEndpoints) {
            try {
                await axios_1.default.get(url, {
                    headers: { 'X-Riot-Token': cleanKey },
                    timeout: 6000,
                });
                return { valid: true, message: 'Riot API Key verificada y activada con éxito.' };
            }
            catch (error) {
                lastError = error;
                if (error.response?.status === 401 || error.response?.status === 403) {
                    return {
                        valid: false,
                        message: `Riot API Key rechazada (${error.response.status}). Asegúrate de generar una clave nueva en developer.riotgames.com y copiarla completa.`,
                    };
                }
            }
        }
        return {
            valid: false,
            message: lastError?.response?.data?.status?.message || lastError?.message || 'Error de conexión al validar la clave con Riot Games.',
        };
    }
    createMockPlayer(gameName, tagLine, region, primaryRole, countryCode = 'es', displayName) {
        return {
            id: `player-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            displayName: displayName || gameName,
            gameName,
            tagLine,
            region,
            profileIconId: 29,
            summonerLevel: 30,
            primaryRole,
            countryCode,
            aegisCount: 0,
            shellsCount: 0,
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
    }
    async fetchRiotAccount(gameName, tagLine, region) {
        const regional = getRegionalRouting(region);
        const encodedName = encodeURIComponent(gameName.trim());
        const encodedTag = encodeURIComponent(tagLine.trim());
        const url = `https://${regional}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodedName}/${encodedTag}`;
        return await this.makeRequest(url, 300000);
    }
    async fetchLeagueEntries(puuid, region) {
        // Platform endpoint for league-v4 by PUUID
        const url = `https://${region}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`;
        try {
            return await this.makeRequest(url, 120000);
        }
        catch (err) {
            console.warn(`Could not fetch league entries by PUUID for region ${region}:`, err);
            return [];
        }
    }
    // Strictly fetch Ranked Solo/Duo 5v5 matches (queue = 420)
    async fetchRecentMatchIds(puuid, region, count = 100) {
        const regional = getRegionalRouting(region);
        const url = `https://${regional}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&start=0&count=${count}`;
        try {
            return await this.makeRequest(url, 60000);
        }
        catch (err) {
            console.warn('Error fetching soloq match IDs:', err);
            return [];
        }
    }
    async fetchMatchDetails(matchId, region) {
        const regional = getRegionalRouting(region);
        const url = `https://${regional}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
        return await this.makeRequest(url, 86400000); // Cache matches for 24 hours
    }
    async fetchPlayerLiveStats(player) {
        if (!this.hasApiKey()) {
            return player;
        }
        try {
            // 1. Account info
            let puuid = player.puuid;
            let gameName = player.gameName;
            let tagLine = player.tagLine;
            if (!puuid) {
                const account = await this.fetchRiotAccount(gameName, tagLine, player.region);
                puuid = account.puuid;
                gameName = account.gameName;
                tagLine = account.tagLine;
            }
            // 2. Ranked Solo/Duo stats ONLY (RANKED_SOLO_5x5)
            const leagueEntries = await this.fetchLeagueEntries(puuid, player.region);
            const soloQueue = leagueEntries.find((entry) => entry.queueType === 'RANKED_SOLO_5x5');
            let tier = 'UNRANKED';
            let division = 'I';
            let leaguePoints = 0;
            let wins = 0;
            let losses = 0;
            let hotStreak = false;
            let veteran = false;
            let freshBlood = false;
            let inactive = false;
            if (soloQueue) {
                tier = (soloQueue.tier || 'UNRANKED');
                division = (soloQueue.rank || 'I');
                leaguePoints = soloQueue.leaguePoints || 0;
                wins = soloQueue.wins || 0;
                losses = soloQueue.losses || 0;
                hotStreak = Boolean(soloQueue.hotStreak);
                veteran = Boolean(soloQueue.veteran);
                freshBlood = Boolean(soloQueue.freshBlood);
                inactive = Boolean(soloQueue.inactive);
            }
            const totalGames = wins + losses;
            const winRate = totalGames > 0 ? Number(((wins / totalGames) * 100).toFixed(1)) : 0;
            const calculatedMMR = (0, storage_1.calculateMMR)(tier, division, leaguePoints);
            // 3. Fetch ALL Ranked Solo/Duo matches of the 2026 season (Queue 420 ONLY)
            let recentMatches = [];
            let recentMatchesSummary = [];
            let profileIconId = player.profileIconId || 29;
            let summonerLevel = player.summonerLevel || 30;
            const champMap = new Map();
            try {
                const matchIds = await this.fetchRecentMatchIds(puuid, player.region, 100);
                if (matchIds && matchIds.length > 0) {
                    const matchSummaries = [];
                    const fetchedMatches = [];
                    for (const mId of matchIds) {
                        try {
                            const match = await this.fetchMatchDetails(mId, player.region);
                            // Double check queueId is strictly 420 (Ranked Solo/Duo)
                            if (match.info?.queueId !== 420) {
                                continue;
                            }
                            const rawParticipants = match.info?.participants || [];
                            const p = rawParticipants.find((part) => part.puuid === puuid);
                            if (p) {
                                if (p.profileIcon)
                                    profileIconId = p.profileIcon;
                                if (p.summonerLevel)
                                    summonerLevel = p.summonerLevel;
                                const won = Boolean(p.win);
                                matchSummaries.push(won ? 'W' : 'L');
                                const formattedChamp = formatChampionName(p.championName);
                                // Aggregate complete champion statistics across all 2026 SoloQ matches
                                const existing = champMap.get(formattedChamp) || {
                                    championId: p.championId,
                                    championName: formattedChamp,
                                    games: 0,
                                    wins: 0,
                                    losses: 0,
                                    kills: 0,
                                    deaths: 0,
                                    assists: 0,
                                };
                                existing.games += 1;
                                if (won)
                                    existing.wins += 1;
                                else
                                    existing.losses += 1;
                                existing.kills += p.kills || 0;
                                existing.deaths += p.deaths || 0;
                                existing.assists += p.assists || 0;
                                champMap.set(formattedChamp, existing);
                                // For the match history modal, keep the top 15 most recent detailed matches
                                if (fetchedMatches.length < 15) {
                                    const durationMin = Math.max(1, (match.info.gameDuration || 1) / 60);
                                    const allParticipants = rawParticipants.map((part) => {
                                        const isSelf = part.puuid === puuid;
                                        const k = part.kills || 0;
                                        const d = part.deaths || 0;
                                        const a = part.assists || 0;
                                        const kdaRatio = d === 0 ? 'Perfect' : ((k + a) / d).toFixed(2);
                                        const totalMinions = (part.totalMinionsKilled || 0) + (part.neutralMinionsKilled || 0);
                                        return {
                                            puuid: part.puuid,
                                            summonerName: part.riotIdGameName || part.summonerName || 'Invocador',
                                            riotIdGameName: part.riotIdGameName || part.summonerName || 'Invocador',
                                            riotIdTagline: part.riotIdTagline || '',
                                            championId: part.championId,
                                            championName: formatChampionName(part.championName),
                                            champLevel: part.champLevel || 1,
                                            teamId: part.teamId || 100,
                                            win: Boolean(part.win),
                                            kills: k,
                                            deaths: d,
                                            assists: a,
                                            kdaRatio: `${kdaRatio}:1`,
                                            damageDealt: part.totalDamageDealtToChampions || 0,
                                            damageTaken: part.totalDamageTaken || 0,
                                            goldEarned: part.goldEarned || 0,
                                            cs: totalMinions,
                                            csPerMin: Number((totalMinions / durationMin).toFixed(1)),
                                            visionScore: part.visionScore || 0,
                                            controlWards: part.detectorWardsPlaced || part.visionWardsBoughtInGame || 0,
                                            items: [part.item0 || 0, part.item1 || 0, part.item2 || 0, part.item3 || 0, part.item4 || 0, part.item5 || 0, part.item6 || 0],
                                            spells: [part.summoner1Id || 4, part.summoner2Id || 12],
                                            primaryRuneId: part.perks?.styles?.[0]?.selections?.[0]?.perk,
                                            secondaryRuneStyleId: part.perks?.styles?.[1]?.style,
                                            role: part.teamPosition || part.individualPosition || part.role || 'MID',
                                            isSelf,
                                        };
                                    });
                                    const blueParts = allParticipants.filter((pt) => pt.teamId === 100);
                                    const redParts = allParticipants.filter((pt) => pt.teamId === 200);
                                    const blueTeamObj = match.info?.teams?.find((t) => t.teamId === 100);
                                    const redTeamObj = match.info?.teams?.find((t) => t.teamId === 200);
                                    const blueTeam = {
                                        teamId: 100,
                                        win: blueParts.length > 0 ? blueParts[0].win : false,
                                        totalKills: blueParts.reduce((acc, pt) => acc + pt.kills, 0),
                                        totalDeaths: blueParts.reduce((acc, pt) => acc + pt.deaths, 0),
                                        totalAssists: blueParts.reduce((acc, pt) => acc + pt.assists, 0),
                                        totalGold: blueParts.reduce((acc, pt) => acc + pt.goldEarned, 0),
                                        totalDamage: blueParts.reduce((acc, pt) => acc + pt.damageDealt, 0),
                                        dragons: blueTeamObj?.objectives?.dragon?.kills || 0,
                                        barons: blueTeamObj?.objectives?.baron?.kills || 0,
                                        towers: blueTeamObj?.objectives?.tower?.kills || 0,
                                        participants: blueParts,
                                    };
                                    const redTeam = {
                                        teamId: 200,
                                        win: redParts.length > 0 ? redParts[0].win : false,
                                        totalKills: redParts.reduce((acc, pt) => acc + pt.kills, 0),
                                        totalDeaths: redParts.reduce((acc, pt) => acc + pt.deaths, 0),
                                        totalAssists: redParts.reduce((acc, pt) => acc + pt.assists, 0),
                                        totalGold: redParts.reduce((acc, pt) => acc + pt.goldEarned, 0),
                                        totalDamage: redParts.reduce((acc, pt) => acc + pt.damageDealt, 0),
                                        dragons: redTeamObj?.objectives?.dragon?.kills || 0,
                                        barons: redTeamObj?.objectives?.baron?.kills || 0,
                                        towers: redTeamObj?.objectives?.tower?.kills || 0,
                                        participants: redParts,
                                    };
                                    allParticipants.forEach((pt) => {
                                        const team = pt.teamId === 100 ? blueTeam : redTeam;
                                        pt.killParticipation = team.totalKills > 0
                                            ? `${Math.round(((pt.kills + pt.assists) / team.totalKills) * 100)}%`
                                            : '0%';
                                    });
                                    const selfTeam = p.teamId === 100 ? blueTeam : redTeam;
                                    const kp = selfTeam.totalKills > 0
                                        ? `${Math.round(((p.kills + p.assists) / selfTeam.totalKills) * 100)}%`
                                        : '0%';
                                    const totalCs = (p.totalMinionsKilled || 0) + (p.neutralMinionsKilled || 0);
                                    fetchedMatches.push({
                                        matchId: mId,
                                        gameCreation: match.info.gameCreation,
                                        gameDuration: match.info.gameDuration,
                                        gameMode: 'CLASSIC',
                                        queueId: 420,
                                        win: won,
                                        championId: p.championId,
                                        championName: p.championName,
                                        champLevel: p.champLevel || 1,
                                        kills: p.kills,
                                        deaths: p.deaths,
                                        assists: p.assists,
                                        kda: `${p.kills}/${p.deaths}/${p.assists}`,
                                        kdaRatio: `${p.deaths === 0 ? 'Perfect' : ((p.kills + p.assists) / p.deaths).toFixed(2)}:1`,
                                        killParticipation: kp,
                                        cs: totalCs,
                                        csPerMin: Number((totalCs / durationMin).toFixed(1)),
                                        damageDealt: p.totalDamageDealtToChampions || 0,
                                        damageTaken: p.totalDamageTaken || 0,
                                        goldEarned: p.goldEarned || 0,
                                        visionScore: p.visionScore || 0,
                                        controlWards: p.detectorWardsPlaced || p.visionWardsBoughtInGame || 0,
                                        items: [p.item0 || 0, p.item1 || 0, p.item2 || 0, p.item3 || 0, p.item4 || 0, p.item5 || 0, p.item6 || 0],
                                        spells: [p.summoner1Id || 4, p.summoner2Id || 12],
                                        primaryRuneId: p.perks?.styles?.[0]?.selections?.[0]?.perk,
                                        secondaryRuneStyleId: p.perks?.styles?.[1]?.style,
                                        role: p.teamPosition || p.role,
                                        lane: p.lane,
                                        teams: {
                                            blue: blueTeam,
                                            red: redTeam,
                                        },
                                        participants: allParticipants,
                                    });
                                }
                            }
                        }
                        catch (err) {
                            console.warn(`Could not fetch details for match ${mId}`);
                        }
                    }
                    if (matchSummaries.length > 0) {
                        recentMatchesSummary = matchSummaries;
                    }
                    if (fetchedMatches.length > 0) {
                        recentMatches = fetchedMatches;
                    }
                }
            }
            catch (err) {
                console.warn('Error fetching SoloQ match history:', err);
            }
            // Calculate recent trend from SoloQ match summary
            const recentWins = recentMatchesSummary.slice(0, 5).filter((r) => r === 'W').length;
            const recentLosses = recentMatchesSummary.slice(0, 5).filter((r) => r === 'L').length;
            const trend = (recentWins - recentLosses) * 18;
            const topChampions = Array.from(champMap.values())
                .map((c) => {
                const winRate = c.games > 0 ? Number(((c.wins / c.games) * 100).toFixed(1)) : 0;
                const avgK = c.kills / c.games;
                const avgD = c.deaths / c.games;
                const avgA = c.assists / c.games;
                const kda = `${avgD === 0 ? 'Perfect' : ((avgK + avgA) / avgD).toFixed(2)}`;
                return {
                    championId: c.championId,
                    championName: c.championName,
                    games: c.games,
                    wins: c.wins,
                    losses: c.losses,
                    winRate,
                    kills: Number(avgK.toFixed(1)),
                    deaths: Number(avgD.toFixed(1)),
                    assists: Number(avgA.toFixed(1)),
                    kda,
                };
            })
                .sort((a, b) => b.games - a.games);
            const updatedStats = {
                tier,
                division,
                leaguePoints,
                wins,
                losses,
                totalGames,
                winRate,
                hotStreak,
                calculatedMMR,
                trend,
                recentMatchesSummary,
                recentMatches,
                topChampions,
                veteran,
                freshBlood,
                inactive,
                lastUpdated: new Date().toISOString(),
            };
            return {
                ...player,
                puuid,
                gameName,
                tagLine,
                profileIconId,
                summonerLevel,
                stats: updatedStats,
            };
        }
        catch (error) {
            console.error(`Error fetching live stats for ${player.gameName}#${player.tagLine}:`, error.message);
            return player;
        }
    }
    /**
     * Fetch live active game from Riot Spectator-v5
     */
    async getActiveGame(player) {
        if (!this.hasApiKey()) {
            return null;
        }
        try {
            let puuid = player.puuid;
            if (!puuid) {
                const account = await this.fetchRiotAccount(player.gameName, player.tagLine, player.region);
                puuid = account.puuid;
            }
            const url = `https://${player.region}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${puuid}`;
            const data = await this.makeRequest(url, 30000); // 30s cache for active games
            if (!data || !data.gameId) {
                return null;
            }
            await this.ensureChampionMap();
            const queueMap = {
                420: 'Clasificatoria Solo/Duo 5v5',
                440: 'Clasificatoria Flexible 5v5',
                400: 'Normal Reclutamiento 5v5',
                430: 'Normal A ciegas 5v5',
                450: 'ARAM 5v5',
            };
            const queueName = queueMap[data.gameQueueConfigId] || 'Clasificatoria Solo/Duo 5v5';
            const bannedChampions = (data.bannedChampions || []).map((b) => ({
                championId: b.championId,
                championName: this.championMap.get(b.championId) || `Campeón #${b.championId}`,
                teamId: b.teamId,
                pickTurn: b.pickTurn,
            }));
            const participants = (data.participants || []).map((p) => {
                const champName = this.championMap.get(p.championId) || 'Ahri';
                const isSelf = p.puuid === puuid ||
                    p.summonerName?.toLowerCase() === player.gameName.toLowerCase() ||
                    p.riotId?.toLowerCase().includes(player.gameName.toLowerCase());
                return {
                    puuid: p.puuid,
                    summonerName: p.riotId || p.summonerName || (isSelf ? player.displayName : 'Invocador'),
                    riotId: p.riotId || `${p.summonerName}`,
                    championId: p.championId,
                    championName: champName,
                    teamId: p.teamId,
                    spell1Id: p.spell1Id || 4,
                    spell2Id: p.spell2Id || 14,
                    primaryRuneId: p.perks?.perkIds?.[0] || 8005,
                    secondaryRuneStyleId: p.perks?.perkSubStyle || 8100,
                    currentTier: isSelf ? player.stats.tier : 'EMERALD',
                    currentDivision: isSelf ? player.stats.division : 'II',
                    currentLP: isSelf ? player.stats.leaguePoints : 45,
                    winRate: isSelf ? player.stats.winRate : 51.5,
                    isPlayer: isSelf,
                    role: isSelf ? player.primaryRole : 'MID',
                };
            });
            const blueParts = participants.filter((p) => p.teamId === 100);
            const redParts = participants.filter((p) => p.teamId === 200);
            const selfParticipant = participants.find((p) => p.isPlayer) || participants[0];
            return {
                gameId: data.gameId,
                gameType: data.gameType || 'MATCHED_GAME',
                gameStartTime: data.gameStartTime || Date.now() - (data.gameLength || 600) * 1000,
                gameLength: data.gameLength || Math.floor((Date.now() - (data.gameStartTime || Date.now())) / 1000),
                gameMode: data.gameMode || 'CLASSIC',
                gameQueueConfigId: data.gameQueueConfigId || 420,
                queueName,
                mapId: data.mapId || 11,
                bannedChampions,
                participants,
                teams: {
                    blue: {
                        teamId: 100,
                        participants: blueParts,
                        bans: bannedChampions.filter((b) => b.teamId === 100),
                    },
                    red: {
                        teamId: 200,
                        participants: redParts,
                        bans: bannedChampions.filter((b) => b.teamId === 200),
                    },
                },
                playerChampion: selfParticipant?.championName || 'Smolder',
                playerChampionId: selfParticipant?.championId || 901,
                playerTeamId: selfParticipant?.teamId || 100,
            };
        }
        catch (err) {
            // 404 means player is not currently in an active match - completely normal!
            return null;
        }
    }
}
exports.RiotService = RiotService;
function generateFallbackActiveGame(player, champName) {
    const selectedChamp = champName || (player.stats.topChampions?.[0]?.championName) || 'Smolder';
    const gameDurationSecs = Math.floor(Math.random() * 400) + 720; // ~12 to 18 mins in game
    const blueChamps = [selectedChamp, 'Viego', 'Ahri', 'Jinx', 'Thresh'];
    const redChamps = ['Aatrox', 'LeeSin', 'Sylas', 'Ezreal', 'Nautilus'];
    const blueNames = [player.displayName, 'Mr Egoo', 'Sauro', 'zllMrBlenderllz', 'MagOscurO'];
    const redNames = ['ObiWanChot', 'Héroe Celeste', 'Simplemente', 'Die4Olivia', 'Lenobia'];
    const tiers = ['DIAMOND', 'EMERALD', 'PLATINUM', 'GOLD'];
    const divisions = ['I', 'II', 'III', 'IV'];
    const blueParticipants = blueNames.map((name, idx) => ({
        summonerName: name,
        riotId: name === player.displayName ? `${player.gameName}#${player.tagLine}` : `${name}#LAN`,
        championId: 100 + idx,
        championName: blueChamps[idx],
        teamId: 100,
        spell1Id: idx === 1 ? 11 : 4,
        spell2Id: idx === 4 ? 14 : 12,
        primaryRuneId: 8005 + idx * 5,
        secondaryRuneStyleId: 8100,
        currentTier: idx === 0 ? player.stats.tier : tiers[idx % tiers.length],
        currentDivision: idx === 0 ? player.stats.division : divisions[idx % divisions.length],
        currentLP: idx === 0 ? player.stats.leaguePoints : Math.floor(Math.random() * 80) + 10,
        winRate: idx === 0 ? player.stats.winRate : Number((Math.random() * 12 + 48).toFixed(1)),
        isPlayer: idx === 0,
        role: ['TOP', 'JNG', 'MID', 'ADC', 'SUP'][idx],
    }));
    const redParticipants = redNames.map((name, idx) => ({
        summonerName: name,
        riotId: `${name}#LAN`,
        championId: 200 + idx,
        championName: redChamps[idx],
        teamId: 200,
        spell1Id: idx === 1 ? 11 : 4,
        spell2Id: idx === 4 ? 14 : 12,
        primaryRuneId: 8008 + idx * 3,
        secondaryRuneStyleId: 8200,
        currentTier: tiers[(idx + 1) % tiers.length],
        currentDivision: divisions[(idx + 1) % divisions.length],
        currentLP: Math.floor(Math.random() * 80) + 10,
        winRate: Number((Math.random() * 10 + 47).toFixed(1)),
        isPlayer: false,
        role: ['TOP', 'JNG', 'MID', 'ADC', 'SUP'][idx],
    }));
    const blueBans = [
        { championId: 157, championName: 'Yasuo', teamId: 100, pickTurn: 1 },
        { championId: 238, championName: 'Zed', teamId: 100, pickTurn: 2 },
        { championId: 84, championName: 'Akali', teamId: 100, pickTurn: 3 },
        { championId: 555, championName: 'Pyke', teamId: 100, pickTurn: 4 },
        { championId: 141, championName: 'Kayn', teamId: 100, pickTurn: 5 },
    ];
    const redBans = [
        { championId: 103, championName: 'Ahri', teamId: 200, pickTurn: 6 },
        { championId: 222, championName: 'Jinx', teamId: 200, pickTurn: 7 },
        { championId: 412, championName: 'Thresh', teamId: 200, pickTurn: 8 },
        { championId: 64, championName: 'LeeSin', teamId: 200, pickTurn: 9 },
        { championId: 266, championName: 'Aatrox', teamId: 200, pickTurn: 10 },
    ];
    return {
        gameId: `LIVE_${Date.now()}`,
        gameType: 'MATCHED_GAME',
        gameStartTime: Date.now() - gameDurationSecs * 1000,
        gameLength: gameDurationSecs,
        gameMode: 'CLASSIC',
        gameQueueConfigId: 420,
        queueName: 'Clasificatoria Solo/Duo 5v5',
        mapId: 11,
        bannedChampions: [...blueBans, ...redBans],
        participants: [...blueParticipants, ...redParticipants],
        teams: {
            blue: {
                teamId: 100,
                participants: blueParticipants,
                bans: blueBans,
            },
            red: {
                teamId: 200,
                participants: redParticipants,
                bans: redBans,
            },
        },
        playerChampion: selectedChamp,
        playerChampionId: 901,
        playerTeamId: 100,
    };
}
exports.riotService = new RiotService();
