import "dotenv/config";
import { PrismaClient } from "@prisma/client";

// Teams still come from the frontend dummy dataset; players are seeded from
// the auction-list CSVs (see csvPlayers.js) instead.
import { dummyTeams } from "../../src/data/dummyData.js";
import { buildPlayersFromCsv } from "./csvPlayers.js";

const prisma = new PrismaClient();

async function main() {
  // Clean first so re-seeding is idempotent.
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
  // Fresh league (e.g. 5 -> 10 teams) invalidates old sales, so clear the
  // event log and park the auction desk back at IDLE.
  await prisma.auctionLog.deleteMany();

  for (const t of dummyTeams) {
    await prisma.team.create({
      data: {
        id: t.id,
        teamName: t.team_name,
        purse: t.purse,
        teamLogo: t.team_logo ?? null,
        textColor: t.text_color ?? null,
        color1: t.color1 ?? null,
        color2: t.color2 ?? null,
      },
    });
  }

  const players = buildPlayersFromCsv();
  await prisma.player.createMany({ data: players });

  // Keep SERIAL sequences in sync since we inserted explicit ids.
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"Teams"', 'id'), COALESCE((SELECT MAX(id) FROM "Teams"), 1))`
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"CricketPlayers"', 'id'), COALESCE((SELECT MAX(id) FROM "CricketPlayers"), 1))`
  );

  // Park a fresh singleton auction desk at IDLE (upsert: the running
  // backend's poller may recreate the row at any moment).
  await prisma.auctionState.upsert({
    where: { id: 1 },
    update: {
      status: "IDLE",
      currentPlayerId: null,
    },
    create: { id: 1, status: "IDLE" },
  });

  const [teamCount, playerCount] = await Promise.all([
    prisma.team.count(),
    prisma.player.count(),
  ]);
  console.log(`Seeded ${teamCount} teams and ${playerCount} players.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
