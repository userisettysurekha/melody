import { Heart, ListMusic, Loader2, Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Volume1, Volume2, VolumeX } from 'lucide-react';
import { usePlayback, usePlaybackTime } from '../context/PlaybackContext.jsx';
import { useNav } from '../context/NavContext.jsx';
import { formatTime } from '../utils/format.js';

export default function PlayerBar() {
  const {
    currentTrack, isPlaying, status, errorMsg, togglePlay, next, previous, seek,
    volume, setVolume, muted, toggleMute, shuffle, toggleShuffle, repeat, cycleRepeat,
    toggleLike, isLiked,
  } = usePlayback();
  const { currentTime, duration } = usePlaybackTime();
  const { view, navigate } = useNav();

  const hasTrack = !!currentTrack;
  const loading = status === 'loading' && isPlaying;
  const hasError = status === 'error';
  const effectiveVolume = muted ? 0 : volume;
  const VolumeIcon = effectiveVolume === 0 ? VolumeX : effectiveVolume < 0.5 ? Volume1 : Volume2;
  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat;
  const liked = hasTrack && isLiked(currentTrack.id);
  const pct = duration ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <footer className="player" aria-label="Now playing">
      <div className="player__track">
        {hasTrack ? (
          <>
            <img className="player__cover" src={currentTrack.cover} alt={`Cover art for ${currentTrack.album}`} />
            <div className="player__meta">
              <span className="player__title">{currentTrack.title}</span>
              {hasError ? (
                <span className="player__error" role="alert">{errorMsg}</span>
              ) : (
                <span className="player__artist">{currentTrack.artist}</span>
              )}
            </div>
            <button
              type="button"
              className={`icon-btn ${liked ? 'is-liked' : ''}`}
              onClick={() => toggleLike(currentTrack.id)}
              aria-pressed={liked}
              aria-label={liked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
            >
              <Heart size={20} fill={liked ? 'currentColor' : 'none'} aria-hidden="true" />
            </button>
          </>
        ) : (
          <div className="player__meta">
            <span className="player__title">Nothing playing</span>
            <span className="player__artist">Pick a song to start listening</span>
          </div>
        )}
      </div>

      <div className="player__center">
        <div className="player__controls">
          <button type="button" className={`icon-btn ${shuffle ? 'is-on' : ''}`} onClick={toggleShuffle} aria-pressed={shuffle} aria-label="Shuffle">
            <Shuffle size={18} aria-hidden="true" />
          </button>
          <button type="button" className="icon-btn" onClick={previous} disabled={!hasTrack} aria-label="Previous track">
            <SkipBack size={22} fill="currentColor" aria-hidden="true" />
          </button>
          <button type="button" className="play-btn" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {loading ? (
              <Loader2 size={22} className="spin" aria-hidden="true" />
            ) : isPlaying ? (
              <Pause size={22} fill="currentColor" aria-hidden="true" />
            ) : (
              <Play size={22} fill="currentColor" aria-hidden="true" />
            )}
          </button>
          <button type="button" className="icon-btn" onClick={next} disabled={!hasTrack} aria-label="Next track">
            <SkipForward size={22} fill="currentColor" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`icon-btn ${repeat !== 'off' ? 'is-on' : ''}`}
            onClick={cycleRepeat}
            aria-label={`Repeat: ${repeat}`}
            title={`Repeat: ${repeat}`}
          >
            <RepeatIcon size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="player__progress">
          <span className="time" aria-hidden="true">{formatTime(currentTime)}</span>
          <input
            type="range"
            className="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            onChange={(e) => seek(Number(e.target.value))}
            disabled={!hasTrack || !duration}
            style={{ '--pct': `${pct}%` }}
            aria-label="Seek"
            aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
          />
          <span className="time" aria-hidden="true">{duration ? formatTime(duration) : '--:--'}</span>
        </div>
      </div>

      <div className="player__extra">
        <button
          type="button"
          className={`icon-btn ${view.name === 'queue' ? 'is-on' : ''}`}
          onClick={() => navigate({ name: 'queue' })}
          aria-label="Open queue"
          title="Queue"
        >
          <ListMusic size={20} aria-hidden="true" />
        </button>
        <button type="button" className="icon-btn" onClick={toggleMute} aria-pressed={muted || volume === 0} aria-label={muted || volume === 0 ? 'Unmute' : 'Mute'}>
          <VolumeIcon size={20} aria-hidden="true" />
        </button>
        <input
          type="range"
          className="range range--volume"
          min={0}
          max={1}
          step={0.01}
          value={effectiveVolume}
          onChange={(e) => setVolume(Number(e.target.value))}
          style={{ '--pct': `${effectiveVolume * 100}%` }}
          aria-label="Volume"
          aria-valuetext={`${Math.round(effectiveVolume * 100)} percent`}
        />
      </div>
    </footer>
  );
}
