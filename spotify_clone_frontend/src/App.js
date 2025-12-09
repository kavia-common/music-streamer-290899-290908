import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { theme, getEnv } from './theme';
import { getFeaturedTracks, searchTracks } from './api/jamendo';

/**
 * Jamendo-powered listings replace mock data.
 * If env is missing or API fails, graceful fallback to empty results and friendly messages.
 */

function Icon({ children, label }) {
  return <span role="img" aria-label={label} style={{ fontSize: 16 }}>{children}</span>;
}

function Sidebar({ active }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="dot" />
        <span>Oceanify</span>
      </div>
      <div className="nav-section">
        <div className="nav-label">Main</div>
        <a className={`nav-link ${active === 'home' ? 'active' : ''}`} href="#home">
          <Icon label="home">🏠</Icon>
          <span>Home</span>
        </a>
        <a className={`nav-link ${active === 'search' ? 'active' : ''}`} href="#search">
          <Icon label="search">🔎</Icon>
          <span>Search</span>
        </a>
        <a className={`nav-link ${active === 'library' ? 'active' : ''}`} href="#library">
          <Icon label="library">📚</Icon>
          <span>Your Library</span>
        </a>
      </div>

      <div className="nav-section">
        <div className="nav-label">Playlists</div>
        <a className="nav-link" href="#create-playlist">
          <Icon label="plus">➕</Icon>
          <span>Create Playlist</span>
        </a>
        <a className="nav-link" href="#liked-songs">
          <Icon label="heart">❤️</Icon>
          <span>Liked Songs</span>
        </a>
      </div>
    </aside>
  );
}

function Topbar({ query, setQuery }) {
  const env = useMemo(() => getEnv(), []);
  return (
    <header className="topbar">
      <div className="search" role="search">
        <Icon label="search">🔎</Icon>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tracks on Jamendo…"
          aria-label="Search for songs, artists, albums"
        />
      </div>
      <div className="profile">
        <div title="Future: OAuth login (Spotify)" className="avatar" />
        <button
          className="btn"
          onClick={() => alert(
            `TODO: Implement OAuth login\n\nDetected env:\napiBase: ${env.apiBase}\nbackendUrl: ${env.backendUrl}\nwsUrl: ${env.wsUrl}\nnodeEnv: ${env.nodeEnv}\njamendoClientId: ${env.jamendoClientId ? 'set' : 'missing'}\n\nNote: REACT_APP_JAMENDO_CLIENT_SECRET (if present) is reserved for backend proxy only.`
          )}
        >
          Sign in
        </button>
      </div>
    </header>
  );
}

