import { Pause, Play } from 'lucide-react';
import { useNav } from '../context/NavContext.jsx';
import { useLibrary } from '../context/LibraryContext.jsx';
import { usePlayback } from '../context/PlaybackContext.jsx';

export default function PlaylistCard({ playlist }) {
  const { navigate } = useNav();
  const { getPlaylistTracks } = useLibrary();
  const { playList, currentTrack, isPlaying, togglePlay } = usePlayback();
  const list = getPlaylistTracks(playlist);
  const active = isPlaying && !!currentTrack && list.some((t) => t.id === currentTrack.id);
  const open = () => navigate({ name: 'playlist', id: playlist.id });

  return (
    <article className="card">
      <div className="card__media">
        <button type="button" className="card__open" onClick={open} tabIndex={-1} aria-hidden="true">
          <img className="card__cover" src={playlist.cover} alt="" loading="lazy" />
        </button>
        <button
          type="button"
          className="card__play"
          onClick={() => (active ? togglePlay() : playList(list))}
          aria-label={`${active ? 'Pause' : 'Play'} ${playlist.name}`}
        >
          {active ? <Pause size={22} fill="currentColor" aria-hidden="true" /> : <Play size={22} fill="currentColor" aria-hidden="true" />}
        </button>
      </div>
      <button type="button" className="card__open" onClick={open}>
        <h3 className="card__title">{playlist.name}</h3>
        <p className="card__sub">{playlist.description}</p>
      </button>
    </article>
  );
}
