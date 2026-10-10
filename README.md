# NTR AI Yatra — Phase 1 MERN web showcase

A responsive, animated React web app for demonstrating the NTR District trip-planning flow and iterating quickly in the browser. The project uses the MERN stack: **MongoDB, Express, React, and Node.js**. The provided logo is used in the app; a subtle decorative district-map watermark is derived from the supplied concept map and is not an authoritative boundary.

## Requirements

- Node.js 20.19+ (Node 22 LTS recommended).
- npm.
- MongoDB is optional for the local showcase. Without `MONGODB_URI`, the API explicitly uses the bundled demo catalogue.

## Run locally

```powershell
npm install
npm run dev
```

Open:

- Web app: `http://localhost:5173`
- API health: `http://localhost:5000/api/health`
- Demo places: `http://localhost:5000/api/places`

For MongoDB-backed development, copy `.env.example` to `.env`, set `MONGODB_URI`, start MongoDB, then run:

```powershell
npm run seed
npm run dev
```

The seed records remain marked unverified. A successful database connection does not make their content publication-ready.

## Build and host

```powershell
npm run build
npm start
```

The production Express server serves the built React client and `/api` routes from one Node service, which is straightforward to host as a single web deployment. Set `NODE_ENV=production`, `PORT`, and `MONGODB_URI` in the hosting environment. Never commit `.env` or place provider secrets in React/Vite environment variables.

## Phase 1 features

- Discover, search, and filter a curated demo place catalogue.
- Show real destination and Andhra cuisine photos from Wikimedia Commons, with creator/source links on each photo; retain the illustrated artwork where a verified place-specific photo is not available.
- Create and edit half-day or one-day itineraries, then save them in browser storage.
- Read grounded sample guide responses and use browser text-to-speech.
- Preview an image locally and create a story for a selected supported place; images are not uploaded or analyzed.
- Open directions through an external map handoff.
- View the safety screen; contact details remain explicitly unconfigured until verified. Location sharing happens only after the visitor chooses it.
- Cache the app shell for offline return visits after an initial successful load.

## Current boundaries

The catalogue and guide copy are concept-stage demo content, not verified tourism information. No live LLM, image recognition, maps routing, emergency contacts, user accounts, analytics, or bookings are configured. MongoDB storage is optional in the showcase; the Express API uses the shared demo catalogue when MongoDB is not configured or has no place records. Do not publish the current seed as approved visitor guidance.

## Architecture and future APKs

- `client/`: React + Vite web app, including responsive interface and PWA shell.
- `server/`: Node.js + Express REST API and Mongoose models.
- `shared/`: place catalogue data shared by the browser fallback and API seed.
- MongoDB is the canonical persistence target once configured and seeded.

In Phase 2, an Expo/React Native Android client can consume the same Express REST API, with reusable TypeScript domain/API modules moved to `shared/` as needed. Build APK/AAB files through EAS Build or Android tooling; the React web build itself is not an APK. Phase 3 keeps the Node/Express/MongoDB backend and expands the React clients, integrations, and operations.

## Iteration

- Edit shared demo place records in `shared/places.js`; database seeding is explicit via `npm run seed`.
- Build React screens and interactions in `client/src/App.jsx`.
- Tune visual style, logo treatment, and motion in `client/src/styles.css`.
- Change API routes and MongoDB connection behavior in `server/index.js`; schema is in `server/models/Place.js`.
- Bump `CACHE_NAME` in `client/public/service-worker.js` when changing offline-cached production assets.
- Keep release scope aligned in `PHASES.md` and architecture decisions in `PROJECT_PLAN.md`.
