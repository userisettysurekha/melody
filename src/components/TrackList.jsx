import { Clock } from 'lucide-react';
import TrackRow from './TrackRow.jsx';
import { usePlayback } from '../context/PlaybackContext.jsx';


export default function TrackList({ tracks, playlistId, onSelect, startIndex = 0 }) {
  const { playTrack } = usePlayback();
  return (
    <div className="tracklist" role="table" aria-label="Tracks">
      <div className="tracklist__head" role="row">
        <span role="columnheader">#</span>
        <span role="columnheader">Title</span>
        <span role="columnheader" className="col-album">Album</span>
        <span role="columnheader" className="col-like" />
        <span role="columnheader" className="col-time"><Clock size={16} aria-label="Duration" /></span>
        <span role="columnheader" className="col-more" />
      </div>
      {tracks.map((track, i) => (
        <TrackRow
          key={`${track.id}-${i}`}
          track={track}
          number={startIndex + i + 1}
          playlistId={playlistId}
          onPlay={() => (onSelect ? onSelect(track, i) : playTrack(track, tracks))}
        />
      ))}
    </div>
  );
}
