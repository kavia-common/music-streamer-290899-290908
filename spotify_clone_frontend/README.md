# Spotify-like Frontend Scaffold (Ocean Professional)

This React app scaffolds a Spotify-like UI with:
- Sidebar navigation (Home, Search, Your Library, Playlists)
- Top bar with search input and profile/login button
- Main content sections for playlists and albums
- Fixed bottom audio player with basic controls and a sample local playback

Jamendo integration is now available for live tracks and previews.

## Run

- npm start
- App URL (preview): http://localhost:3000

The container is designed for preview systems and CRA defaults.

## Theme

The app applies the Ocean Professional theme:
- Primary: #2563EB
- Secondary: #F59E0B
- Background: #f9fafb
- Surface: #ffffff
- Text: #111827

See src/App.css and src/theme.js for details.

## Environment Variables

These variables are read when available to wire integration:

- REACT_APP_API_BASE
- REACT_APP_BACKEND_URL
- REACT_APP_FRONTEND_URL
- REACT_APP_WS_URL
- REACT_APP_NODE_ENV
- REACT_APP_NEXT_TELEMETRY_DISABLED
- REACT_APP_ENABLE_SOURCE_MAPS
- REACT_APP_PORT
- REACT_APP_TRUST_PROXY
- REACT_APP_LOG_LEVEL
- REACT_APP_HEALTHCHECK_PATH
- REACT_APP_FEATURE_FLAGS
- REACT_APP_EXPERIMENTS_ENABLED
- REACT_APP_JAMENDO_CLIENT_ID  ← Required to enable Jamendo API calls on the frontend

If not provided, the UI still runs but Jamendo sections will show empty lists and a friendly message.

## Jamendo Integration

- Public GET calls to Jamendo v3.0 are made directly from the frontend using the `client_id` only.
- No secrets are baked into the code. Do not expose client secrets in the frontend.
- Set environment variable:
  - `REACT_APP_JAMENDO_CLIENT_ID=<your_client_id>`
- Example request the app performs:
  - `GET https://api.jamendo.com/v3.0/tracks?format=json&client_id=${CLIENT_ID}&limit=30&has_preview=true&order=popularity_total&fuzzysearch=true&namesearch=QUERY`
- The Home page shows “Featured on Jamendo” using popularity ordering and has_preview=true.
- The search bar triggers live searches (debounced ~400ms) via Jamendo “tracks” with fuzzy name search.
- The bottom audio player plays the track’s preview URL (Jamendo `audio`/`audiopreview`), preferring HTTPS.

Graceful Handling:
- If the API errors or rate-limits, the UI displays a friendly message and falls back to empty lists.

TODOs:
- Backend proxy for secret handling (e.g., if you later need `REACT_APP_JAMENDO_CLIENT_SECRET`, use it only in a backend).
- Pagination controls.
- Additional search filters.

## TODOs (Future Integration)

- OAuth: Implement Spotify OAuth login for real user profiles.
- API: Fetch playlists/albums from REACT_APP_API_BASE instead of mock data.
- Player: Hook real track playback and queue management.
- Search: Query live results from backend or Spotify API.
- Routing: Add React Router for multiple pages and deep links.

## Notes

- This scaffold keeps dependencies minimal (React + CRA).
- Sample track attribution: Pixabay CC0 sample URL used for demonstration only.
