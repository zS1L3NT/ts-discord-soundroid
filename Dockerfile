FROM oven/bun:1.1.29

WORKDIR /app

COPY . .

RUN apt-get update
RUN apt-get install ffmpeg -y
RUN apt-get clean

RUN echo "await fetch('https://github.com/ytdl-org/ytdl-nightly/releases/download/2023.08.07/youtube-dl').then(r => r.arrayBuffer()).then(b => require('fs/promises').writeFile('/usr/local/bin/youtube-dl', Buffer.from(b)))" | bun run -
RUN chmod a+rx /usr/local/bin/youtube-dl
RUN bun i --ignore-scripts

ENV YOUTUBE_DL_DIR=/usr/local/bin/
ENV YOUTUBE_DL_FILENAME=youtube-dl

EXPOSE 8080
CMD bun start