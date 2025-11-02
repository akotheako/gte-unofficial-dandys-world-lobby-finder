# Get To Ele — SvelteKit
## Requirements
- Node 18+  
- Firebase CLI (for emulators and deploy): `npm i -g firebase-tools`
## Install
npm install
## Scripts
* `dev` — Vite dev server with HMR
* `build` — SvelteKit build to `./build`
* `preview` — Vite preview
* `api` — start API server (`server.mjs`) on :3000
* `api:watch` — API with autoreload (nodemon)
* `build:watch` — rebuild on change
* `dev:all` — run API (watch) + frontend HMR
* `serve:watch` — watch build + serve API
* `emu` — Firebase emulators (functions, firestore)
## Development
### Frontend and API in two terminals
Terminal A:
npm run api
Terminal B:
npm run dev
### Single combined command (uses `concurrently`)
npm run dev:all
### With Firebase emulators
npm run emu
Vite runs on :5173. API runs on :3000. `/api` is proxied to :3000 in dev.
## Production
### Build
npm run build
### Serve built files
### Serve and rebuild on change
npm run serve:watch
## Deploy (Firebase Hosting + Functions)
Build, then deploy hosting:
firebase deploy --only hosting:gte
Deploy functions:
firebase deploy --only functions
## Notes
* Static assets live in `static/` and are served at the site root.
* `server.mjs` serves `/api` and static files from `./build`.

------------------------

Minimal sequence to test everything locally:

1. Install deps once:

npm install

2. Start Firebase emulators (functions + firestore):

npm run emu

3. In another terminal, run frontend + API together:

npm run dev:all

That gives:

* Frontend at [http://localhost:5173](http://localhost:5173) (with HMR).
* API at [http://localhost:3000/api/...](http://localhost:3000/api/...) (proxied through Vite).

That’s enough to test the app end-to-end locally.
