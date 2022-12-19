FROM node:16

WORKDIR /home/ts-discord-soundroid

COPY . .

RUN curl -L https://yt-dl.org/downloads/latest/youtube-dl -o /usr/local/bin/youtube-dl
RUN chmod a+rx /usr/local/bin/youtube-dl
RUN npm i -g pnpm
RUN pnpm i --ignore-scripts
RUN pnpx prisma generate
RUN pnpm build

ENV YOUTUBE_DL_DIR=/usr/local/bin/
ENV YOUTUBE_DL_FILENAME=youtube-dl

EXPOSE 8080
CMD pnpm start