import { Heart, Pause, Play } from 'lucide-react';
import TrackList from '../components/TrackList.jsx';
import { usePlayback } from '../context/PlaybackContext.jsx';
import { useNav } from '../context/NavContext.jsx';

export default function LikedSongs() {
  const { likedTracks, currentTrack, isPlaying, togglePlay, playList } = usePlayback();
  const { navigate } = useNav();
  const active = isPlaying && !!currentTrack && likedTracks.some((t) => t.id === currentTrack.id);

  return (
    <div className="page">
      <header className="hero hero--liked">
        <span className="hero__cover hero__cover--liked" aria-hidden="true"><Heart size={72} fill="currentColor" /></span>
        <div className="hero__text">
          <span className="hero__kind">Playlist</span>
          <h1 className="hero__title">Liked Songs</h1>
          <p className="muted">{likedTracks.length} {likedTracks.length === 1 ? 'song' : 'songs'}</p>
        </div>
      </header>

      {likedTracks.length ? (
        <>
          <div className="actions">
            <button type="button" className="play-btn play-btn--lg" onClick={() => (active ? togglePlay() : playList(likedTracks))} aria-label={active ? 'Pause liked songs' : 'Play liked songs'}>
              {active ? <Pause size={26} fill="currentColor" aria-hidden="true" /> : <Play size={26} fill="currentColor" aria-hidden="true" />}
            </button>
          </div>
          <TrackList tracks={likedTracks} />
        </>
      ) : (
        <div className="empty">
          <Heart size={48} aria-hidden="true" />
          <h2>Songs you like will appear here</h2>
          <p>Tap the heart on any song to save it.</p>
          <button type="button" className="btn" onClick={() => navigate({ name: 'home' })}>Find songs</button>
        </div>
      )}
    </div>
  );
}
