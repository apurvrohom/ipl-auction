import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { buildPlayersFromCsv } from "./csvPlayers.js";

// Players-only reseed: wipes CricketPlayers and reloads from the auction
// CSVs, but leaves Teams/purses and the event log untouched — use this
// instead of seed.js when you just need a fresh player pool.
const prisma = new PrismaClient();

async function main() {
  await prisma.player.deleteMany();

  const players = buildPlayersFromCsv();
  await prisma.player.createMany({ data: players });

  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"CricketPlayers"', 'id'), COALESCE((SELECT MAX(id) FROM "CricketPlayers"), 1))`
  );

  // Any lot that was mid-bid on the old pool no longer has a valid player.
  await prisma.auctionState.upsert({
    where: { id: 1 },
    update: { status: "IDLE", currentPlayerId: null },
    create: { id: 1, status: "IDLE" },
  });

  console.log(`Seeded ${players.length} players from CSV.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
