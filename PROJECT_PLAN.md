# NTR AI Yatra — Product Plan and Architecture

## 1. Product concept

**NTR AI Yatra** is a local-first tourist companion for Vijayawada and NTR District. It helps visitors decide what to see, plan a practical day, and understand the places they visit through concise, source-grounded stories.

The product takes inspiration from TripWiz's **AI Tourist Guide and AI Photo Storyteller** concept. The differentiator is a curated, trustworthy guide to local heritage, nature, food, crafts, and river experiences—not a general-purpose chatbot.

**Product promise:** Tell us what you enjoy and how much time you have; get a useful local itinerary and stories that make each stop meaningful.

## 2. Audience and initial scope

- Visitors with a few hours or a day in Vijayawada and nearby NTR District.
- Families, solo travelers, and visitors interested in heritage, nature, local food, or culture.
- Local tourism partners and content editors who need accurate, maintainable place information.

Start with a small, verified catalogue around Vijayawada and nearby highlights. Expand district coverage when place data, routes, and visitor feedback are reliable. English and Telugu are good candidate launch languages; confirm translations and audio quality with local reviewers before release.

### Candidate launch places

Kanaka Durga Temple; Kondapalli Fort and Hills; Prakasam Barrage; Bhavani Island; Mogalrajapuram Caves; Akkanna Madanna Caves; Vedadri; Bapu Museum; and Victoria Jubilee Museum.

The images are concept references, not authoritative sources for place details, routes, operating hours, prices, or emergency contacts. Verify those facts independently before publishing them.

## 3. MVP user journey

1. **Discover:** Choose an interest or browse verified places by category.
2. **Personalize:** Select available time, interests, travel pace, and optional budget. Location permission is optional.
3. **Plan:** Receive a proposed itinerary with ordered stops, estimated travel time, visit duration, and a brief reason for each recommendation.
4. **Adjust:** Swap, remove, or reorder stops; see the plan update without losing the original preferences.
5. **Explore:** Read or listen to a short guide for a place, with practical visitor information and references where available.
6. **Tell the photo story:** Select or take a photo of a supported landmark, craft, or attraction. The app identifies only supported content and generates a short, shareable story grounded in reviewed material.
7. **Navigate and stay safe:** Open directions in a map provider. A persistent safety entry presents verified contact options and offers location sharing only after an explicit user action.

### MVP features

- Curated place catalogue with search, categories, detail pages, and saved places.
- Preference-based, editable half-day and one-day itineraries.
- Grounded AI guide/story generation with a clear fallback when a place cannot be identified.
- Photo Storyteller for a limited set of reviewed locations and objects.
- Directions handoff to a map application; cache saved itinerary and essential place information for poor connectivity.
- A safety screen with verified local contacts, call actions, and user-confirmed location sharing.
- English-first interface, with a reviewed Telugu experience where content is ready.

### Defer until validated

- AR overlays and full AR tours.
- Reservations, payments, or a broad local marketplace.
- Live crowd, traffic, or availability predictions.
- Unverified “hidden gem” rankings and open-ended factual chatbot answers.
- Claims that the app dispatches emergency services or guarantees rescue.

## 4. Product and safety principles

- **Local truth over fluent guesses:** AI responses use approved place content and show uncertainty rather than inventing facts.
- **Human-reviewed source material:** Important historical, cultural, practical, and safety information has an owner, source, language, and review date.
- **Traveler control:** AI plans are suggestions; users can edit them. Location and photo access are opt-in.
- **Privacy by default:** Do not retain precise location or uploaded photos unless a feature needs it and the user has clearly agreed.
- **Clear safety boundary:** The safety screen helps users contact verified services. It is not an emergency-dispatch system.
- **Accessible and resilient:** Provide readable text, audio where available, clear offline states, and essential saved information that works with weak connectivity.

## 5. MERN architecture

Phase 1 is a web-first **MERN** application so it is easy to showcase and adjust while establishing the same Node/Express/MongoDB API for later Android clients. React is the Phase 1 client; Phase 2 can add an Expo/React Native client that consumes the same REST API. Building the React web UI alone does not produce an APK.

