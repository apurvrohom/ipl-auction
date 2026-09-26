import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLAYERS_DIR = path.join(__dirname, "../../src/data/players");

// Minimal RFC4180 CSV parser (handles quoted fields with embedded commas,
// e.g. photo URLs like `"https://...,width-400,.../img.jpg"`).
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c === "\r") {
      // skip — \r\n line endings
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

const normKey = (s) => s.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

// Parses one CSV file into row objects keyed by normalized header name
// (e.g. "Base Price ( In Lakhs )" -> "basepriceinlakhs"), in file order.
function readCsvRows(fileName) {
  const text = fs.readFileSync(path.join(PLAYERS_DIR, fileName), "utf8");
  const [header, ...dataRows] = parseCsv(text);
  const keys = header.map(normKey);
  return dataRows.map((cells) => {
    const obj = {};
    keys.forEach((k, i) => {
      obj[k] = (cells[i] ?? "").trim();
    });
    return obj;
  });
}

const pick = (row, ...candidates) => {
  for (const c of candidates) {
    if (row[c] !== undefined && row[c] !== "") return row[c];
  }
  return "";
};
const toInt = (v) => (v === "" || v == null ? 0 : Math.round(Number(v)) || 0);
const toFloatOrNull = (v) => (v === "" || v == null ? null : Number(v));

// Auction queue order: batters, then bowlers, then all-rounders, then
// wicket-keepers — capped before uncapped within each role. Row order
// inside each CSV is preserved as-is; the CSV's own "#" serial column is
// ignored.
const GROUPS = [
  { file: "batsman-capped.csv", category: "Batsman", capped: true },
  { file: "batsman-uncapped.csv", category: "Batsman", capped: false },
  { file: "bowlers-capped.csv", category: "Bowler", capped: true },
  { file: "bowlers-uncapped.csv", category: "Bowler", capped: false },
  { file: "all-rounders-capped.csv", category: "All Rounder", capped: true },
  { file: "all-rounders-uncapped.csv", category: "All Rounder", capped: false },
  { file: "wicket-keepers-capped.csv", category: "Wicket Keeper", capped: true },
  { file: "wicket-keepers-uncapped.csv", category: "Wicket Keeper", capped: false },
];

export function buildPlayersFromCsv() {
  const players = [];
  let order = 0;
  for (const { file, category, capped } of GROUPS) {
    const rows = readCsvRows(file);
    for (const row of rows) {
      order += 10;
      players.push({
        playerName: pick(row, "player"),
        playerImage: pick(row, "photo") || null,
        basePrice: toInt(pick(row, "basepriceinlakhs")),
        category,
        isCapped: capped,
        isOverseas: pick(row, "foreign").toLowerCase() === "yes",
        auctionOrder: order,
        matches: toInt(pick(row, "matches")),
        runs: toInt(pick(row, "runs", "2026runs")),
        batAvg: toFloatOrNull(pick(row, "battingaverage")),
        sr: toFloatOrNull(pick(row, "strikerate")),
        catches: toInt(pick(row, "catches")),
        stumpings: toInt(pick(row, "stumpings")),
        wickets: toInt(pick(row, "wkts", "2026wkts", "wickets")),
        bowlAvg: toFloatOrNull(pick(row, "bowlingaverage")),
        eco: toFloatOrNull(pick(row, "economy")),
      });
    }
  }
  return players;
}
