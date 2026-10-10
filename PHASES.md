# NTR AI Yatra — Versioned Project Phases

This roadmap divides the product into three releasable versions. Version 1 is a responsive web app first so it can be shown, tested, and adjusted quickly in a browser. Later versions build on that experience: expand its coverage and personalization, then deliver the full connected tourism platform.

The phases are outcome-based rather than date-based. Do not advance solely because a feature is built; meet the phase exit criteria and validate the experience with travelers and local content reviewers.

## Version 1 — MVP: Plan and explore

**Goal:** Deliver a shareable, responsive web experience that helps a visitor discover a small set of locally reviewable places, build a useful day plan, and explore them with source-grounded guide and photo-story experiences. Version 1 can be iterated on the spot without a mobile build or account.

### Traveler features

- Lightweight web preferences for interests, trip duration, and travel pace; starting area is optional and precise location is not collected for planning.
- Browse and search a curated launch catalogue around Vijayawada and nearby highlights.
- Place detail pages with reviewed descriptions, categories, practical visitor information, media, and source/review metadata before public launch; prototype cards are explicitly demo notes.
- Generate editable half-day and one-day itineraries with ordered stops, visit-duration and travel-time estimates, and short explanations for recommendations.
- Add, remove, swap, and reorder itinerary stops.
- Source-grounded local guide that answers only from approved place information and clearly identifies uncertainty.
- Photo Storyteller for a limited, reviewed set of supported landmarks and crafts; unsupported or uncertain images produce a clear no-match state. The current web demo lets the traveler select a supported place and does not claim image recognition.
- Save places and itineraries in browser storage; cache the app shell and essential selected content for weak connectivity.
- Open directions in an external map application.
- Read guide responses aloud using browser text-to-speech where available.
- Accessible safety screen with verified contact options, call actions, and user-confirmed location sharing. The app does not claim to dispatch emergency services.
- English web interface, with reviewed Telugu content only where launch-ready.

### Platform and operations

- MERN stack: React + Vite web client, Node.js + Express REST API, and MongoDB + Mongoose persistence.
- A shared place catalogue powers browser fallback and API seed. MongoDB is optional for local showcase development; configure it to persist reviewed records.
- Responsive, offline-capable web client; production Express can serve the built React app and API together.
- Demo interactions remain local where appropriate. No live AI, photo recognition, routing feed, analytics, accounts, or emergency-service integration is implied by the showcase.
- External AI/maps calls, when added, go through Express; never expose provider credentials in web or mobile clients.
- Production content needs a restricted editorial workflow with source provenance, reviewer, and review date before it is described as verified.
- Provide a clear correction/report channel and operational ownership before public launch.

### Version 1 exit criteria

- A first-time traveler can browse without an account, create and edit a plan, open external map directions, and revisit saved essentials.
- Before public launch, every published place has a content owner, verified source, and review date; prototype seed notes are explicitly labelled unverified until then.
- Live AI/photo integrations, if enabled, have explicit unsupported, low-confidence, and provider-unavailable states. The current showcase must distinguish deterministic demo responses from live AI.
- Before public launch, emergency contacts are verified, clearly scoped, and have a named freshness owner. The current showcase labels contacts unconfigured and does not claim to dispatch help.
- Browser storage, location permission, photo preview, and any share action remain user-controlled; photo files and precise location are not uploaded or retained by the prototype.
- A small traveler pilot confirms that the itinerary and web experience are understandable and practically usable.

### Current web showcase status

The repository contains a React web client, Express API, Mongoose place schema, shared demo catalogue, and MongoDB-optional local fallback. The showcase provides discovery/search/filtering, browser-local saved places and itineraries, editable half-day/day planning, external map handoff, bundled-note guide responses, local-only photo preview and story generation, a safety screen with no unverified numbers, explicit user-invoked location sharing, and an offline-cached app shell. Demo text and estimates are not verified tourism data. Content verification, real AI/photo recognition, editorial operations, and official contact configuration remain release work—not silently simulated as production services.

## Version 2 — Expanded guide: Personalize and return

**Goal:** Improve trip quality and repeat usefulness by expanding verified coverage, localization, storytelling, and account-backed continuity.

### Traveler features

- Expand place and experience coverage across more of NTR District, including food, crafts, nature, events, and community experiences where verified.
- Improve itinerary personalization with multi-day trips, start-area preferences, accessibility needs, family-friendly filters, and better constraint handling.
- Add itinerary collaboration or sharing so travelers can review a plan together.
- Add optional accounts and secure cross-device synchronization for preferences, saved places, and itineraries.
- Broaden Photo Storyteller to more reviewed landmarks, objects, and crafts; improve matching confidence and let travelers correct a match.
- Offer reviewed Telugu and additional language support as content is translated and checked.
- Add curated audio guides and downloadable/offline packs for selected routes and places.
- Add local recommendations and responsible-tourism guidance, including clear ways to support local businesses.
- Improve map/departure-time handoff and routing estimates through a replaceable maps-provider integration.
- Collect feedback on place accuracy, recommendation relevance, and story quality.

