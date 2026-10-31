import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { tracks as allTracks } from '../data/musicData';
import { readStored, writeStored } from '../utils/storage';

const PlaybackContext = createContext(null);
// currentTime changes ~4x/second, so it lives in its own context to avoid re-rendering every consumer.
const TimeContext = createContext({ currentTime: 0, duration: 0 });

const isStringArray = (v) => Array.isArray(v) && v.every((x) => typeof x === 'string');
const DEFAULT_RECENT = ['t3', 't1', 't9', 't5', 't11', 't14'];

export function PlaybackProvider({ children }) {
  // One single <audio> element for the whole app.
  const audioRef = useRef(null);
  const shouldPlayRef = useRef(false); // true once the user has asked for playback
  const historyRef = useRef([]); // previously played queue indexes (used by shuffle + previous)
  const toastTimer = useRef(null);

  const [queue, setQueue] = useState(allTracks);
  const [index, setIndex] = useState(() => {
    const id = readStored('lastTrack', null, (v) => typeof v === 'string');
    return allTracks.findIndex((t) => t.id === id); // -1 when nothing stored
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [errorMsg, setErrorMsg] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [durations, setDurations] = useState({});
  const [volume, setVolumeState] = useState(() =>
    readStored('volume', 0.7, (v) => typeof v === 'number' && v >= 0 && v <= 1)
  );
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('off'); // off | all | one
  const [likedIds, setLikedIds] = useState(() => readStored('liked', [], isStringArray));
  const [recentIds, setRecentIds] = useState(() => readStored('recent', DEFAULT_RECENT, isStringArray));
  const [toast, setToast] = useState(null);

  const currentTrack = index >= 0 ? queue[index] ?? null : null;
  const currentId = currentTrack?.id;
  const currentIdRef = useRef(currentId);
  currentIdRef.current = currentId;

  const notify = useCallback((message) => {
    setToast({ message, key: Date.now() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const startPlayback = useCallback(() => {
    const a = audioRef.current;
    if (!a || !a.getAttribute('src')) return;
    const p = a.play();
    if (p && p.catch) {
      p.catch((err) => {
        if (err.name === 'AbortError') return; // interrupted by a newer load - expected
        if (err.name === 'NotAllowedError') {
          setIsPlaying(false);
          notify('Your browser blocked autoplay. Press play to start.');
          return;
        }
        setIsPlaying(false);
        setStatus('error');
        setErrorMsg("This track couldn't be played. Choose another track.");
      });
    }
  }, [notify]);

  // ---- Load the source whenever the selected track changes ----
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !currentTrack) return;
    setStatus('loading');
    setErrorMsg('');
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    a.src = currentTrack.audioUrl;
    a.load();
    if (shouldPlayRef.current) startPlayback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId]);

  // ---- Volume / mute ----
  useEffect(() => {
    const a = audioRef.current;
    if (a) {
      a.volume = volume;
      a.muted = muted;
    }
  }, [volume, muted]);

  // ---- Persistence ----
  useEffect(() => writeStored('volume', volume), [volume]);
  useEffect(() => writeStored('liked', likedIds), [likedIds]);
  useEffect(() => writeStored('recent', recentIds), [recentIds]);
  useEffect(() => {
    if (currentId) writeStored('lastTrack', currentId);
  }, [currentId]);

  // ---- Recently played ----
  useEffect(() => {
    if (!isPlaying || !currentId) return;
    setRecentIds((ids) => (ids[0] === currentId ? ids : [currentId, ...ids.filter((i) => i !== currentId)].slice(0, 12)));
  }, [isPlaying, currentId]);

  // ---- Queue navigation ----
  const jump = useCallback(
    (i) => {
      if (i < 0 || i >= queue.length) return;
      shouldPlayRef.current = true;
      if (index >= 0) historyRef.current = [...historyRef.current.slice(-99), index];
      if (queue[i].id === currentIdRef.current) {
        const a = audioRef.current;
        if (a) a.currentTime = 0;
        setCurrentTime(0);
        setIndex(i);
        startPlayback();
      } else {
        setIndex(i);
      }
    },
    [queue, index, startPlayback]
  );

  const pickNext = useCallback(
    (auto) => {
      if (!queue.length) return -1;
      if (shuffle && queue.length > 1) {
        let r;
        do r = Math.floor(Math.random() * queue.length);
        while (r === index);
        return r;
      }
      if (index < queue.length - 1) return index + 1;
      if (repeat === 'all' || !auto) return 0;
      return -1; // end of queue
    },
    [queue, index, shuffle, repeat]
  );

  const next = useCallback(() => {
    const n = pickNext(false);
    if (n >= 0) jump(n);
  }, [pickNext, jump]);

  const previous = useCallback(() => {
    const a = audioRef.current;
    if (a && a.currentTime > 3) {
      a.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    if (!queue.length) return;
    shouldPlayRef.current = true;
    if (shuffle && historyRef.current.length) {
      const prev = historyRef.current[historyRef.current.length - 1];
      historyRef.current = historyRef.current.slice(0, -1);
      if (queue[prev]?.id === currentIdRef.current && a) a.currentTime = 0;
      setIndex(prev);
      return;
    }
    const i = index > 0 ? index - 1 : queue.length - 1;
    if (queue[i].id === currentIdRef.current) {
      if (a) a.currentTime = 0;
      startPlayback();
    } else {
      setIndex(i);
    }
  }, [queue, index, shuffle, startPlayback]);

  // ---- Public actions ----
  const playTrack = useCallback(
    (track, list) => {
      let q = list && list.length ? list : [track];
      let i = q.findIndex((t) => t.id === track.id);
      if (i < 0) {
        q = [track, ...q];
        i = 0;
      }
      shouldPlayRef.current = true;
      historyRef.current = [];
      setQueue(q);
      setIndex(i);
      if (currentIdRef.current === track.id) {
        const a = audioRef.current;
        if (a) a.currentTime = 0;
        setCurrentTime(0);
        startPlayback();
      }
    },
    [startPlayback]
  );

  const playList = useCallback(
    (list, { shuffleStart = false } = {}) => {
      if (!list.length) return notify('There are no songs here yet.');
      if (shuffleStart) {
        setShuffle(true);
        playTrack(list[Math.floor(Math.random() * list.length)], list);
      } else {
        playTrack(list[0], list);
      }
    },
    [playTrack, notify]
  );

  const jumpTo = useCallback((i) => jump(i), [jump]);

  const addToQueue = useCallback(
    (track) => {
      if (!currentTrack) {
        playTrack(track, [track]);
        return;
      }
      setQueue((q) => [...q.slice(0, index + 1), track, ...q.slice(index + 1)]);
      notify(`Added "${track.title}" to the queue`);
    },
    [currentTrack, index, playTrack, notify]
  );

  const togglePlay = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (!currentTrack) {
      playTrack(allTracks[0], allTracks);
      return;
    }
    if (status === 'error') {
      shouldPlayRef.current = true;
      setStatus('loading');
      setErrorMsg('');
      a.load();
      startPlayback();
      return;
    }
    if (a.paused) {
      shouldPlayRef.current = true;
      startPlayback();
    } else {
      shouldPlayRef.current = false;
      a.pause();
    }
  }, [currentTrack, status, playTrack, startPlayback]);

  const seek = useCallback((t) => {
    const a = audioRef.current;
    if (!a || !Number.isFinite(t)) return;
    a.currentTime = t;
    setCurrentTime(t);
  }, []);

  const setVolume = useCallback((v) => {
    const clamped = Math.min(1, Math.max(0, v));
    setVolumeState(clamped);
    if (clamped > 0) setMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    if (volume === 0) {
      setVolumeState(0.5);
      setMuted(false);
    } else {
      setMuted((m) => !m);
    }
  }, [volume]);

  const toggleShuffle = useCallback(() => setShuffle((s) => !s), []);
  const cycleRepeat = useCallback(() => setRepeat((r) => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off')), []);

  const toggleLike = useCallback(
    (id) => setLikedIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [id, ...ids])),
    []
  );

  const likedSet = useMemo(() => new Set(likedIds), [likedIds]);
  const isLiked = useCallback((id) => likedSet.has(id), [likedSet]);
  const likedTracks = useMemo(
    () => likedIds.map((id) => allTracks.find((t) => t.id === id)).filter(Boolean),
    [likedIds]
  );
  const recentTracks = useMemo(
    () => recentIds.map((id) => allTracks.find((t) => t.id === id)).filter(Boolean),
    [recentIds]
  );

  // ---- Keyboard: Space toggles playback when focus isn't on a control ----
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Space' || e.repeat) return;
      const el = e.target;
      if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(el.tagName) || el.isContentEditable) return;
      e.preventDefault();
      togglePlay();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay]);

  // ---- Audio element event handlers ----
  const handleEnded = () => {
    const a = audioRef.current;
    if (repeat === 'one') {
      a.currentTime = 0;
      startPlayback();
      return;
    }
    const n = pickNext(true);
    if (n === -1) {
      shouldPlayRef.current = false;
      a.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
    } else {
      jump(n);
    }
  };

  const handleError = (e) => {
    const a = e.currentTarget;
    if (!a.getAttribute('src')) return;
    setIsPlaying(false);
    setStatus('error');
    setErrorMsg(
      a.error?.code === 2
        ? 'Network problem - check your connection and press play to retry.'
        : "This track couldn't be loaded. Choose another track."
    );
  };

  const handleLoadedMetadata = (e) => {
    const d = e.currentTarget.duration;
    const value = Number.isFinite(d) ? d : 0;
    setDuration(value);
    if (value && currentIdRef.current) setDurations((m) => ({ ...m, [currentIdRef.current]: value }));
  };

  const value = useMemo(
    () => ({
      queue, index, currentTrack, isPlaying, status, errorMsg, volume, muted, shuffle, repeat,
      likedIds, likedTracks, recentTracks, durations, toast,
      playTrack, playList, jumpTo, addToQueue, togglePlay, next, previous, seek, setVolume,
      toggleMute, toggleShuffle, cycleRepeat, toggleLike, isLiked, notify,
    }),
    [queue, index, currentTrack, isPlaying, status, errorMsg, volume, muted, shuffle, repeat,
      likedIds, likedTracks, recentTracks, durations, toast, playTrack, playList, jumpTo, addToQueue,
      togglePlay, next, previous, seek, setVolume, toggleMute, toggleShuffle, cycleRepeat, toggleLike,
      isLiked, notify]
  );
  const timeValue = useMemo(() => ({ currentTime, duration }), [currentTime, duration]);

  return (
    <PlaybackContext.Provider value={value}>
      <TimeContext.Provider value={timeValue}>
        {children}
        <audio
          ref={audioRef}
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onPlaying={() => setStatus('ready')}
          onWaiting={() => setStatus('loading')}
          onCanPlay={() => setStatus((s) => (s === 'loading' ? 'ready' : s))}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onEnded={handleEnded}
          onError={handleError}
        />
      </TimeContext.Provider>
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error('usePlayback must be used inside <PlaybackProvider>');
  return ctx;
}

export const usePlaybackTime = () => useContext(TimeContext);
