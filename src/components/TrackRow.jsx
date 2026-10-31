import { useEffect, useRef, useState } from 'react';
import { Heart, ListPlus, MoreHorizontal, Pause, Play, Trash2 } from 'lucide-react';
import { usePlayback } from '../context/PlaybackContext.jsx';
import { useLibrary } from '../context/LibraryContext.jsx';
import { formatTime } from '../utils/format.js';

export default function TrackRow({ track, number, playlistId, onPlay }) {
  const { currentTrack, isPlaying, status, togglePlay, toggleLike, isLiked, durations, addToQueue, notify } = usePlayback();
  const { userPlaylists, addToPlaylist, removeFromPlaylist } = useLibrary();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isCurrent = currentTrack?.id === track.id;
  const playing = isCurrent && isPlaying;
  const liked = isLiked(track.id);
  const duration = durations[track.id];
  const ownPlaylist = userPlaylists.find((p) => p.id === playlistId);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const handlePlay = () => (isCurrent ? togglePlay() : onPlay());

  const addTo = (p) => {
    notify(addToPlaylist(p.id, track.id) ? `Added to ${p.name}` : `Already in ${p.name}`);
    setMenuOpen(false);
  };

  return (
    <div
      className={`row ${isCurrent ? 'row--active' : ''} ${isCurrent && status === 'error' ? 'row--error' : ''}`}
      role="row"
      aria-current={isCurrent ? 'true' : undefined}
      onDoubleClick={handlePlay}
    >
      <button
        type="button"
        className="row__num"
        onClick={handlePlay}
        aria-label={`${playing ? 'Pause' : 'Play'} ${track.title} by ${track.artist}`}
      >
        {playing ? (
          <span className="eq" aria-hidden="true"><i /><i /><i /></span>
        ) : (
          <span className="row__num-text">{number}</span>
        )}
        <span className="row__icon" aria-hidden="true">
          {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
        </span>
      </button>

      <div className="row__main" role="cell">
        <img src={track.cover} alt="" className="row__cover" loading="lazy" />
        <div className="row__text">
          <span className="row__title">{track.title}</span>
          <span className="row__artist">{track.artist}</span>
        </div>
      </div>

      <span className="row__album col-album" role="cell">{track.album}</span>

      <button
        type="button"
        className={`icon-btn row__like ${liked ? 'is-liked' : ''} col-like`}
        onClick={() => toggleLike(track.id)}
        aria-pressed={liked}
        aria-label={liked ? `Remove ${track.title} from Liked Songs` : `Save ${track.title} to Liked Songs`}
      >
        <Heart size={18} fill={liked ? 'currentColor' : 'none'} aria-hidden="true" />
      </button>

      <span className="row__time col-time" role="cell">{duration ? formatTime(duration) : '--:--'}</span>

      <div className="row__more col-more" ref={menuRef}>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setMenuOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label={`More options for ${track.title}`}
        >
          <MoreHorizontal size={20} aria-hidden="true" />
        </button>
        {menuOpen && (
          <div className="menu menu--row" role="menu">
            <button type="button" role="menuitem" onClick={() => { addToQueue(track); setMenuOpen(false); }}>
              <ListPlus size={16} aria-hidden="true" /> Add to queue
            </button>
            <div className="menu__header">Add to playlist</div>
            {userPlaylists.length === 0 && <div className="menu__empty">Create a playlist from the sidebar first.</div>}
            {userPlaylists.map((p) => (
              <button type="button" role="menuitem" key={p.id} onClick={() => addTo(p)}>{p.name}</button>
            ))}
            {ownPlaylist && (
              <button
                type="button"
                role="menuitem"
                className="menu__danger"
                onClick={() => { removeFromPlaylist(ownPlaylist.id, track.id); setMenuOpen(false); }}
              >
                <Trash2 size={16} aria-hidden="true" /> Remove from this playlist
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
