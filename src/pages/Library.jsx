import { Heart, Plus } from 'lucide-react';
import PlaylistCard from '../components/PlaylistCard.jsx';
import { useLibrary } from '../context/LibraryContext.jsx';
import { useNav } from '../context/NavContext.jsx';

export default function Library() {
  const { allPlaylists, createPlaylist } = useLibrary();
  const { navigate } = useNav();

  return (
    <div className="page">
      <h1 className="page__title">Your Library</h1>
      <div className="actions">
        <button type="button" className="btn" onClick={() => navigate({ name: 'playlist', id: createPlaylist().id })}>
          <Plus size={18} aria-hidden="true" /> Create playlist
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => navigate({ name: 'liked' })}>
          <Heart size={18} aria-hidden="true" /> Liked Songs
        </button>
      </div>
      <div className="grid">{allPlaylists.map((p) => <PlaylistCard key={p.id} playlist={p} />)}</div>
    </div>
  );
}
