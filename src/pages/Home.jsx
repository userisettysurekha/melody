import { useMemo } from 'react';
import PlaylistCard from '../components/PlaylistCard.jsx';
import TrackCard from '../components/TrackCard.jsx';
import TrackList from '../components/TrackList.jsx';
import { useLibrary } from '../context/LibraryContext.jsx';
import { usePlayback } from '../context/PlaybackContext.jsx';
import { tracks } from '../data/musicData.js';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export default function Home() {
  const { allPlaylists } = useLibrary();
  const { recentTracks } = usePlayback();

  const recent = recentTracks.slice(0, 6);
  const popular = useMemo(() => [...tracks].sort((a, b) => b.plays - a.plays).slice(0, 5), []);
  const recommended = useMemo(() => {
    const recentIds = new Set(recent.map((t) => t.id));
    return tracks.filter((t) => !recentIds.has(t.id)).slice(0, 6);
  }, [recent]);

  return (
    <div className="page">
      <h1 className="page__title">{greeting()}, Alex</h1>

      <section className="section" aria-labelledby="recent-h">
        <h2 id="recent-h" className="section__title">Recently played</h2>
        <div className="grid">{recent.map((t) => <TrackCard key={t.id} track={t} list={recent} />)}</div>
      </section>

      <section className="section" aria-labelledby="featured-h">
        <h2 id="featured-h" className="section__title">Featured playlists</h2>
        <div className="grid">{allPlaylists.map((p) => <PlaylistCard key={p.id} playlist={p} />)}</div>
      </section>

      <section className="section" aria-labelledby="popular-h">
        <h2 id="popular-h" className="section__title">Popular tracks</h2>
        <TrackList tracks={popular} />
      </section>

      <section className="section" aria-labelledby="rec-h">
        <h2 id="rec-h" className="section__title">Recommended for you</h2>
        <div className="grid">{recommended.map((t) => <TrackCard key={t.id} track={t} list={recommended} />)}</div>
      </section>
    </div>
  );
}
