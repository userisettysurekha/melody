import TrackList from '../components/TrackList.jsx';
import { usePlayback } from '../context/PlaybackContext.jsx';
import { useNav } from '../context/NavContext.jsx';

export default function Queue() {
  const { queue, index, currentTrack, jumpTo } = usePlayback();
  const { navigate } = useNav();
  const upcoming = index >= 0 ? queue.slice(index + 1) : [];

  return (
    <div className="page">
      <h1 className="page__title">Queue</h1>
      {!currentTrack ? (
        <div className="empty">
          <h2>Your queue is empty</h2>
          <p>Play a song or playlist to build a queue.</p>
          <button type="button" className="btn" onClick={() => navigate({ name: 'home' })}>Find songs</button>
        </div>
      ) : (
        <>
          <section className="section">
            <h2 className="section__title">Now playing</h2>
            <TrackList tracks={[currentTrack]} onSelect={() => {}} />
          </section>
          <section className="section">
            <h2 className="section__title">Next up</h2>
            {upcoming.length ? (
              <TrackList tracks={upcoming} startIndex={index + 1} onSelect={(t, i) => jumpTo(index + 1 + i)} />
            ) : (
              <p className="muted">Nothing else is queued. Use "Add to queue" from a song's "..." menu.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
