# SounDroid

![License](https://img.shields.io/github/license/zS1L3NT/ts-discord-soundroid?style=for-the-badge) ![Languages](https://img.shields.io/github/languages/count/zS1L3NT/ts-discord-soundroid?style=for-the-badge) ![Top Language](https://img.shields.io/github/languages/top/zS1L3NT/ts-discord-soundroid?style=for-the-badge) ![Commit Activity](https://img.shields.io/github/commit-activity/y/zS1L3NT/ts-discord-soundroid?style=for-the-badge) ![Last commit](https://img.shields.io/github/last-commit/zS1L3NT/ts-discord-soundroid?style=for-the-badge)

SounDroid (Discord) is a Discord Music bot that plays music from Spotify or YouTube. SounDroid (Discord) is part of a bigger project consisting of a [Mobile Application](https://github.com/zS1L3NT/android-soundroid-v2), [Discord Bot](https://github.com/zS1L3NT/ts-discord-soundroid) and Web Application (coming in the far future). You can add it to your server by clicking [this](https://soundroid-bot.zectan.com) link and selecting your server. Do make sure to give SounDroid admin permissions.

## Motivation

I always liked [Rythm Bot](https://rythm.fm/)(Discord's most popular music bot) and its capibilities of playing music in a voice channel based on what song was requested, be it Spotify or YouTube. I also used to have a music bot (IUFanBot) that works like Rythm.
However, many events happened which lead to the creation of SounDroid bot

1.  I lost the source code to IUFanBot because I built it long before I started using Git
2.  On 6 August 2021, [discord.js v13](https://github.com/discordjs/discord.js/releases/tag/13.0.0) was released where they changed a lot of things relating to how music bots should be built
3.  On 15 September 2021, Rythm Bot was forced to shut down, leading to a need for an alternative

Because I just finished building [SounDroid Android](https://github.com/zS1L3NT/android-soundroid-v1) for a school project, I decided to name this new Discord bot after the app.

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

Copy the `.env.example` file to `.env` then fill in the json file with the correct project credentials.

```
$ npm i
$ npm run dev
```

## Credits

DiscordJS provided a template for a music playing bot [here](https://github.com/discordjs/voice/tree/3dabc30fca79212809d1191e0c2f2b54c3f8cdc7/examples/music-bot). My music player was built on top of this example bot.

## Built with

-   TypeScript
    -   [![@types/node](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/dev/@types/node?style=flat-square)](https://npmjs.com/package/@types/node)
    -   [![@types/spotify-web-api-node](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/dev/@types/spotify-web-api-node?style=flat-square)](https://npmjs.com/package/@types/spotify-web-api-node)
    -   [![typescript](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/dev/typescript?style=flat-square)](https://npmjs.com/package/typescript)
-   DiscordJS
    -   [![@discordjs/opus](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/@discordjs/opus?style=flat-square)](https://npmjs.com/package/@discordjs/opus)
    -   [![@discordjs/voice](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/@discordjs/voice?style=flat-square)](https://npmjs.com/package/@discordjs/voice)
    -   [![discord.js](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/discord.js?style=flat-square)](https://npmjs.com/package/discord.js)
-   Data APIs
    -   [![google-it](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/google-it?style=flat-square)](https://npmjs.com/package/google-it)
    -   [![spotify-web-api-node](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/spotify-web-api-node?style=flat-square)](https://npmjs.com/package/spotify-web-api-node)
    -   [![youtube-dl-exec](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/youtube-dl-exec?style=flat-square)](https://npmjs.com/package/youtube-dl-exec)
    -   [![ytdl-core](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/ytdl-core?style=flat-square)](https://npmjs.com/package/ytdl-core)
    -   [![ytmusic-api](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/ytmusic-api?style=flat-square)](https://npmjs.com/package/ytmusic-api)
    -   [![ytpl](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/ytpl?style=flat-square)](https://npmjs.com/package/ytpl)
-   Music Related
    -   [![ffmpeg-static](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/ffmpeg-static?style=flat-square)](https://npmjs.com/package/ffmpeg-static)
    -   [![libsodium-wrappers](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/libsodium-wrappers?style=flat-square)](https://npmjs.com/package/libsodium-wrappers)
-   Miscellaneous
    -   [![axios](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/axios?style=flat-square)](https://npmjs.com/package/axios)
    -   [![colors](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/colors?style=flat-square)](https://npmjs.com/package/colors)
    -   [![colorthief](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/colorthief?style=flat-square)](https://npmjs.com/package/colorthief)
    -   [![dotenv](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/dotenv?style=flat-square)](https://npmjs.com/package/dotenv)
    -   [![no-try](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/no-try?style=flat-square)](https://npmjs.com/package/no-try)
    -   [![nova-bot](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/nova-bot?style=flat-square)](https://npmjs.com/package/nova-bot)
    -   [![tracer](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/tracer?style=flat-square)](https://npmjs.com/package/tracer)