function Section({ title, items, onSelect }) {
  return (
    <section className="section" aria-label={title}>
      <div className="section-title">
        <h2>{title}</h2>
        <a href="#see-all" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: 14 }}>
          See all
        </a>
      </div>
      <div className="grid">
        {items.map((it) => (
          <article key={it.id} className="card" onClick={() => onSelect(it)} aria-label={`track ${it.name}`}>
            <div className="cover" style={{
              backgroundImage: it.image ? `url(${it.image})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }} />
            <div className="title">{it.name}</div>
            <div className="subtitle">{it.artist_name}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

function formatTime(sec) {
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  const m = Math.floor(sec / 60).toString();
  return `${m}:${s}`;
}

function Player({ track, isPlaying, onToggle, onSeek, onVolume, audioRef, progress }) {
  return (
    <footer className="player" role="contentinfo" aria-label="Audio player">
      <div className="track-info">
        <div className="track-cover" style={{
          backgroundImage: track?.image ? `url(${track.image})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} />
        <div className="track-meta">
          <div className="track-title">{track?.name || track?.title || "—"}</div>
          <div className="track-artist">{track?.artist_name || track?.artist || "—"}</div>
        </div>
      </div>

      <div className="controls">
        <div className="controls-row">
          <button className="ctrl-btn" title="Previous" onClick={() => audioRef.current && (audioRef.current.currentTime = 0)}>
            <Icon label="prev">⏮️</Icon>
          </button>
          <button className="ctrl-btn" title={isPlaying ? 'Pause' : 'Play'} onClick={onToggle}>
            <Icon label={isPlaying ? 'pause' : 'play'}>{isPlaying ? '⏸️' : '▶️'}</Icon>
          </button>
          <button className="ctrl-btn" title="Next" onClick={() => alert('Mock: Next track')}>
            <Icon label="next">⏭️</Icon>
          </button>
        </div>
        <div className="progress">
          <span className="time">{formatTime(progress.current)}</span>
          <input
            className="seek"
            type="range"
            min={0}
            max={Math.max(1, progress.duration)}
            value={progress.current}
            onChange={(e) => onSeek(Number(e.target.value))}
            aria-label="Seek"
          />
          <span className="time">{formatTime(progress.duration)}</span>
        </div>
      </div>

      <div className="volume">
        <Icon label="volume">🔊</Icon>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          defaultValue={0.9}
          onChange={(e) => onVolume(Number(e.target.value))}
          aria-label="Volume"
        />
      </div>
    </footer>
  );
}

/**
 * Simple debounce hook for search inputs.
 */
function useDebouncedValue(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

// PUBLIC_INTERFACE
function App() {
  /**
   * High-level state for browsing and playing using Jamendo API.
   * TODO: Backend proxy for secret handling if needed.
   */
  const [active, setActive] = useState('home');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 400);

  // Listing state
  const [featured, setFeatured] = useState({ items: [], loading: false, error: '' });
  const [searchState, setSearchState] = useState({ items: [], loading: false, error: '' });

  // Playback - selected jamendo track
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const [progress, setProgress] = useState({ current: 0, duration: 0 });

  // Load featured tracks on mount or when client id changes
  const env = useMemo(() => getEnv(), []);
  useEffect(() => {
    let mounted = true;
    async function run() {
      setFeatured({ items: [], loading: true, error: '' });
      const res = await getFeaturedTracks({ page: 1, pageSize: 30 });
      if (!mounted) return;
      if (res.error) {
        setFeatured({ items: [], loading: false, error: 'Unable to load featured tracks. Please try again later.' });
      } else {
        setFeatured({ items: res.items, loading: false, error: '' });
      }
    }
    if (env.jamendoClientId) run();
    else setFeatured({ items: [], loading: false, error: 'Jamendo Client ID is missing. Set REACT_APP_JAMENDO_CLIENT_ID.' });
    return () => { mounted = false; };
  }, [env.jamendoClientId]);

  // Perform search when debounced query changes
  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!debouncedQuery) {
        setSearchState({ items: [], loading: false, error: '' });
        return;
      }
      setSearchState({ items: [], loading: true, error: '' });
      const res = await searchTracks({ query: debouncedQuery, page: 1, pageSize: 30 });
      if (!mounted) return;
      if (res.error) {
        setSearchState({ items: [], loading: false, error: 'Search failed or rate limited. Please try again.' });
      } else {
        setSearchState({ items: res.items, loading: false, error: '' });
      }
    }
    if (env.jamendoClientId) run();
    return () => { mounted = false; };
  }, [debouncedQuery, env.jamendoClientId]);

  // Attach audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => setProgress((p) => ({ ...p, duration: audio.duration || 0 }));
    const onTime = () => setProgress({ current: audio.currentTime || 0, duration: audio.duration || 0 });
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  // Play/pause effect
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
    else audio.pause();
  }, [isPlaying, currentTrack]);

  // Selecting a card should start playing that track
  const onSelectCard = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setActive('home');
  };

  const handleTogglePlay = () => setIsPlaying((p) => !p);
  const handleSeek = (t) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = t;
    setProgress((p) => ({ ...p, current: t }));
  };
  const handleVolume = (v) => {
    if (audioRef.current) audioRef.current.volume = v;
  };

  // Determine which items to display: if searching show search results, else featured
  const listTitle = debouncedQuery ? `Search results for "${debouncedQuery}"` : "Featured on Jamendo";
  const listItems = debouncedQuery ? searchState.items : featured.items;
  const listLoading = debouncedQuery ? searchState.loading : featured.loading;
  const listError = debouncedQuery ? searchState.error : featured.error;

  return (
    <div className="app">
      <Sidebar active={active} />
      <Topbar query={query} setQuery={setQuery} />

      <main className="content">
        <div className="section-title" style={{ marginBottom: 12 }}>
          <h2>{listTitle}</h2>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            {env.jamendoClientId ? '' : 'Set REACT_APP_JAMENDO_CLIENT_ID to enable live data'}
          </span>
        </div>

        {listLoading && (
          <div style={{ padding: 16, color: 'var(--color-text-muted)' }}>Loading tracks…</div>
        )}
        {!listLoading && listError && (
          <div style={{ padding: 16, color: 'var(--color-error)' }}>{listError}</div>
        )}
        {!listLoading && !listError && (
          <Section title="" items={listItems} onSelect={onSelectCard} />
        )}

        {/* TODO: Pagination controls and additional sections (e.g., New Releases) */}
      </main>

      <audio
        ref={audioRef}
        src={currentTrack?.audio || ""}
        preload="metadata"
      />
      <Player
        track={currentTrack || { name: 'No track selected', artist_name: '', image: '' }}
        isPlaying={isPlaying}
        onToggle={handleTogglePlay}
        onSeek={handleSeek}
        onVolume={handleVolume}
        audioRef={audioRef}
        progress={progress}
      />
    </div>
  );
}

export default App;
