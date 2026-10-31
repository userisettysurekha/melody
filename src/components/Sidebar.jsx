import { Heart, Home, Library, Music2, Plus, Search } from 'lucide-react';
import { useNav } from '../context/NavContext.jsx';
import { useLibrary } from '../context/LibraryContext.jsx';
import { usePlayback } from '../context/PlaybackContext.jsx';

function NavItem({ icon: Icon, label, active, onClick, className = '' }) {
  return (
    <button
      type="button"
      className={`nav-item ${active ? 'active' : ''} ${className}`}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      title={label}
    >
      <Icon size={24} aria-hidden="true" />
      <span className="label">{label}</span>
    </button>
  );
}

export default function Sidebar() {
  const { view, navigate } = useNav();
  const { allPlaylists, getPlaylistTracks, createPlaylist } = useLibrary();
  const { likedIds } = usePlayback();

  const handleCreate = () => {
    const p = createPlaylist();
    navigate({ name: 'playlist', id: p.id });
  };

  return (
    <aside className="sidebar" aria-label="Sidebar">
      <div className="brand panel">
        <span className="brand__logo" aria-hidden="true"><Music2 size={20} /></span>
        <span className="label">Melody</span>
      </div>

      <nav className="sidebar__nav panel" aria-label="Main">
        <NavItem icon={Home} label="Home" active={view.name === 'home'} onClick={() => navigate({ name: 'home' })} />
        <NavItem icon={Search} label="Search" active={view.name === 'search'} onClick={() => navigate({ name: 'search' })} />
        <NavItem icon={Library} label="Library" className="only-mobile" active={view.name === 'library' || view.name === 'playlist'} onClick={() => navigate({ name: 'library' })} />
        <NavItem icon={Heart} label="Liked Songs" className="only-mobile" active={view.name === 'liked'} onClick={() => navigate({ name: 'liked' })} />
      </nav>

      <section className="library panel" aria-label="Your Library">
        <div className="library__head">
          <button type="button" className="library__title" onClick={() => navigate({ name: 'library' })} title="Your Library">
            <Library size={24} aria-hidden="true" />
            <span className="label">Your Library</span>
          </button>
          <button type="button" className="icon-btn" onClick={handleCreate} aria-label="Create playlist" title="Create playlist">
            <Plus size={20} aria-hidden="true" />
          </button>
        </div>

        <ul className="library__list">
          <li>
            <button
              type="button"
              className={`lib-item ${view.name === 'liked' ? 'active' : ''}`}
              onClick={() => navigate({ name: 'liked' })}
              title="Liked Songs"
            >
              <span className="lib-item__cover lib-item__cover--liked" aria-hidden="true"><Heart size={20} fill="currentColor" /></span>
              <span className="label lib-item__text">
                <strong>Liked Songs</strong>
                <small>Playlist · {likedIds.length} songs</small>
              </span>
            </button>
          </li>
          {allPlaylists.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className={`lib-item ${view.name === 'playlist' && view.id === p.id ? 'active' : ''}`}
                onClick={() => navigate({ name: 'playlist', id: p.id })}
                title={p.name}
              >
                <img className="lib-item__cover" src={p.cover} alt="" />
                <span className="label lib-item__text">
                  <strong>{p.name}</strong>
                  <small>Playlist · {getPlaylistTracks(p).length} songs</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
