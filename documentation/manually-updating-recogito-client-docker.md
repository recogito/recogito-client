## Manually updating the Recogito client - Docker

When self-hosting the Recigito platform client, use the folling steps.

1. Pull the latest version of this repository.

2. Ensure that you have the appropriate ENV set. Use the ~.env.example~ file as a template.

3. Be sure you have your custom version of `/src/config.json` updated and in the `/src` directory.

4. Build the docker image:

```
docker build -t <your tag> .
```

5. Deploy your docker image to the appropriate location for your hosting setup.

The Recogito client should now be updated.
