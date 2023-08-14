# Recogito Client

Work in progress.

- Run `npm install` to download dependencies
- Run `npm start` to run in development mode
- Default `astro.config.js` includes Netlify adapter
- Alternative `astro.config.node.mjs` uses the node adapter instead

Standard deployment via `npm run build` will build for Netlify.

To build and run as a standalone service, using Node:

- Run `npm install`
- Run `npm run build-node`
- Start the service using `node ./dist/server/entry.mjs`