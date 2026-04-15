import * as cheerio from "cheerio";

export const dynamic = "force-dynamic";
export const revalidate = 300;

const ZONES = [
  "Stonewood",
  "Plankerton",
  "Canny Valley",
  "Twine Peaks",
  "Ventures",
];

const ALERT_TYPES = [
  "Storm Alerts",
  "Mini Boss Alerts",
  "Mega Alerts",
  "Elemental Alerts",
  "Misc",
];

const MISSION_PREFIXES = [
  "Category ",
  "Ride the Lightning",
  "Retrieve the Data",
  "Evacuate the Shelter",
  "Repair the Shelter",
  "Resupply",
  "Eliminate and Collect",
  "Destroy the Encampments",
  "Build the Radar",
  "Refuel the Homebase",
  "Rescue the Survivors",
  "Launch the Rocket",
  "Fight the Storm",
  "Deliver the Bomb",
];

function normalizeLine(line) {
  return String(line || "")
    .replace(/^#+\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isZone(line) {
  const clean = normalizeLine(line);
  return ZONES.some((zone) => zone.toLowerCase() === clean.toLowerCase());
}

function normalizeZone(line) {
  const clean = normalizeLine(line);
  return ZONES.find((zone) => zone.toLowerCase() === clean.toLowerCase()) || clean;
}

function isAlertType(line) {
  const clean = normalizeLine(line);
  return ALERT_TYPES.some((type) => type.toLowerCase() === clean.toLowerCase());
}

function normalizeAlertType(line) {
  const clean = normalizeLine(line);
  return ALERT_TYPES.find((type) => type.toLowerCase() === clean.toLowerCase()) || clean;
}

function isPowerLevel(line) {
  return /^-?\d{1,3}$/.test(normalizeLine(line));
}

function isMissionName(line) {
  const clean = normalizeLine(line);
  return MISSION_PREFIXES.some((prefix) => clean.startsWith(prefix));
}

function extractLinesFromHtml(html) {
  const $ = cheerio.load(html);

  $("br").replaceWith("\n");
  $("h1, h2, h3, h4, h5, h6, p, li, div, section, article, tr").prepend("\n");

  const raw = $.root().text();

  return raw
    .split("\n")
    .map(normalizeLine)
    .filter(Boolean)
    .filter((line) => line !== "Image");
}

function cleanRewardMeta(meta) {
  return meta
    .map(normalizeLine)
    .filter(Boolean)
    .filter((line) => !isZone(line))
    .filter((line) => !isAlertType(line))
    .filter((line) => !/^(Filters|Zone|Reward Types|Alert Type|Show Modifiers|All Rewards|x4|All|Missions -)$/i.test(line))
    .filter((line) => !/^https?:/i.test(line));
}

function parseAllMissions(lines) {
  const missions = [];
  let currentZone = null;
  let currentType = null;
  let currentMission = null;
  let reachedBoard = false;

  function flushMission() {
    if (!currentMission) return;

    const rewardText = cleanRewardMeta(currentMission.meta)
      .slice(0, 8)
      .join(" • ");

    missions.push({
      id: `${currentMission.zone}-${currentMission.alertType}-${currentMission.title}-${currentMission.powerLevel || "na"}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-"),
      zone: currentMission.zone,
      alertType: currentMission.alertType,
      powerLevel: currentMission.powerLevel,
      title: currentMission.title,
      rewardText,
      isVbucks:
        currentMission.alertType === "Mini Boss Alerts" &&
        /v-?buck/i.test(rewardText),
    });

    currentMission = null;
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = normalizeLine(lines[i]);
    const next = normalizeLine(lines[i + 1] || "");

    if (/^Mission Alerts$/i.test(line) || /^Missions -$/i.test(line)) {
      reachedBoard = true;
      continue;
    }

    if (!reachedBoard) continue;

    if (isZone(line)) {
      flushMission();
      currentZone = normalizeZone(line);
      currentType = null;
      continue;
    }

    if (isAlertType(line)) {
      flushMission();
      currentType = normalizeAlertType(line);
      continue;
    }

    if (!currentZone || !currentType) continue;

    if (isPowerLevel(line) && isMissionName(next)) {
      flushMission();
      currentMission = {
        zone: currentZone,
        alertType: currentType,
        powerLevel: line,
        title: next,
        meta: [],
      };
      i += 1;
      continue;
    }

    if (isMissionName(line)) {
      flushMission();
      currentMission = {
        zone: currentZone,
        alertType: currentType,
        powerLevel: "",
        title: line,
        meta: [],
      };
      continue;
    }

    if (currentMission) {
      currentMission.meta.push(line);
    }
  }

  flushMission();

  return missions.filter(
    (mission) =>
      mission.zone &&
      mission.alertType &&
      mission.title &&
      !/^(Mission Alerts|Database|Misc|Site)$/i.test(mission.title)
  );
}

function parseVbucksMissions(lines) {
  const missions = [];
  let currentZone = null;
  let seenToday = false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = normalizeLine(lines[i]);

    if (/^TODAY$/i.test(line)) {
      seenToday = true;
      continue;
    }

    if (!seenToday) continue;

    if (/^Timed Missions tracking in Fortnite stw$/i.test(line)) {
      break;
    }

    if (isZone(line)) {
      currentZone = normalizeZone(line);
      continue;
    }

    if (!currentZone) continue;

    const match = line.match(/^(.+?)\s+(\d{1,3})\s+(.+)$/);
    if (!match) continue;

    const title = normalizeLine(match[1]);
    const powerLevel = match[2];
    const reward = normalizeLine(match[3]);

    missions.push({
      id: `vbucks-${currentZone}-${powerLevel}-${title}-${reward}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-"),
      zone: currentZone,
      alertType: "Mini Boss Alerts",
      powerLevel,
      title,
      rewardText: reward,
      isVbucks: /v-?buck/i.test(reward),
    });
  }

  return missions;
}

function getNextUtcResetIso() {
  const now = new Date();
  const next = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0,
      0,
      0
    )
  );
  return next.toISOString();
}

