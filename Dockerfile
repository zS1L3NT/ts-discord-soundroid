FROM node:16

WORKDIR /home/ts-discord-soundroid

COPY . .

RUN curl -L https://github.com/ytdl-org/ytdl-nightly/releases/download/2023.08.07/youtube-dl -o /usr/local/bin/youtube-dl
RUN chmod a+rx /usr/local/bin/youtube-dl
RUN npm i -g pnpm
RUN pnpm i --ignore-scripts
RUN pnpx prisma generate

ENV YOUTUBE_DL_DIR=/usr/local/bin/
ENV YOUTUBE_DL_FILENAME=youtube-dl

EXPOSE 8080
CMD pnpm start