```text
┌─────────────────────────────────────────────┐
│ React + Vite web client                       │
│ Later: Expo / React Native Android client      │
│ Browser storage · App-shell offline cache     │
└──────────────────────┬──────────────────────┘
                       │ HTTPS, authenticated where needed
┌──────────────────────▼──────────────────────┐
│ Node.js + Express REST API                    │
│ Places · Itinerary · Storyteller · Safety      │
│ Validation · rate limits · AI/provider access │
└──────────┬───────────────────┬──────────────┘
           │                   │
┌──────────▼─────────┐  ┌──────▼────────────────┐
│ MongoDB + Mongoose  │  │ External providers    │
│ Places · content    │  │ LLM / vision model    │
│ users · itineraries │  │ Maps / directions     │
└─────────────────────┘  └───────────────────────┘
```

### Client

- **Phase 1 web:** React + Vite with JavaScript modules. A production typed migration can use TypeScript without changing the backend contract.
- **Later Android APK/AAB:** Expo / React Native client consuming the same versioned Express REST API. Share validation, API types, and domain utilities where appropriate; keep web and native UI components platform-specific.
- Feature areas: preferences, discover, place detail, itinerary, guide/storyteller, saved items, and safety.
- Keep browsing and planning usable without login; add accounts only for cross-device persistence.
- Store user-selected saved places/preferences/itineraries locally for offline access. Show when cached information may be stale.
- Express serves the built web client in production, allowing one Node service to host the web frontend and `/api` routes. Mobile builds are distributed separately as APK/AAB packages.

### Backend and persistence

- **Node.js + Express** provides the trusted API boundary for place catalogue, itineraries, AI/photo calls, and verified safety contacts.
- **MongoDB + Mongoose** stores places, localized content, provenance/review state, safety contacts, user preferences, and (when accounts exist) saved itineraries.
- Validate request bodies and AI results at the API boundary; rate-limit public AI/photo endpoints.
- Keep provider credentials in the Node hosting environment. Never bundle them into Vite or React Native clients.
- Current API intentionally falls back to the shared demo catalogue when MongoDB is not configured; configure and seed MongoDB for persistent records.
- Build a restricted editorial workflow with draft, review, publish, correction, and expiry states before publication.

### AI and integrations

- Web and mobile clients call Express; Express calls external providers. Never expose model or map API keys in either client.
- Ground guide and storyteller prompts in reviewed place records and approved source excerpts. Return structured outputs (for example: title, short story, source references, confidence/fallback status).
- For photo recognition, limit matching to the supported catalogue. If confidence is low or the image is unsupported, ask the traveler to choose a place or show a clearly labeled generic response—do not assert an identification.
- Generate itineraries from constraints and curated place data. Validate the returned stop IDs, opening-hour constraints when verified, travel-time estimates, and total available time before showing the plan.
- Keep map routing behind a provider adapter so the app can change providers. Always identify estimates as estimates and allow the traveler to open directions externally.
- Record provider, model/version, prompt version, latency, and error category without logging raw photos, precise location, or unnecessary personal data.

## 6. Core data model

| Entity | Purpose | Important fields |
|---|---|---|
| `Place` | Curated attraction, food, craft, or experience | ID, name, category, coordinates, description, visit duration, accessibility/practical details, publication status |
| `PlaceContent` | Localized guide and storyteller source material | Place ID, locale, summary, story, audio reference, citations, reviewer, reviewed-at |
| `Media` | Approved image/audio for a place | Place ID, storage key, alt text, rights/credit, locale |
| `PlaceHours` | Verified opening or seasonal information | Place ID, schedule, validity dates, source, last-checked-at |
| `SafetyContact` | Verified emergency/help contact | Service, locale, number, jurisdiction, source, verified-at, active status |
| `UserPreference` | Optional planning choices | User ID, interests, locale, pace, budget range |
| `Itinerary` / `ItineraryStop` | Editable plan and ordered visits | Owner/anonymous device key, date, duration, stop order, estimates, generated-at |
| `SavedPlace` | User's saved places | User ID or local key, place ID, saved-at |
| `ContentSource` | Provenance and review history | Source URL/document, owner, factual scope, review status/date |

Use stable place IDs in generated itineraries and keep source provenance separate from generated prose. Do not store photo binaries or precise location histories as ordinary user data.

