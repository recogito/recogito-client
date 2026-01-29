import { defineConfig } from '@trigger.dev/sdk/v3';
import { syncEnvVars } from '@trigger.dev/build/extensions/core';
import 'dotenv/config';

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_ID || '',
  runtime: 'node',
  logLevel: 'log',
  // The max compute seconds a task is allowed to run. If the task run exceeds this duration, it will be stopped.
  // You can override this on an individual task.
  // See https://trigger.dev/docs/runs/max-duration
  maxDuration: 3600,
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 1,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ['./src/trigger'],
  build: {
    extensions: [
      syncEnvVars(async (_) => {
        return process.env.MULTI_TENANT && process.env.OP_SERVICE_ACCOUNT_TOKEN
          ? [
              { name: 'MULTI_TENANT', value: 'true' },
              {
                name: 'OP_SERVICE_ACCOUNT_TOKEN',
                value: process.env.OP_SERVICE_ACCOUNT_TOKEN,
              },
            ]
          : [
              { name: 'IIIF_KEY', value: process.env.IIIF_KEY || '' },
              {
                name: 'SUPABASE_SERVICE_KEY',
                value: process.env.SUPABASE_SERVICE_KEY || '',
              },
            ];
      }),
    ],
  },
});
