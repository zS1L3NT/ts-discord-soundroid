/*
  Warnings:

  - The primary key for the `Alias` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Alias" DROP CONSTRAINT "Alias_pkey",
ADD CONSTRAINT "Alias_pkey" PRIMARY KEY ("guild_id", "alias", "command");
