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

## Trigger.dev

Trigger.dev is used as an externally hosted task queue.

### Import/export

In order to use the import/export feature, a Trigger.dev project must be configured.

In `.env`, set:
- `TRIGGER_PROJECT_ID` from your trigger project's `Project settings` tab
- `TRIGGER_SECRET_KEY` from your trigger project's `API keys` tab
- and optionally `TRIGGER_SERVER_URL` if using self-hosted Trigger.

Note that the following environment variables are also required for the Trigger tasks to work (can be added manually to the trigger project after deploy):
```
PUBLIC_SUPABASE or SUPABASE_SERVERCLIENT_URL
PUBLIC_SUPABASE_API_KEY
SUPABASE_SERVICE_KEY
IIIF_KEY
IIIF_URL
IIIF_PROJECT_ID
```

You can then deploy import/export tasks to the Trigger.dev server by executing the following command at the root of this project repo:

~~~
npx trigger.dev@latest deploy -c ./trigger.config.ts
~~~

### NER plugin

Usage of the NER plugin requires a second Trigger.dev project. For more information on setting it up, see the [README for the plugin](https://github.com/recogito/plugin-ner).

Once complete and deployed, you must set the NER Trigger project's secret key as the `TRIGGER_NER_SECRET_KEY` environment variable. This will be used by injected plugin routes.
