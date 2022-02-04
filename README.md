# SounDroid

![License](https://img.shields.io/github/license/zS1L3NT/.github?style=for-the-badge) ![Languages](https://img.shields.io/github/languages/count/zS1L3NT/ts-discord-soundroid?style=for-the-badge) ![Top Language](https://img.shields.io/github/languages/top/zS1L3NT/ts-discord-soundroid?style=for-the-badge) ![Commit Activity](https://img.shields.io/github/commit-activity/y/zS1L3NT/ts-discord-soundroid?style=for-the-badge) ![Last commit](https://img.shields.io/github/last-commit/zS1L3NT/ts-discord-soundroid?style=for-the-badge)

SounDroid (Discord) is a Discord Music bot that plays music from Spotify or YouTube. SounDroid (Discord) is part of a bigger project consisting of a [Mobile Application](https://github.com/zS1L3NT/android-soundroid-v2), [Discord Bot](https://github.com/zS1L3NT/ts-discord-soundroid) and Web Application (coming in the far future). You can add it to your server by clicking [this](https://soundroid-bot.zectan.com) link and selecting your server. Do make sure to give SounDroid admin permissions.

## Features

-   Discord Commands (Interactions)
    -   Song playing
        -   `/play` - Add song to queue. Songs can come from either
            -   A YouTube Video Link
            -   A YouTube Playlist Link
            -   A Spotify Song Link
            -   A Spotify Playlist Link
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

## Usage

Copy the `config.example.json` file to `config.json` then fill in the json file with the correct project credentials.

With `yarn`

```
$ yarn
$ npm run dev
```

With `npm`

```
$ npm i
$ npm run dev
```

## Built with

-   TypeScript
    -   [![ts-node](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/ts-node?style=flat-square)](https://npmjs.com/package/ts-node)
    -   [![typescript](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/typescript?style=flat-square)](https://npmjs.com/package/typescript)
    -   [![@types/node](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/dev/@types/node?style=flat-square)](https://npmjs.com/package/@types/node)
    -   [![@types/open](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/dev/@types/open?style=flat-square)](https://npmjs.com/package/@types/open)
    -   [![@types/spotify-web-api-node](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/dev/@types/spotify-web-api-node?style=flat-square)](https://npmjs.com/package/@types/spotify-web-api-node)
-   DiscordJS
    -   [![@discordjs/opus](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/@discordjs/opus?style=flat-square)](https://npmjs.com/package/@discordjs/opus)
    -   [![@discordjs/voice](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/@discordjs/voice?style=flat-square)](https://npmjs.com/package/@discordjs/voice)
    -   [![discord.js](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/discord.js?style=flat-square)](https://npmjs.com/package/discord.js)
-   Data APIs
    -   [![node-genius-api](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/node-genius-api?style=flat-square)](https://npmjs.com/package/node-genius-api)
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
    -   [![express](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/express?style=flat-square)](https://npmjs.com/package/express)
    -   [![no-try](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/no-try?style=flat-square)](https://npmjs.com/package/no-try)
    -   [![nova-bot](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/nova-bot?style=flat-square)](https://npmjs.com/package/nova-bot)
    -   [![tracer](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-discord-soundroid/tracer?style=flat-square)](https://npmjs.com/package/tracer)
