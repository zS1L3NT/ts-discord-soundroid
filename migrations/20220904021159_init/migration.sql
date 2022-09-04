-- CreateTable
CREATE TABLE "Alias" (
    "guild_id" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "command" TEXT NOT NULL,

    CONSTRAINT "Alias_pkey" PRIMARY KEY ("alias","command")
);

-- CreateTable
CREATE TABLE "Entry" (
    "guild_id" TEXT NOT NULL,
    "prefix" TEXT,
    "log_channel_id" TEXT,
    "music_channel_id" TEXT,
    "music_message_id" TEXT,

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("guild_id")
);
