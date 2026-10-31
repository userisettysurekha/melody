import { useMemo } from 'react';
import { SearchX } from 'lucide-react';
import PlaylistCard from '../components/PlaylistCard.jsx';
import TrackList from '../components/TrackList.jsx';
import { useNav } from '../context/NavContext.jsx';
import { useLibrary } from '../context/LibraryContext.jsx';
import { tracks } from '../data/musicData.js';

export default function Search() {
  const { query, setQuery } = useNav();
  const { allPlaylists, getPlaylistTracks } = useLibrary();
  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return { tracks: [], playlists: [] };
    const namesByTrack = {};
    allPlaylists.forEach((p) =>
      getPlaylistTracks(p).forEach((t) => (namesByTrack[t.id] = [...(namesByTrack[t.id] || []), p.name]))
    );
    return {
      tracks: tracks.filter((t) =>
        [t.title, t.artist, t.album, ...(namesByTrack[t.id] || [])].some((s) => s.toLowerCase().includes(q))
      ),
      playlists: allPlaylists.filter((p) => p.name.toLowerCase().includes(q)),
    };
  }, [q, allPlaylists, getPlaylistTracks]);

  if (!q) {
    return (
      <div className="page">
        <h1 className="page__title">Search</h1>
        <p className="muted">Type in the search box above to find songs by title, artist, album or playlist.</p>
        <section className="section">
          <h2 className="section__title">Browse all</h2>
          <div className="grid">{allPlaylists.map((p) => <PlaylistCard key={p.id} playlist={p} />)}</div>
        </section>
      </div>
    );
  }

  const empty = !results.tracks.length && !results.playlists.length;
  return (
    <div className="page">
      <h1 className="page__title">Results for "{query.trim()}"</h1>
      {empty ? (
        <div className="empty">
          <SearchX size={48} aria-hidden="true" />
          <h2>No results found</h2>
          <p>Check the spelling or try a different song, artist or album.</p>
          <button type="button" className="btn" onClick={() => setQuery('')}>Clear search</button>
        </div>
      ) : (
        <>
          {results.tracks.length > 0 && (
            <section className="section">
              <h2 className="section__title">Songs ({results.tracks.length})</h2>
              <TrackList tracks={results.tracks} />
            </section>
          )}
          {results.playlists.length > 0 && (
            <section className="section">
              <h2 className="section__title">Playlists</h2>
              <div className="grid">{results.playlists.map((p) => <PlaylistCard key={p.id} playlist={p} />)}</div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
