import { useState, useEffect } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import TrackPlayer, { 
  usePlaybackState, 
  useProgress, 
  useTrackPlayerEvents, 
  Event, 
  State, 
  RepeatMode 
} from 'react-native-track-player';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { MusicTrack, Playlist, AlertState } from '../types/music';
import { extractArtwork } from '../utils/musicUtils';

const FAVORITES_KEY = '@music_player_favorites';
const PLAYLISTS_KEY = '@music_player_playlists';

export const useMusicPlayer = () => {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [repeatMode, setRepeatMode] = useState(RepeatMode.Off);
  const [isShuffle, setIsShuffle] = useState(false);
  const [alert, setAlert] = useState<AlertState | null>(null);

  const playbackState = usePlaybackState();
  const { position, duration } = useProgress();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [favs, lists] = await Promise.all([
        AsyncStorage.getItem(FAVORITES_KEY),
        AsyncStorage.getItem(PLAYLISTS_KEY)
      ]);
      if (favs) {
        const parsedFavs = JSON.parse(favs);
        setFavorites(Array.isArray(parsedFavs) ? parsedFavs.map((t: any) => t.id || t) : []);
      }
      if (lists) setPlaylists(JSON.parse(lists));
    } catch (e) {
      console.error('Persistence error:', e);
    }
  };

  useTrackPlayerEvents([Event.PlaybackTrackChanged], async (event) => {
    if (event.type === Event.PlaybackTrackChanged) {
      const index = await TrackPlayer.getCurrentTrack();
      setCurrentTrackIndex(index ?? 0);
    }
  });

  const requestPermissions = async () => {
    if (Platform.OS !== 'android') return true;
    const permission = Platform.Version >= 33 
      ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO 
      : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
    const granted = await PermissionsAndroid.request(permission);
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const togglePlayback = async () => {
    const state = playbackState.state;
    if (state === State.Playing) await TrackPlayer.pause();
    else await TrackPlayer.play();
  };

  const playTrack = async (index: number) => {
    try {
      await TrackPlayer.skip(index);
      await TrackPlayer.play();
      setCurrentTrackIndex(index);
    } catch (e) {
      console.error('Play error:', e);
    }
  };

  const skipToNext = () => TrackPlayer.skipToNext();
  const skipToPrevious = () => TrackPlayer.skipToPrevious();

  const toggleRepeatMode = async () => {
    const modes = [RepeatMode.Off, RepeatMode.Track, RepeatMode.Queue];
    const nextIndex = (modes.indexOf(repeatMode) + 1) % modes.length;
    const nextMode = modes[nextIndex];
    await TrackPlayer.setRepeatMode(nextMode);
    setRepeatMode(nextMode);
  };

  const toggleShuffle = () => setIsShuffle(!isShuffle);

  const scanMusicFiles = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const folders = [
        `${RNFS.ExternalStorageDirectoryPath}/Music`,
        `${RNFS.ExternalStorageDirectoryPath}/Download`,
        `${RNFS.ExternalStorageDirectoryPath}/DCIM`,
      ];
      
      let foundTracks: MusicTrack[] = [];
      for (const folder of folders) {
        if (await RNFS.exists(folder)) {
          const files = await RNFS.readDir(folder);
          const audioFiles = files.filter(f => f.isFile() && /\.(mp3|m4a|wav)$/i.test(f.name));
          
          const songs = await Promise.all(audioFiles.map(async (file, i) => {
            const meta = await extractArtwork(file.path);
            return {
              id: `scan-${file.name}-${Date.now()}-${i}`,
              url: `file://${file.path}`,
              title: meta.title || file.name.replace(/\.[^/.]+$/, ""),
              artist: meta.artist || 'Local Scan',
              artwork: meta.artwork
            } as MusicTrack;
          }));
          foundTracks = [...foundTracks, ...songs];
        }
      }

      if (foundTracks.length > 0) {
        // High-performance deduplication using a Map (O(N) vs O(N^2))
        const trackMap = new Map();
        
        // Add existing tracks to map first
        tracks.forEach(t => {
          const key = `${t.title.toLowerCase().trim()}|${t.artist.toLowerCase().trim()}`;
          if (!trackMap.has(key)) trackMap.set(key, t);
        });

        // Add new tracks only if they don't exist
        foundTracks.forEach(t => {
          const key = `${t.title.toLowerCase().trim()}|${t.artist.toLowerCase().trim()}`;
          if (!trackMap.has(key)) trackMap.set(key, t);
        });

        const uniqueTracks = Array.from(trackMap.values());

        await TrackPlayer.reset();
        await TrackPlayer.add(uniqueTracks);
        setTracks(uniqueTracks);
        setAlert({ visible: true, title: 'Success', message: `${foundTracks.length} new tracks processed`, type: 'success' });
      } else {
        setAlert({ visible: true, title: 'Info', message: 'No music files found', type: 'info' });
      }
    } catch (e) {
      console.error('Scan error:', e);
      setAlert({ visible: true, title: 'Error', message: 'Scan failed', type: 'error' });
    }
  };

  const removeFromFavorites = async (trackId: string) => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        let favs: any[] = JSON.parse(stored);
        favs = favs.filter(t => (t.id || t) !== trackId);
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
        setFavorites(favs.map(t => t.id || t));
        setAlert({ visible: true, title: 'Success', message: 'Removed from favorites', type: 'success' });
      }
    } catch (e) {
      setAlert({ visible: true, title: 'Error', message: 'Failed to remove', type: 'error' });
    }
  };

  const createPlaylist = async (name: string, color: string) => {
    try {
      const newPlaylist: Playlist = {
        id: `playlist-${Date.now()}`,
        name: name.trim(),
        tracks: [],
        color: color,
      };
      const updated = [...playlists, newPlaylist];
      setPlaylists(updated);
      await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));
      setAlert({ visible: true, title: 'Success', message: 'Playlist created', type: 'success' });
      return true;
    } catch (e) {
      setAlert({ visible: true, title: 'Error', message: 'Failed to create', type: 'error' });
      return false;
    }
  };

  const deletePlaylist = async (id: string) => {
    try {
      const updated = playlists.filter(p => p.id !== id);
      setPlaylists(updated);
      await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));
      setAlert({ visible: true, title: 'Success', message: 'Playlist deleted', type: 'success' });
    } catch (e) {
      setAlert({ visible: true, title: 'Error', message: 'Failed to delete', type: 'error' });
    }
  };

  const favoriteTracks = tracks.filter(t => favorites.includes(t.id));

  return {
    tracks,
    currentTrackIndex,
    playbackState,
    position,
    duration,
    repeatMode,
    isShuffle,
    alert,
    setAlert,
    favorites,
    favoriteTracks,
    playlists,
    togglePlayback,
    playTrack,
    skipToNext,
    skipToPrevious,
    toggleRepeatMode,
    toggleShuffle,
    scanMusicFiles,
    removeFromFavorites,
    createPlaylist,
    deletePlaylist
  };
};
