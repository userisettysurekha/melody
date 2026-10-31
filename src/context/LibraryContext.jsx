import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getPlaylistTracks, makeCover, playlists as basePlaylists } from '../data/musicData';
import { readStored, writeStored } from '../utils/storage';

const LibraryContext = createContext(null);

const isValid = (v) =>
  Array.isArray(v) &&
  v.every((p) => p && typeof p.id === 'string' && typeof p.name === 'string' && Array.isArray(p.trackIds));

export function LibraryProvider({ children }) {
  const [userPlaylists, setUserPlaylists] = useState(() => readStored('userPlaylists', [], isValid));

  useEffect(() => writeStored('userPlaylists', userPlaylists), [userPlaylists]);

  const createPlaylist = useCallback(() => {
    const n = userPlaylists.length + 1;
    const playlist = {
      id: `user-${Date.now()}`,
      name: `My Playlist #${n}`,
      description: 'Add songs with the "..." menu on any track.',
      cover: makeCover(`My Playlist ${n}`, (n * 67) % 360),
      trackIds: [],
      user: true,
    };
    setUserPlaylists((list) => [...list, playlist]);
    return playlist;
  }, [userPlaylists.length]);

  const addToPlaylist = useCallback(
    (playlistId, trackId) => {
      const target = userPlaylists.find((p) => p.id === playlistId);
      if (!target || target.trackIds.includes(trackId)) return false;
      setUserPlaylists((list) =>
        list.map((p) => (p.id === playlistId ? { ...p, trackIds: [...p.trackIds, trackId] } : p))
      );
      return true;
    },
    [userPlaylists]
  );

  const removeFromPlaylist = useCallback((playlistId, trackId) => {
    setUserPlaylists((list) =>
      list.map((p) => (p.id === playlistId ? { ...p, trackIds: p.trackIds.filter((id) => id !== trackId) } : p))
    );
  }, []);

  const allPlaylists = useMemo(() => [...basePlaylists, ...userPlaylists], [userPlaylists]);
  const getPlaylist = useCallback((id) => allPlaylists.find((p) => p.id === id), [allPlaylists]);

  const value = useMemo(
    () => ({ allPlaylists, userPlaylists, getPlaylist, getPlaylistTracks, createPlaylist, addToPlaylist, removeFromPlaylist }),
    [allPlaylists, userPlaylists, getPlaylist, createPlaylist, addToPlaylist, removeFromPlaylist]
  );
  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export const useLibrary = () => {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used inside <LibraryProvider>');
  return ctx;
};
