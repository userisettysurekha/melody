import { useEffect, useRef } from 'react';
import { PlaybackProvider } from './context/PlaybackContext.jsx';
import { LibraryProvider } from './context/LibraryContext.jsx';
import { NavProvider, useNav } from './context/NavContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Navbar from './components/Navbar.jsx';
import PlayerBar from './components/PlayerBar.jsx';
import Toast from './components/Toast.jsx';
import Home from './pages/Home.jsx';
import Search from './pages/Search.jsx';
import Playlist from './pages/Playlist.jsx';
import LikedSongs from './pages/LikedSongs.jsx';
import Queue from './pages/Queue.jsx';
import Library from './pages/Library.jsx';

function CurrentView() {
  const { view } = useNav();
  switch (view.name) {
    case 'search': return <Search />;
    case 'playlist': return <Playlist playlistId={view.id} />;
    case 'liked': return <LikedSongs />;
    case 'queue': return <Queue />;
    case 'library': return <Library />;
    default: return <Home />;
  }
}

function Shell() {
  const { view } = useNav();
  const scrollRef = useRef(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [view]);

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Navbar />
        <div className="content" ref={scrollRef}>
          <CurrentView />
        </div>
      </main>
      <PlayerBar />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <PlaybackProvider>
      <LibraryProvider>
        <NavProvider>
          <Shell />
        </NavProvider>
      </LibraryProvider>
    </PlaybackProvider>
  );
}
