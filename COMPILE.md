# Instructions to compile SounDriod into a standalone executable

## Install Dependencies

Run

```bash
npm i
```

## Fix minify error

Search for

```ts
if (global.GENTLY) require = GENTLY.hijack(require)
```

in `node_modules` and remove all instances of it
This line of code breaks the minifying of the code

## Add all interactions manually

In [this](./node_modules/nova-bot/dist/utils/FilesSetupHelper.js) file, manually add all interactions to the bot
@vercel/ncc cannot detect dynamic imports, so we need to add all interactions manually

## Create our workspace

Run

```bash
mkdir soundroid
```

This is where all the files needed to be compiled will be stored

## Import .env

Run

```bash
copy .env soundroid
```

## Import youtube-dl.exe

Download the latest `youtube-dl.exe` executable from [here](https://github.com/ytdl-org/youtube-dl/releases/) and move it to `/soundroid`
The copy given in `youtube-dl-exec` doesn't work

## Import ffmpeg.exe

Run

```bash
copy node_modules\ffmpeg-static\ffmpeg.exe soundroid
```

## Import node.exe

Run

```bash
move "C:/Program Files/nodejs/node.exe" soundroid
```

We don't want to depend on a user having node installed to run the executable

## Make sure libsodium-wrappers is imported

Add

```ts
import "libsodium-wrappers"
```

to line 2 of `src/app.ts`
This is to garuntee that @vercel/ncc includes this in the single file build

## Add rest of dependencies

Run

```bash
tsc
ncc build dist/app -m -o ncc
move ncc\client\query_engine-windows.dll.node soundroid
move ncc\index.js soundroid\app.js
move ncc\schema.prisma soundroid
```

## Add run.bat

Copy this file to `soundroid/run.bat`

```bash
@echo off
mkdir ts-discord-soundroid
move app.js ts-discord-soundroid
move schema.prisma ts-discord-soundroid
cls
node ts-discord-soundroid/app
PAUSE
```

## Use iexpress

Run `iexpress` as an Administrator

### Install Program

```bash
cmd /c run.bat
```

### Options

-   Check both options
