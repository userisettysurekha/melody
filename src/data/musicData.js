// Mock catalogue. Artists, albums and titles are fictional.
// Audio: SoundHelix example tracks (https://www.soundhelix.com/examples/) - royalty-free
// demo music provided for testing. Cover art is generated locally as SVG (no remote images).

export function makeCover(label, hue) {
  const h2 = (hue + 50) % 360;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="hsl(${hue},70%,45%)"/><stop offset="1" stop-color="hsl(${h2},70%,22%)"/>` +
    `</linearGradient></defs><rect width="300" height="300" fill="url(#g)"/>` +
    `<circle cx="225" cy="75" r="70" fill="hsl(${h2},80%,60%)" opacity=".35"/>` +
    `<circle cx="60" cy="245" r="95" fill="hsl(${hue},80%,70%)" opacity=".18"/>` +
    `<text x="22" y="272" font-family="Arial,sans-serif" font-size="28" font-weight="700" fill="#fff" fill-opacity=".92">${label}</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const audio = (n) => `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;

const raw = [
  ['t1', 'Midnight Skyline', 'Aurora Vale', 'Neon Hours', 210, 1, 4120],
  ['t2', 'Golden Hour Drift', 'Aurora Vale', 'Neon Hours', 210, 2, 3380],
  ['t3', 'Paper Lanterns', 'Kito Rain', 'Soft Static', 170, 3, 5210],
  ['t4', 'Velvet Rain', 'Kito Rain', 'Soft Static', 170, 4, 2890],
  ['t5', 'Run the Light', 'The Parallax', 'Overdrive', 10, 5, 6100],
  ['t6', 'Pulse City', 'The Parallax', 'Overdrive', 10, 6, 4750],
  ['t7', 'Gravity Well', 'Nova Kane', 'Orbit', 280, 7, 3920],
  ['t8', 'Tidal Memory', 'Nova Kane', 'Orbit', 280, 8, 2210],
  ['t9', 'Cedar and Smoke', 'Willow Hart', 'Porch Songs', 35, 9, 3560],
  ['t10', 'Morning Dew', 'Willow Hart', 'Porch Songs', 35, 10, 2980],
  ['t11', 'Static Bloom', 'Echo Fields', 'Signal', 330, 11, 4410],
  ['t12', 'Low Tide Letters', 'Echo Fields', 'Signal', 330, 12, 1980],
  ['t13', 'Afterglow Avenue', 'Luna Marsh', 'Late Bus', 120, 13, 5320],
  ['t14', 'Kite Season', 'Luna Marsh', 'Late Bus', 120, 14, 3110],
  ['t15', 'Copper Skies', 'Dune Atlas', 'Mirage', 20, 15, 2640],
  ['t16', 'Slow Burn Satellite', 'Dune Atlas', 'Mirage', 20, 16, 1870],
];

export const tracks = raw.map(([id, title, artist, album, hue, n, plays]) => ({
  id,
  title,
  artist,
  album,
  plays,
  cover: makeCover(album, hue),
  audioUrl: audio(n),
  // duration is read from the audio file's metadata at runtime (see PlaybackContext)
}));

export const tracksById = Object.fromEntries(tracks.map((t) => [t.id, t]));

export const playlists = [
  { id: 'chill-evenings', name: 'Chill Evenings', description: 'Soft synths and slow tempos for winding down.', hue: 200, trackIds: ['t1', 't2', 't3', 't4', 't13', 't14'] },
  { id: 'focus-flow', name: 'Focus Flow', description: 'Steady, distraction-free music for deep work.', hue: 150, trackIds: ['t3', 't4', 't11', 't12', 't15', 't16'] },
  { id: 'workout-fuel', name: 'Workout Fuel', description: 'High-energy beats to keep you moving.', hue: 10, trackIds: ['t5', 't6', 't7', 't8', 't11'] },
  { id: 'night-drive', name: 'Night Drive', description: 'City lights, open roads and glowing dashboards.', hue: 280, trackIds: ['t1', 't2', 't7', 't13', 't15', 't16'] },
  { id: 'acoustic-mornings', name: 'Acoustic Mornings', description: 'Warm, gentle songs for a slow start.', hue: 35, trackIds: ['t9', 't10', 't14', 't3', 't12'] },
].map((p) => ({ ...p, cover: makeCover(p.name, p.hue) }));

export const getPlaylistTracks = (playlist) =>
  playlist.trackIds.map((id) => tracksById[id]).filter(Boolean);
