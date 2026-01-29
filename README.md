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


#### Self-hosted or single instance

For a self-hosted instance, or a single instance without multiple tenants, the following environment variables are also required for the Trigger tasks to work (can be added manually to the trigger project after deploy):
```
SUPABASE_SERVICE_KEY
IIIF_KEY
```

You can then deploy import/export tasks to the Trigger.dev server by executing the following command at the root of this project repo:

~~~
npx trigger.dev@latest deploy -c ./trigger.config.ts
~~~

#### Multi-tenant

For a multi-tenant setup, the Trigger project only needs to be deployed once and it will be reused for all tenants; and instead of sending the above .env vars to Trigger, you set the following:

```
MULTI_TENANT=true
OP_SERVICE_ACCOUNT_TOKEN=<1password-service-account-token>
```

(Currently, only [1Password Service Accounts](https://developer.1password.com/docs/service-accounts/) are supported for managing multi-tenant secrets.)

Then run:

~~~
npx trigger.dev@latest deploy -c ./trigger.config.ts
~~~

On each individual tenant, ensure the following environment variables are defined (in recogito-client):
```
OP_VAULT_NAME
OP_ITEM_NAME
```

And ensure `SUPABASE_SERVICE_KEY` and `IIIF_KEY` are both available in that 1password vault/item.

### NER plugin

Usage of the NER plugin requires a second Trigger.dev project. For more information on setting it up, see the [README for the plugin](https://github.com/recogito/plugin-ner).

Once complete and deployed, you must set the NER Trigger project's secret key as the `TRIGGER_NER_SECRET_KEY` environment variable. This will be used by injected plugin routes.
