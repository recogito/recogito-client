# Modified from https://docs.astro.build/en/recipes/docker/
FROM node:lts AS runtime
WORKDIR /app

COPY . .

RUN npm install
RUN npm run build-node

ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000
CMD node ./dist/server/entry.mjs