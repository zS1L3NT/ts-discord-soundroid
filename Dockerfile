FROM node:16

WORKDIR /home/ts-discord-soundroid

COPY . .

RUN npm i -g pnpm
RUN pnpm i --ignore-scripts
RUN pnpx prisma generate
RUN pnpm build

EXPOSE 8080
CMD ["pnpm", "start"]