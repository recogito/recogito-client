# Modified from https://docs.astro.build/en/recipes/docker/
FROM node:22 AS runtime
WORKDIR /app

COPY . .

RUN npm install

# install any plugins in INSTALLED_PLUGINS env var via npm
RUN if [ -f .env ]; then set -a && . ./.env && set +a; fi; \
    if [ -n "$INSTALLED_PLUGINS" ]; then \
      npm install $(echo "$INSTALLED_PLUGINS" | tr ',' ' '); \
    fi

RUN npm run build-node

ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000
CMD node ./dist/server/entry.mjs