## 7. API shape (initial proposal)

- `GET /places?category=&near=&locale=` — published place catalogue.
- `GET /places/{placeId}?locale=` — place details and reviewed content.
- `POST /itineraries/generate` — preferences, duration, and optional starting area; returns ordered stops and estimates.
- `PATCH /itineraries/{id}` — save traveler edits where persistence is enabled.
- `POST /stories/photo` — temporary photo upload/reference plus optional selected place; returns a supported match or explicit no-match and grounded story.
- `GET /safety-contacts?locale=&area=` — active, verified help options.

These are logical endpoints; implement them as Edge Functions initially. Validate input, enforce payload limits and rate limits, and return explicit error states rather than plausible-looking empty success responses.

## 8. Quality, privacy, and operational requirements

- Review factual content and safety contacts before publication; show last-verified dates where useful.
- Require explicit consent before requesting camera, photo-library, or location permissions.
- Ask for location only at the point it is useful. For emergency sharing, preview the recipient/action and location before the user confirms.
- Use TLS, least-privilege database policies, server-side secrets, and bounded photo uploads with short retention.
- Add AI output checks for unsupported claims, invalid place IDs, unsafe advice, and malformed structured responses.
- Measure itinerary completion, stop edits, story usefulness, unsupported-photo rate, and correction reports. Avoid collecting more personal data than those measures require.
- Monitor API errors, AI latency/cost, and contact-data verification dates; provide a manual fallback when AI services are unavailable.

## 9. Delivery plan and acceptance checks

### Phase 0 — Validate content and decisions

- Confirm initial geographic boundary, supported languages, map provider, and contact-data owner.
- Create a reviewed seed catalogue and collect authoritative sources for each place.
- Define photo permissions/retention, AI provider constraints, and safety disclaimer.

**Exit:** Every launch place has an owner, source, coordinates, and reviewed visitor content; emergency contacts have a verification owner and date.

### Phase 1 — MERN web showcase and validate

- Build a responsive browser experience for the place catalogue, preferences, itinerary generation/editing, guide/storyteller, safety, and saved content.
- Build the React client, Express API, Mongoose place schema, shared seed catalogue, and optional MongoDB connection.
- Add external map handoff and cache the web app shell plus saved essentials for return visits.
- Keep seed content and demo integrations clearly labelled; create an owner/source review process before representing place data as verified.

**Exit:** A traveler can create a plan for a supported duration, understand why stops were selected, edit it, open map directions, and reopen saved essentials offline. The web client calls the Express API and works against MongoDB when configured, with an explicitly labelled demo-catalogue fallback for local showcase development. Production publication additionally requires verified place/safety data and server-side integrations for live AI features.

### Phase 2 — Guide and Photo Storyteller

- Add grounded text/audio guide and supported-photo recognition/story creation.
- Add unsupported-image and provider-unavailable states; complete language and content review.
- Add an Expo/React Native Android client using the Phase 1 Express/MongoDB API; establish EAS/Android build configuration and produce a signed APK/AAB for testing/distribution.

**Exit:** Stories refer only to supported, source-backed content; uncertain images produce an explicit no-match or selection prompt.

### Phase 3 — Safety, pilot, and improve

- Add verified safety contacts, call actions, and explicit location-sharing flow.
- Pilot with local visitors and tourism/content reviewers; fix usability, factual, accessibility, and reliability issues before expansion.

**Exit:** Safety details have documented ownership and freshness checks; pilot feedback supports the next geography/features.

## 10. Decisions to confirm

1. Should the pilot cover Vijayawada and nearby highlights, or the full NTR District?
2. Which Android signing, EAS/CI, hosting, and MongoDB deployment accounts will the project team own?
3. Which languages are launch-critical (English, Telugu, or both)?
4. Who will verify and maintain attraction details, opening hours, and official help contacts?
5. Which map, AI, hosting, and photo-retention providers meet budget and privacy requirements?

## 11. Reference images

The original concept images are stored in [`reference/`](./reference/). They include the brand direction, AI Tourist Guide screens, district map, tourism categories, World Tourism Day poster, and the safety-button notes. Use them as product/design references, not as verified factual data.
