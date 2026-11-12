# Prompts History

This document records the sequence of prompts and specifications used in the development of the ParkSG Singapore Real-Time Carpark Availability application.

---

### Prompt 1: Initial Application Build
```text
build a singapore based carpark application that tracks real time carpark lots availability. build just the front-end for now, i'll integrate the backend later.
```

**Actions Executed:**
- Built full-featured React + TypeScript frontend with Tailwind CSS.
- Implemented real-time Singapore carpark lot availability tracking with connection to Data.gov.sg and verified transport dataset.
- Created interactive SVG map of Singapore with GIS coordinate projection, expressways, and vacancy pins (Plentiful, Moderate, Critical, Full).
- Added multi-lot breakdown (Cars, Motorcycles, Heavy vehicles, EV charging stations).
- Implemented rates breakdown, clearance height warning, GPS/preset location switcher, destination parking assistant ("Where to Park?"), and parking fee estimator.
- Configured light and dark mode support.

---

### Prompt 2: Remote Repository Sync
```text
git push https://<GITHUB_TOKEN>@github.com/oo0lala/cargowhere.git
```
*(Token redacted for security)*

**Actions Executed:**
- Initialized local Git repository and established `main` branch.
- Committed all initial project assets and code.
- Configured remote tracking for `https://github.com/oo0lala/cargowhere.git` and pushed upstream to `main`.

---

### Prompt 3: Serverless LTA DataMall Connection
```text
1. add a serverless connection that pulls live data from LTA's datamall using the following endpoint: 

# Live carpark lots (HDB, LTA and URA):
https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2

# Every request needs the header:  AccountKey: <LTA_ACCOUNT_KEY>

2. store this in /api folder at project root level (not src file)
3. include /health.ts and carparkavailability.ts within the same sub folder
4. do not hardcode any key, I will input them later
```

**Actions Executed:**
- Created `/api/carparkavailability.ts` at the root directory to query LTA DataMall's `CarParkAvailabilityv2` API using `AccountKey: process.env.LTA_ACCOUNT_KEY` (no hardcoded keys).
- Implemented `/api/health.ts` for service and environment key status checks.
- Created full-stack `server.ts` Express entry point mounting both `/api` endpoints and Vite dev middleware.
- Updated `.env.example` to document `LTA_ACCOUNT_KEY`.
- Updated client API to query `/api/carparkavailability` with seamless fallback.
- Committed and pushed changes to GitHub repository.

---

### Prompt 4: Prompts Documentation
```text
collate all of the prompts and store them as a PROMPTS.md file
```

**Actions Executed:**
- Collated the development prompts history with summaries and stored in `PROMPTS.md`.
