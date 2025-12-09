# Spotify-like Frontend Scaffold (Ocean Professional)

This React app scaffolds a Spotify-like UI with:
- Sidebar navigation (Home, Search, Your Library, Playlists)
- Top bar with search input and profile/login button
- Main content sections for playlists and albums
- Fixed bottom audio player with basic controls and a sample local playback

No backend is required. The app uses mock data and a license-free sample audio track for local playback.

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

These variables are read when available to wire future integration:

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

If not provided, the UI still runs with mock data.

## TODOs (Future Integration)

- OAuth: Implement Spotify OAuth login for real user profiles.
- API: Fetch playlists/albums from REACT_APP_API_BASE instead of mock data.
- Player: Hook real track playback and queue management.
- Search: Query live results from backend or Spotify API.
- Routing: Add React Router for multiple pages and deep links.

## Notes

- This scaffold keeps dependencies minimal (React + CRA).
- Sample track attribution: Pixabay CC0 sample URL used for demonstration only.
