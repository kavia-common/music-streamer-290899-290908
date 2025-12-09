import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { theme, getEnv } from './theme';

/**
 * Mock data and sample track
 * Note: This app does not require a backend. We provide mock playlists/albums.
 * The audio player plays a local sample via a public URL.
 */
const MOCK_PLAYLISTS = [
  { id: 'pl1', title: 'Daily Mix 1', subtitle: 'Indie • Chill', cover: '', type: 'playlist' },
  { id: 'pl2', title: 'Focus Flow', subtitle: 'Deep work beats', cover: '', type: 'playlist' },
  { id: 'pl3', title: 'Lo-Fi Vibes', subtitle: 'Lo-fi • Beats', cover: '', type: 'playlist' },
  { id: 'pl4', title: 'Coding Session', subtitle: 'Electro • Ambient', cover: '', type: 'playlist' },
  { id: 'pl5', title: 'Discover Weekly', subtitle: 'Fresh tracks', cover: '', type: 'playlist' },
  { id: 'pl6', title: 'Throwback', subtitle: '90s • 00s', cover: '', type: 'playlist' },
];

const MOCK_ALBUMS = [
  { id: 'al1', title: 'Ocean Drive', subtitle: 'Blue Skies', cover: '', type: 'album' },
  { id: 'al2', title: 'Amber Lights', subtitle: 'Sunset Walks', cover: '', type: 'album' },
  { id: 'al3', title: 'Midnight City', subtitle: 'Skyline', cover: '', type: 'album' },
  { id: 'al4', title: 'Neon Nights', subtitle: 'After Hours', cover: '', type: 'album' },
  { id: 'al5', title: 'Morning Brew', subtitle: 'Cafe Jazz', cover: '', type: 'album' },
  { id: 'al6', title: 'Focus Beats', subtitle: 'Flow State', cover: '', type: 'album' },
];

// A small, license-free sample track (public domain/CC0 sample tone)
const SAMPLE_TRACK_URL =
  'https://cdn.pixabay.com/download/audio/2022/03/15/audio_7d8f1a8f42.mp3?filename=calm-meditation-112191.mp3';

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
          placeholder="What do you want to listen to?"
          aria-label="Search for songs, artists, albums"
        />
      </div>
      <div className="profile">
        <div title="Future: OAuth login (Spotify)" className="avatar" />
        <button
          className="btn"
          onClick={() => alert(
            `TODO: Implement OAuth login\n\nDetected env:\napiBase: ${env.apiBase}\nbackendUrl: ${env.backendUrl}\nwsUrl: ${env.wsUrl}\nnodeEnv: ${env.nodeEnv}`
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
          <article key={it.id} className="card" onClick={() => onSelect(it)} aria-label={`${it.type} ${it.title}`}>
            <div className="cover" />
            <div className="title">{it.title}</div>
            <div className="subtitle">{it.subtitle}</div>
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
        <div className="track-cover" />
        <div className="track-meta">
          <div className="track-title">{track.title}</div>
          <div className="track-artist">{track.artist}</div>
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

// PUBLIC_INTERFACE
function App() {
  /**
   * High-level state for browsing and playing.
   * In a future iteration, playlists/albums will be fetched via Spotify Web API.
   * TODO: Integrate OAuth flow and fetch real data from Spotify using env vars.
   */
  const [active, setActive] = useState('home');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const [track] = useState({
    id: 'sample',
    title: 'Calm Meditation',
    artist: 'Pixabay CC0',
    src: SAMPLE_TRACK_URL,
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const [progress, setProgress] = useState({ current: 0, duration: 0 });

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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
    else audio.pause();
  }, [isPlaying]);

  const onSelectCard = (it) => {
    setSelected(it);
    setActive('home');
  };

  const filteredPlaylists = useMemo(() => {
    if (!query) return MOCK_PLAYLISTS;
    const q = query.toLowerCase();
    return MOCK_PLAYLISTS.filter(p => p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q));
  }, [query]);

  const filteredAlbums = useMemo(() => {
    if (!query) return MOCK_ALBUMS;
    const q = query.toLowerCase();
    return MOCK_ALBUMS.filter(a => a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q));
  }, [query]);

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

  return (
    <div className="app">
      <Sidebar active={active} />
      <Topbar query={query} setQuery={setQuery} />

      <main className="content">
        <Section title={selected ? `Because you listened to ${selected.title}` : 'Made For You'} items={filteredPlaylists} onSelect={onSelectCard} />
        <Section title="Popular Albums" items={filteredAlbums} onSelect={onSelectCard} />
        {/* TODO: Add more sections: Recently played, New releases */}

        {/* TODO: Wire dynamic content with API_BASE when available:
            const { apiBase } = getEnv();
            fetch(`${apiBase}/playlists`)... */}
      </main>

      <audio ref={audioRef} src={track.src} preload="metadata" />
      <Player
        track={track}
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
