FROM oven/bun:1.1.29

WORKDIR /app

COPY . .

RUN apt-get update
RUN apt-get install python3 -y
RUN apt-get clean

RUN echo "await fetch('https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp').then(r => r.arrayBuffer()).then(b => require('fs/promises').writeFile('/usr/local/bin/yt-dlp', Buffer.from(b)))" | bun run -
RUN chmod a+rx /usr/local/bin/yt-dlp

RUN bun i --ignore-scripts

EXPOSE 8080
CMD bun start