export async function GET() {
  try {
    const [vbucksRes, missionsRes] = await Promise.all([
      fetch("https://freethevbucks.com/timed-missions/", {
        cache: "no-store",
        headers: { "User-Agent": "Mozilla/5.0" },
      }),
      fetch("https://stw-planner.com/mission-alerts", {
        cache: "no-store",
        headers: { "User-Agent": "Mozilla/5.0" },
      }),
    ]);

    if (!vbucksRes.ok || !missionsRes.ok) {
      throw new Error("No se pudieron consultar las fuentes de STW");
    }

    const [vbucksHtml, missionsHtml] = await Promise.all([
      vbucksRes.text(),
      missionsRes.text(),
    ]);

    const vbucksLines = extractLinesFromHtml(vbucksHtml);
    const missionLines = extractLinesFromHtml(missionsHtml);

    const allMissions = parseAllMissions(missionLines);
    const vbucksMissions = parseVbucksMissions(vbucksLines);

    const zones = [...new Set(allMissions.map((m) => m.zone))];
    const alertTypes = [...new Set(allMissions.map((m) => m.alertType))];

    return Response.json({
      updatedAt: new Date().toISOString(),
      nextResetAt: getNextUtcResetIso(),
      vbucks: {
        totalMissions: vbucksMissions.length,
        totalVbucks: vbucksMissions.reduce(
          (sum, m) => sum + (/50 V-Bucks/i.test(m.rewardText) ? 50 : 0),
          0
        ),
        missions: vbucksMissions,
      },
      missions: allMissions,
      filters: {
        zones,
        alertTypes,
      },
      debug: {
        parsedMissionCount: allMissions.length,
        parsedVbucksCount: vbucksMissions.length,
      },
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Error al obtener datos de STW",
      },
      { status: 500 }
    );
  }
}