### Platform and operations

- Add an Expo/React Native Android app that consumes the same Express API; build and sign APK/AAB packages with the project-owned EAS or Android CI workflow.
- Add cross-device accounts and itinerary persistence in MongoDB with authorization, secure token handling, and tested recovery.
- Introduce an editorial content-management workflow with draft, review, publish, correction, and expiry states.
- Add content completeness dashboards and reminders for time-sensitive details such as hours and seasonal availability.
- Add stronger AI evaluation using reviewed sample questions and images, structured output validation, hallucination checks, and quality regression tests.
- Add production-ready observability for latency, provider failures, usage, and cost, without retaining raw photos or unnecessary precise-location data.
- Add account security, database row-level access policies, and explicit retention controls for synced user data.

### Version 2 exit criteria

- Expanded locations and translated content meet the same source and review standards as Version 1.
- Editors can update content safely and see which facts require re-verification.
- Travelers can use supported downloadable content offline and understand when cached facts may be stale.
- Pilot measurements show itinerary usefulness and story accuracy are improving, with a working correction/reporting process.
- AI, maps, and storage usage have monitored reliability and cost limits.

## Version 3 — Complete platform: Connected destination experience

**Goal:** Deliver the complete NTR District visitor experience, connecting discovery, on-location storytelling, local services, and destination operations in one reliable product.

### Traveler features

- District-wide catalogue and trip planning across heritage, spiritual tourism, rivers and islands, nature, museums, crafts, food, festivals, and verified local experiences.
- Advanced multi-day planning that adapts to user-selected pace, accessibility, weather/seasonal constraints where data is available, and verified opening schedules.
- On-location AI guide with text and audio, contextual place stories, multilingual support, and graceful offline behavior.
- Expanded Photo Storyteller with a maintained supported-content catalogue, transparent confidence, user correction, and shareable stories.
- Optional AR heritage experiences for specifically commissioned and validated sites and devices.
- Responsible-tourism guidance and verified local artisan, guide, food, and experience discovery.
- A “worth it” / place-fit explanation grounded in visitor interests and factual place attributes, not unsupported popularity claims.
- Optional booking, reservations, or payments only for partners with confirmed availability, policies, and support responsibilities.
- Safety experience integrated with verified official contact information, clear service boundaries, and explicit location-sharing controls.
- Carefully scoped live information such as event notices, closures, traffic, or crowd indicators only when reliable data sources and update ownership exist.

### Destination and platform capabilities

- Keep the Express + MongoDB API as the backend contract for web, Android, and approved partner/admin clients.
- Scale Node hosting, MongoDB deployment, backups, and Android release automation under project security and operational ownership.
- Production content operations with audit history, language review, source tracking, scheduled re-verification, and partner roles.
- Modular provider integrations for maps, AI/vision, notifications, bookings, and analytics so vendors can be replaced without redesigning product features.
- Regional scale, performance, accessibility, security, privacy, and disaster-recovery practices appropriate to a public visitor service.
- Aggregate destination insights for tourism planning using privacy-preserving metrics; do not expose individual traveler movement histories.
- Support process for partner onboarding, content corrections, incident reporting, and seasonal updates.

### Version 3 exit criteria

- All advertised district-wide locations and services have an accountable content/partner owner and current verification status.
- Advanced features such as AR, live data, and transactions are enabled only at supported locations and with clear failure and support paths.
- Security, privacy, accessibility, localization, performance, and operational-readiness reviews are complete before broad release.
- Tourism and local partners can keep content and service details current without engineering changes for routine edits.
- The complete product has a documented support, incident, and data-governance model.

## Cross-phase requirements

These are product foundations, not optional late-stage enhancements:

- Verify historical, cultural, practical, and safety claims with accountable sources before publication.
- Keep traveler control over itinerary edits, location access, photo access, and sharing.
- Keep AI and third-party secrets on the server; validate external and model-generated data.
- Provide clear loading, no-result, offline, low-confidence, and service-unavailable states.
- Never imply that a recommendation, route estimate, recognition result, opening time, or emergency response is guaranteed.
- Meet applicable accessibility, privacy, platform-store, and local regulatory requirements before release.

## Relationship to the project plan

The recommended stack, initial data model, API proposal, and safety/privacy principles are described in [PROJECT_PLAN.md](./PROJECT_PLAN.md). This roadmap extends its initial MVP outline into three versioned releases. Technologies and external providers remain proposals until budget, privacy, operational ownership, and requirements are confirmed.
