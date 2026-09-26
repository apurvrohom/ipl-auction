-- Capped/uncapped status per player, alongside the existing `category`
-- column which already holds the role (Batsman / Bowler / Wicket Keeper /
-- All Rounder).
ALTER TABLE "CricketPlayers" ADD COLUMN IF NOT EXISTS "is_capped" BOOLEAN NOT NULL DEFAULT false;
