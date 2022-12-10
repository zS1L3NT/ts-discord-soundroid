![SounDroid Cover Image](https://res.cloudinary.com/zs1l3nt/image/upload/repositories/ts-discord-soundroid.png)

# SounDroid

![License](https://img.shields.io/github/license/zS1L3NT/ts-discord-soundroid?style=for-the-badge) ![Languages](https://img.shields.io/github/languages/count/zS1L3NT/ts-discord-soundroid?style=for-the-badge) ![Top Language](https://img.shields.io/github/languages/top/zS1L3NT/ts-discord-soundroid?style=for-the-badge) ![Commit Activity](https://img.shields.io/github/commit-activity/y/zS1L3NT/ts-discord-soundroid?style=for-the-badge) ![Last commit](https://img.shields.io/github/last-commit/zS1L3NT/ts-discord-soundroid?style=for-the-badge)

SounDroid (Discord) is a Discord Music bot that plays music from Spotify or YouTube. SounDroid was built as a Discord Bot version of [SounDroid v1](https://github.com/zS1L3NT/soundroid-v1).

From 25 October 2022, SounDroid has been discontinued (only hosted privately) due me being unable to find a free hosting service that provides both **enough RAM** and a **strong enough internet connection** that can run the music bot. SounDroid used to work flawlessly with Heroku until they removed their free tier. Thank you to everyone who has used and supported SounDroid.

## Motivation

I always liked [Rythm Bot](https://rythm.fm/) (Discord's most popular music bot) and its capibilities of playing music in a voice channel based on what song was requested, be it Spotify or YouTube.
I also used to have a music bot (IUFanBot) that works like Rythm.
However, many events happened which lead to the creation of SounDroid bot

1.  I lost the source code to IUFanBot because I built it long before I started using Git
2.  On 6 August 2021, [discord.js v13](https://github.com/discordjs/discord.js/releases/tag/13.0.0) was released where they changed a lot of things relating to how music bots should be built
3.  On 15 September 2021, Rythm Bot was forced to shut down, leading to a need for an alternative

Because I just finished building [SounDroid v1](https://github.com/zS1L3NT/soundroid-v1) for a school project, I decided to name this new Discord bot after the app.

## Features

-   Discord Commands (Interactions)
    -   Song playing
        -   `/play` - Add song to queue. Songs can come from either
            -   A YouTube Video Link
            -   A YouTube Playlist Link
            -   A Spotify Song Link
            -   A Spotify Playlist Link
            -   A Spotify Album Link
            -   A YouTube Music Query
            -   A YouTube Video Query
        -   `/play-range` - Add playlist defining range of songs to add. Playlists links can be either
            -   A YouTube Playlist Link
            -   A Spotify Playlist Link
        -   `/play-again` - Repeat the current song a specified number of times
        -   `/now-playing` - Shows information about the song currently being played
    -   Basic Music Controls
        -   `/pause`
        -   `/resume`
        -   `/skip`
        -   `/loop` - Loop the current song
        -   `/queue-loop` - Loop the entire queue
        -   `/restart` - Restart the current song
    -   Queue Management
        -   `/clear-queue`
        -   `/leave-cleanup` - Removes songs added by users who aren't in the VC
        -   `/remove` - Remove a song or a range of songs
        -   `/move` - Move a song in the queue to anywhere in the playlist
        -   `/shuffle`
    -   Other Commands
        -   `/help` - Opens an interactive help menu describing all commands and how to use them
        -   `/lyrics` - Fetches the lyrics of a song or a query
        -   `/queue` - Shows information about the entire queue
-   Message Commands
    -   Other than Using slash commands, all commands above can also be triggered by messages, where `/` is replaced by the defined prefix in the server.
    -   This defined prefix can only be changed with the `/set prefix` command
    -   e.g. If the prefix is defined as `.`, `.play IU Lilac` will do the same thing as `/play IU Lilac`
    -   Aliases can be set for all message commands to make using message commands easier. `.play` can have the alias `.p`
-   Music Channel
    -   Instead of always having to request to see the queue, SounDroid can take over a text channel and always display the most up-to-date queue there. Text channel must be empty and any new messages will be cleared
-   SounDroid will disconnect from a Voice Channel if
    -   No song was played for 1 minute
    -   No user was in the VC with SounDroid for 1 minute
-   SounDroid's name will change based on
    -   The name of the song currently playing
    -   The status of the music
        -   Playing
        -   Paused
        -   Loading
-   SounDroid is built on top of [nova-bot](https://github.com/zS1L3NT/ts-npm-nova-bot), a Discord Bot framework meant for building bots more easily
-   Song Selection Menu
    -   When you try to play a song through a search query, SounDroid gives you a song selection menu to choose which song matched your query. With this unique search menu, you can make sure the song you are searching for is the correct song, and not just the "first result from youtube" as most bots do it
    -   You can also toggle between searching YouTube Music and YouTube for search results
        ![image](https://user-images.githubusercontent.com/26828488/152838636-772b6a73-5d3d-4c72-891c-4b0880a4306f.png)

## Usage

Copy the `.env.example` file to `.env` then fill in the correct project credentials

```
$ npm i
$ npm run dev
```

## Credits

DiscordJS provided a template for a music playing bot [here](https://github.com/discordjs/voice/tree/3dabc30fca79212809d1191e0c2f2b54c3f8cdc7/examples/music-bot). My music player was built on top of this example bot.

## Built with

-	NodeJS
	-	TypeScript
        -   [![@types/node](https://img.shields.io/badge/%40types%2Fnode-%5E18.7.14-red?style=flat-square)](https://npmjs.com/package/@types/node/v/18.7.14)
        -   [![@types/spotify-web-api-node](https://img.shields.io/badge/%40types%2Fspotify--web--api--node-%5E5.0.7-red?style=flat-square)](https://npmjs.com/package/@types/spotify-web-api-node/v/5.0.7)
        -   [![typescript](https://img.shields.io/badge/typescript-%5E4.8.2-red?style=flat-square)](https://npmjs.com/package/typescript/v/4.8.2)
	-	Discord APIs
        -   [![@discordjs/opus](https://img.shields.io/badge/%40discordjs%2Fopus-%5E0.8.0-red?style=flat-square)](https://npmjs.com/package/@discordjs/opus/v/0.8.0)
        -   [![@discordjs/voice](https://img.shields.io/badge/%40discordjs%2Fvoice-%5E0.11.0-red?style=flat-square)](https://npmjs.com/package/@discordjs/voice/v/0.11.0)
        -   [![discord.js](https://img.shields.io/badge/discord.js-%5E14.3.0-red?style=flat-square)](https://npmjs.com/package/discord.js/v/14.3.0)
	-	Data APIs
        -   [![google-it](https://img.shields.io/badge/google--it-%5E1.6.3-red?style=flat-square)](https://npmjs.com/package/google-it/v/1.6.3)
        -   [![spotify-web-api-node](https://img.shields.io/badge/spotify--web--api--node-%5E5.0.2-red?style=flat-square)](https://npmjs.com/package/spotify-web-api-node/v/5.0.2)
        -   [![ytdl-core](https://img.shields.io/badge/ytdl--core-%5E4.11.2-red?style=flat-square)](https://npmjs.com/package/ytdl-core/v/4.11.2)
        -   [![ytmusic-api](https://img.shields.io/badge/ytmusic--api-%5E3.1.1-red?style=flat-square)](https://npmjs.com/package/ytmusic-api/v/3.1.1)
        -   [![ytpl](https://img.shields.io/badge/ytpl-%5E2.3.0-red?style=flat-square)](https://npmjs.com/package/ytpl/v/2.3.0)
	-	Prisma
        -   [![@prisma/client](https://img.shields.io/badge/%40prisma%2Fclient-%5E4.3.1-red?style=flat-square)](https://npmjs.com/package/@prisma/client/v/4.3.1)
        -   [![prisma](https://img.shields.io/badge/prisma-%5E4.3.1-red?style=flat-square)](https://npmjs.com/package/prisma/v/4.3.1)
	-	Music Related
        -   [![ffmpeg-static](https://img.shields.io/badge/ffmpeg--static-%5E5.1.0-red?style=flat-square)](https://npmjs.com/package/ffmpeg-static/v/5.1.0)
        -   [![libsodium-wrappers](https://img.shields.io/badge/libsodium--wrappers-%5E0.7.10-red?style=flat-square)](https://npmjs.com/package/libsodium-wrappers/v/0.7.10)
        -   [![youtube-dl-exec](https://img.shields.io/badge/youtube--dl--exec-2.1.5-red?style=flat-square)](https://npmjs.com/package/youtube-dl-exec/v/2.1.5)
	-	Miscellaneous
        -   [![axios](https://img.shields.io/badge/axios-%5E0.27.2-red?style=flat-square)](https://npmjs.com/package/axios/v/0.27.2)
        -   [![colors](https://img.shields.io/badge/colors-%5E1.4.0-red?style=flat-square)](https://npmjs.com/package/colors/v/1.4.0)
        -   [![colorthief](https://img.shields.io/badge/colorthief-%5E2.3.2-red?style=flat-square)](https://npmjs.com/package/colorthief/v/2.3.2)
        -   [![dotenv](https://img.shields.io/badge/dotenv-%5E16.0.2-red?style=flat-square)](https://npmjs.com/package/dotenv/v/16.0.2)
        -   [![no-try](https://img.shields.io/badge/no--try-%5E3.1.0-red?style=flat-square)](https://npmjs.com/package/no-try/v/3.1.0)
        -   [![nova-bot](https://img.shields.io/badge/nova--bot-%5E3.0.0-red?style=flat-square)](https://npmjs.com/package/nova-bot/v/3.0.0)
        -   [![tracer](https://img.shields.io/badge/tracer-%5E1.1.6-red?style=flat-square)](https://npmjs.com/package/tracer/v/1.1.6)
