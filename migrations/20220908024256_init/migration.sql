-- CreateTable
CREATE TABLE "Alias" (
    "guild_id" STRING NOT NULL,
    "alias" STRING NOT NULL,
    "command" STRING NOT NULL,

    CONSTRAINT "Alias_pkey" PRIMARY KEY ("guild_id","alias","command")
);

-- CreateTable
CREATE TABLE "Entry" (
    "guild_id" STRING NOT NULL,
    "prefix" STRING,
    "log_channel_id" STRING,
    "music_channel_id" STRING,
    "music_message_id" STRING,

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("guild_id")
);
