import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, User, X } from 'lucide-react';
import { useNav } from '../context/NavContext.jsx';
import { clearStored } from '../utils/storage.js';

export default function Navbar() {
  const { view, navigate, back, forward, canBack, canForward, query, setQuery } = useNav();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

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

  const onChange = (e) => {
    setQuery(e.target.value);
    if (view.name !== 'search') navigate({ name: 'search' });
  };

  const go = (target) => {
    navigate(target);
    setMenuOpen(false);
  };

  const resetDemo = () => {
    if (window.confirm('Reset liked songs, playlists and preferences saved in this browser?')) {
      clearStored();
      window.location.reload();
    }
  };

  return (
    <header className="navbar">
      <div className="navbar__history">
        <button type="button" className="round-btn" onClick={back} disabled={!canBack} aria-label="Go back">
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <button type="button" className="round-btn" onClick={forward} disabled={!canForward} aria-label="Go forward">
          <ChevronRight size={22} aria-hidden="true" />
        </button>
      </div>

      <div className="searchbox" role="search">
        <Search size={20} aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={onChange}
          onKeyDown={(e) => e.key === 'Escape' && setQuery('')}
          placeholder="Search songs, artists or albums"
          aria-label="Search songs, artists or albums"
          autoComplete="off"
        />
        {query && (
          <button type="button" className="icon-btn" onClick={() => setQuery('')} aria-label="Clear search">
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="profile" ref={menuRef}>
        <button
          type="button"
          className="round-btn round-btn--profile"
          onClick={() => setMenuOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="Open profile menu"
        >
          <User size={20} aria-hidden="true" />
        </button>
        {menuOpen && (
          <div className="menu" role="menu">
            <div className="menu__header">Demo user</div>
            <button type="button" role="menuitem" onClick={() => go({ name: 'liked' })}>Liked Songs</button>
            <button type="button" role="menuitem" onClick={() => go({ name: 'library' })}>Your Library</button>
            <button type="button" role="menuitem" onClick={() => go({ name: 'queue' })}>Queue</button>
            <button type="button" role="menuitem" onClick={resetDemo}>Reset demo data</button>
          </div>
        )}
      </div>
    </header>
  );
}
