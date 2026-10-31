import { Pause, Play } from 'lucide-react';
import { usePlayback } from '../context/PlaybackContext.jsx';

export default function TrackCard({ track, list }) {
  const { currentTrack, isPlaying, togglePlay, playTrack } = usePlayback();
  const isCurrent = currentTrack?.id === track.id;
  const playing = isCurrent && isPlaying;

  return (
    <article className={`card ${isCurrent ? 'card--active' : ''}`}>
      <div className="card__media">
        <img className="card__cover" src={track.cover} alt="" loading="lazy" />
        <button
          type="button"
          className="card__play"
          onClick={() => (isCurrent ? togglePlay() : playTrack(track, list))}
          aria-label={`${playing ? 'Pause' : 'Play'} ${track.title} by ${track.artist}`}
        >
          {playing ? <Pause size={22} fill="currentColor" aria-hidden="true" /> : <Play size={22} fill="currentColor" aria-hidden="true" />}
        </button>
      </div>
      <div className="card__text">
        <h3 className="card__title">{track.title}</h3>
        <p className="card__sub">{track.artist}</p>
      </div>
    </article>
  );
}
