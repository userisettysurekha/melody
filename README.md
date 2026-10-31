# Melody - Spotify-inspired Music Player

A responsive music streaming web app built with **React 18, Vite, JavaScript, CSS3 and the HTML5 Audio API**.
Original branding ("Melody"); not affiliated with Spotify.

## Features
- Real playback through a single `<audio>` element controlled with `useRef`: play/pause, next/previous, seekable progress bar, current/total time, volume, mute, auto-advance on `ended`
- Shuffle, repeat (off / all / one), add to queue, queue page
- Loading, buffering and error states - a failed track shows a clear message and is never shown as "playing"
- Global state via React Context (`PlaybackContext`, plus separate time context to limit re-renders); Now Playing bar persists across views
- Home (greeting, recently played, featured playlists, popular, recommended), Search (title / artist / album / playlist, case-insensitive, live, empty state), Playlist, Liked Songs, Queue, Library
- Create playlists and add/remove tracks (stored in localStorage)
- Liked songs, volume, last track, recently played saved in localStorage (validated on read; reload never auto-plays)
- Responsive: full sidebar -> icon sidebar (tablet) -> bottom tab bar (mobile); keyboard accessible (Space toggles play when no control is focused)
- In-app back/forward history (no router needed, so GitHub Pages has no deep-link issues)

## Run locally
```bash
npm install
npm run dev        # http://localhost:5173
```

## Production build
```bash
npm run build      # outputs to dist/
npm run preview    # serve the build locally
```

## Deploy to GitHub Pages
`vite.config.js` uses `base: './'`, so no repo-name configuration is needed.

**Option A - GitHub Actions (included):**
1. Push the project to a GitHub repository on the `main` branch.
2. Repo **Settings -> Pages -> Source: GitHub Actions**.
3. Every push to `main` runs `.github/workflows/deploy.yml` and publishes `dist/`.

**Option B - manual with `gh-pages`:**
```bash
npm install -D gh-pages
# add to package.json scripts:  "deploy": "npm run build && gh-pages -d dist"
npm run deploy     # then Settings -> Pages -> Branch: gh-pages
```

## Project structure
```
src/
  components/  Sidebar, Navbar, PlaylistCard, TrackCard, TrackList, TrackRow, PlayerBar, Toast
  context/     PlaybackContext (audio + player state), LibraryContext (playlists), NavContext (views/search)
  data/        musicData.js (16 tracks, 5 playlists)
  pages/       Home, Search, Playlist, LikedSongs, Queue, Library
  styles/      global.css, components.css
  utils/       format.js, storage.js
```

## Audio and artwork
Tracks stream from the free SoundHelix example library (https://www.soundhelix.com/examples/), intended for demos and testing. Cover art is generated locally as SVG. To use your own audio, drop files in `public/audio/` and set `audioUrl` to `import.meta.env.BASE_URL + 'audio/yourfile.mp3'` in `src/data/musicData.js`.

## Limitations
- Requires an internet connection for audio; if SoundHelix is unreachable the player shows an error instead of faking playback.
- Titles/artists are fictional; all tracks are SoundHelix instrumentals.
- Track durations in lists appear after a track's metadata has loaded (shown as `--:--` before).
- Queue is not drag-reorderable; data is per-browser (localStorage), no accounts or backend.
