import { Pause, Play, Shuffle } from 'lucide-react';
import TrackList from '../components/TrackList.jsx';
import { useLibrary } from '../context/LibraryContext.jsx';
import { usePlayback } from '../context/PlaybackContext.jsx';
import { useNav } from '../context/NavContext.jsx';

export default function Playlist({ playlistId }) {
  const { getPlaylist, getPlaylistTracks } = useLibrary();
  const { currentTrack, isPlaying, togglePlay, playList, shuffle, toggleShuffle } = usePlayback();
  const { navigate } = useNav();

  const playlist = getPlaylist(playlistId);
  if (!playlist) {
    return (
      <div className="page">
        <div className="empty">
          <h2>Playlist not found</h2>
          <button type="button" className="btn" onClick={() => navigate({ name: 'home' })}>Go home</button>
        </div>
      </div>
    );
  }

  const list = getPlaylistTracks(playlist);
  const active = isPlaying && !!currentTrack && list.some((t) => t.id === currentTrack.id);

  return (
    <div className="page">
      <header className="hero">
        <img className="hero__cover" src={playlist.cover} alt="" />
        <div className="hero__text">
          <span className="hero__kind">Playlist</span>
          <h1 className="hero__title">{playlist.name}</h1>
          <p className="muted">{playlist.description}</p>
          <p className="muted">{list.length} {list.length === 1 ? 'song' : 'songs'}</p>
        </div>
      </header>

      <div className="actions">
        <button
          type="button"
          className="play-btn play-btn--lg"
          onClick={() => (active ? togglePlay() : playList(list))}
          aria-label={active ? 'Pause playlist' : 'Play playlist'}
          disabled={!list.length}
        >
          {active ? <Pause size={26} fill="currentColor" aria-hidden="true" /> : <Play size={26} fill="currentColor" aria-hidden="true" />}
        </button>
        <button type="button" className={`icon-btn icon-btn--lg ${shuffle ? 'is-on' : ''}`} onClick={toggleShuffle} aria-pressed={shuffle} aria-label="Shuffle">
          <Shuffle size={24} aria-hidden="true" />
        </button>
      </div>

      {list.length ? (
        <TrackList tracks={list} playlistId={playlist.id} />
      ) : (
        <div className="empty">
          <h2>This playlist is empty</h2>
          <p>Open the "..." menu on any song and choose Add to playlist.</p>
          <button type="button" className="btn" onClick={() => navigate({ name: 'home' })}>Find songs</button>
        </div>
      )}
    </div>
  );
}
