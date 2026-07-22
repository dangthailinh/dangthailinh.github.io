import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const API_KEY = process.env.RIOT_API_KEY;
const GAME_NAME = process.env.RIOT_GAME_NAME || 'Anh độ mundo';
const TAG_LINE = process.env.RIOT_TAG_LINE || 'độ36';
const PLATFORM = (process.env.RIOT_PLATFORM || 'vn2').toLowerCase();
const REGION = (process.env.RIOT_REGION || 'sea').toLowerCase();
const MATCH_COUNT = Math.min(Math.max(Number(process.env.RIOT_MATCH_COUNT || 8), 1), 12);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = resolve(ROOT, 'data', 'lol-profile.json');

if (!API_KEY) {
  throw new Error('Thiếu RIOT_API_KEY. Hãy thêm key vào GitHub Actions Secret trước khi chạy đồng bộ.');
}

const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));

async function requestJson(url, options = {}) {
  const isRiot = options.riot !== false;
  const headers = isRiot ? { 'X-Riot-Token': API_KEY } : {};

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(url, { headers });
    if (response.status === 429 && attempt < 2) {
      const retryAfter = Number(response.headers.get('retry-after') || 2);
      await sleep(Math.max(1, retryAfter) * 1000);
      continue;
    }
    if (!response.ok) {
      const body = await response.text();
      const error = new Error(`Riot request failed: ${response.status} ${url}\n${body.slice(0, 400)}`);
      error.status = response.status;
      throw error;
    }
    return response.json();
  }
  throw new Error(`Không thể tải dữ liệu sau nhiều lần thử: ${url}`);
}

function queueName(queueId) {
  const queues = {
    0: 'Custom',
    400: 'Normal Draft',
    420: 'Ranked Solo/Duo',
    430: 'Normal Blind',
    440: 'Ranked Flex',
    450: 'ARAM',
    490: 'Quickplay',
    700: 'Clash',
    830: 'Co-op vs AI',
    840: 'Co-op vs AI',
    850: 'Co-op vs AI',
    900: 'ARURF',
    1020: 'One for All',
    1300: 'Nexus Blitz',
    1700: 'Arena',
    1710: 'Arena',
    1810: 'Swarm',
    1820: 'Swarm',
    1830: 'Swarm',
    1840: 'Swarm',
    1900: 'URF'
  };
  return queues[queueId] || `Queue ${queueId}`;
}

function durationLabel(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const minutes = Math.floor(total / 60);
  return `${minutes}:${String(total % 60).padStart(2, '0')}`;
}

const accountUrl = `https://${REGION}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(GAME_NAME)}/${encodeURIComponent(TAG_LINE)}`;
const account = await requestJson(accountUrl);
const puuid = account.puuid;

if (!puuid) throw new Error('Riot Account API không trả về PUUID cho Riot ID đã cấu hình.');

const platformBase = `https://${PLATFORM}.api.riotgames.com`;
const regionBase = `https://${REGION}.api.riotgames.com`;
const summoner = await requestJson(`${platformBase}/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}`);

let ranks = [];
try {
  ranks = await requestJson(`${platformBase}/lol/league/v4/entries/by-puuid/${encodeURIComponent(puuid)}`);
} catch (error) {
  if (error.status !== 404 || !summoner.id) throw error;
  ranks = await requestJson(`${platformBase}/lol/league/v4/entries/by-summoner/${encodeURIComponent(summoner.id)}`);
}

const masteries = await requestJson(`${platformBase}/lol/champion-mastery/v4/champion-masteries/by-puuid/${encodeURIComponent(puuid)}/top?count=6`);
const matchIds = await requestJson(`${regionBase}/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?start=0&count=${MATCH_COUNT}`);

const versions = await requestJson('https://ddragon.leagueoflegends.com/api/versions.json', { riot: false });
const dataDragonVersion = versions[0];
const championPayload = await requestJson(`https://ddragon.leagueoflegends.com/cdn/${encodeURIComponent(dataDragonVersion)}/data/vi_VN/champion.json`, { riot: false });
const championsByKey = Object.values(championPayload.data || {}).reduce((map, champion) => {
  map[String(champion.key)] = { name: champion.name, slug: champion.id };
  return map;
}, {});

const matchPayloads = [];
for (const matchId of matchIds) {
  matchPayloads.push(await requestJson(`${regionBase}/lol/match/v5/matches/${encodeURIComponent(matchId)}`));
  await sleep(80);
}

const cleanRanks = ranks.map((entry) => {
  const games = Number(entry.wins || 0) + Number(entry.losses || 0);
  return {
    queueType: entry.queueType,
    tier: entry.tier,
    rank: entry.rank,
    leaguePoints: entry.leaguePoints,
    wins: entry.wins,
    losses: entry.losses,
    winRate: games ? Math.round(Number(entry.wins || 0) / games * 100) : 0
  };
});

const cleanMasteries = masteries.map((entry) => {
  const champion = championsByKey[String(entry.championId)] || { name: `Champion ${entry.championId}`, slug: 'DrMundo' };
  return {
    championId: entry.championId,
    championName: champion.name,
    championSlug: champion.slug,
    level: entry.championLevel,
    points: entry.championPoints,
    lastPlayTime: entry.lastPlayTime ? new Date(entry.lastPlayTime).toISOString() : null
  };
});

const cleanMatches = matchPayloads.map((match) => {
  const participant = (match.info?.participants || []).find((player) => player.puuid === puuid);
  if (!participant) return null;
  const champion = championsByKey[String(participant.championId)] || { name: participant.championName, slug: participant.championName };
  const deaths = Number(participant.deaths || 0);
  const kda = (Number(participant.kills || 0) + Number(participant.assists || 0)) / Math.max(1, deaths);
  const duration = Number(match.info.gameDuration || 0) || Math.max(0, Math.round((Number(match.info.gameEndTimestamp || 0) - Number(match.info.gameStartTimestamp || 0)) / 1000));
  return {
    matchId: match.metadata?.matchId,
    queueId: match.info?.queueId,
    queueName: queueName(match.info?.queueId),
    gameCreation: new Date(match.info?.gameCreation || Date.now()).toISOString(),
    durationSeconds: duration,
    durationLabel: durationLabel(duration),
    win: Boolean(participant.win),
    championId: participant.championId,
    championName: champion.name,
    championSlug: champion.slug,
    kills: participant.kills,
    deaths: participant.deaths,
    assists: participant.assists,
    kda: kda.toFixed(2),
    cs: Number(participant.totalMinionsKilled || 0) + Number(participant.neutralMinionsKilled || 0),
    visionScore: participant.visionScore,
    role: participant.teamPosition || participant.individualPosition || 'UNKNOWN',
    items: [participant.item0, participant.item1, participant.item2, participant.item3, participant.item4, participant.item5, participant.item6].filter((id) => Number(id) > 0)
  };
}).filter(Boolean);

const output = {
  status: 'ready',
  generatedAt: new Date().toISOString(),
  dataDragonVersion,
  profile: {
    gameName: account.gameName || GAME_NAME,
    tagLine: account.tagLine || TAG_LINE,
    platform: PLATFORM.toUpperCase(),
    summonerLevel: summoner.summonerLevel,
    profileIconId: summoner.profileIconId
  },
  ranks: cleanRanks,
  masteries: cleanMasteries,
  matches: cleanMatches
};

await mkdir(dirname(OUTPUT), { recursive: true });
await writeFile(OUTPUT, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`Đã cập nhật ${OUTPUT} cho ${output.profile.gameName}#${output.profile.tagLine}.`);
