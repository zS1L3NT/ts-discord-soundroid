# Instructions to compile SounDriod into a standalone executable

@vercel/ncc cannot read dynamic imports. We need to show @vercel/ncc what to import

## Install Dependencies

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

```bash
mkdir soundroid
```

This is where all the files needed to be compiled will be stored

## Import .env

```bash
copy .env soundroid
```

Make sure to add a link to `youtube-dl.exe`

```env
YOUTUBE_DL_DIR="."
YOUTUBE_DL_FILENAME="youtube-dl"
```

## Import youtube-dl.exe

Download the latest `youtube-dl.exe` executable from [here](https://github.com/ytdl-org/youtube-dl/releases/) and move it to `/soundroid`
The copy given in `youtube-dl-exec` doesn't work

## Import ffmpeg.exe

```bash
copy node_modules\ffmpeg-static\ffmpeg.exe soundroid
```

## Import node.exe

```bash
move "C:/Program Files/nodejs/node.exe" soundroid
```

We don't want to depend on a user having node installed to run the executable

## Make sure libsodium-wrappers is imported

In [this](./node_modules/@discordjs/voice/dist/index.js) file, go to the section with

```js
// src/util/Secretbox.ts
```

as a comment, and replace that section with this piece of code

```js
const libsodiumWrappers = require("libsodium-wrappers")
var fallbackError = /* @__PURE__ */ __name(() => {
	throw new Error(`Cannot play audio as no valid encryption package is installed.
- Install sodium, libsodium-wrappers, or tweetnacl.
- Use the generateDependencyReport() function for more information.
`)
}, "fallbackError")
var methods = {
	open: fallbackError,
	close: fallbackError,
	random: fallbackError
}
void (async () => {
	await libsodiumWrappers.ready
	Object.assign(methods, {
		open: libsodiumWrappers.crypto_secretbox_open_easy,
		close: libsodiumWrappers.crypto_secretbox_easy,
		random: libsodiumWrappers.randombytes_buf
	})
})()
```

this forces @vercel/ncc to use libsodium-wrappers

## Add rest of dependencies

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

Import [this](./soundroid.sed) to configure the installer