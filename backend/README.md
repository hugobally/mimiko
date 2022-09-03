-- Setup a dev server --

0. Tools needed : docker, go, prisma (npm install prisma --global)

1. Create config.yml in the backend folder with the following content

```
  env: DEV
  tls:
    cert: /path/to/cert.pem
    key: /path/to/private_key.pem
  server:
    host: localhost
    port: 8081
  spotify:
    client_id: [SPOTIFY_CLIENT_ID]
    client_secret: [SPOTIFY_CLIENT_SECRET]
    redirect_uri: https://localhost:8080/callback/spotify
  auth:
    jwt_key: bXlzZWNyZXRrZXkK
```

2. a) Create a spotify app to obtain API credentials (https://developer.spotify.com/dashboard/)
   b) Add https://localhost:8080/callback/spotify to the list of Redirect URIs in the app settings

3. Replace Client ID, Client Secret and Redirect URI in config.yml with the app values

4. Create a self-signed SSL certificate and set the correct paths to the cert (full chain) and private key in config.yml (tls/cert and tls/key respectively)

5. a) Launch the Prisma and Postgres containers as daemons with `docker compose up -d`
   b) Deploy the Prisma service with `prisma deploy` - Prisma should be running on port 4466 (admin console at `http://localhost:4466/_admin`)

6. Build the server with `go build` (or run directly with `go run main.go`)

-- How to re-generate Prisma and Gqlgen generated code --

1. Run `scripts/generate`
