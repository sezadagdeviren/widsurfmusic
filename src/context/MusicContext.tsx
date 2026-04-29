import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

interface MusicContextType {
  tracks: MusicTrack[];
  currentTrackIndex: number;
  playbackState: { state: State | undefined };
  position: number;
  duration: number;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  isScanning: boolean;
  alert: AlertState | null;
  setAlert: (alert: AlertState | null) => void;
  favorites: string[];
  favoriteTracks: MusicTrack[];
  playlists: Playlist[];
  togglePlayback: () => Promise<void>;
  playTrack: (index: number) => Promise<void>;
  playPlaylist: (playlistTracks: MusicTrack[], index: number) => Promise<void>;
  skipToNext: () => Promise<void>;
  skipToPrevious: () => Promise<void>;
  toggleRepeatMode: () => Promise<void>;
  toggleShuffle: () => void;
  scanMusicFiles: (silent?: boolean) => Promise<void>;
  addToFavorites: (track: MusicTrack) => Promise<void>;
  removeFromFavorites: (trackId: string) => Promise<void>;
  addToPlaylist: (playlistId: string, track: MusicTrack) => Promise<void>;
  createPlaylist: (name: string, color: string) => Promise<boolean>;
  deletePlaylist: (id: string) => Promise<void>;
  renamePlaylist: (id: string, newName: string) => Promise<void>; // Yeni eklendi
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const FAVORITES_KEY = '@music_player_favorites';
const PLAYLISTS_KEY = '@music_player_playlists';
const LAST_TRACKS_KEY = '@music_player_last_tracks';
const LAST_INDEX_KEY = '@music_player_last_index';

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [repeatMode, setRepeatMode] = useState(RepeatMode.Off);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [alert, setAlert] = useState<AlertState | null>(null);

  const playbackState = usePlaybackState() as { state: State | undefined };
  const { position, duration } = useProgress();

  useEffect(() => {
    const init = async () => {
      await loadInitialData();
      scanMusicFiles(true);
    };
    init();
  }, []);

  const loadInitialData = async () => {
    try {
      const [favs, lists, lastTracks, lastIndex] = await Promise.all([
        AsyncStorage.getItem(FAVORITES_KEY),
        AsyncStorage.getItem(PLAYLISTS_KEY),
        AsyncStorage.getItem(LAST_TRACKS_KEY),
        AsyncStorage.getItem(LAST_INDEX_KEY)
      ]);

      if (favs) {
        const parsedFavs = JSON.parse(favs);
        setFavorites(Array.isArray(parsedFavs) ? parsedFavs.map((t: any) => t.id || t) : []);
      }
      if (lists) setPlaylists(JSON.parse(lists));

      const queue = await TrackPlayer.getQueue();
      if (queue.length === 0 && lastTracks) {
        const parsedTracks = JSON.parse(lastTracks);
        setTracks(parsedTracks);
        await TrackPlayer.add(parsedTracks);
        if (lastIndex) {
          const index = parseInt(lastIndex);
          setCurrentTrackIndex(index);
          await TrackPlayer.skip(index);
        }
      } else if (queue.length > 0) {
        const currentIdx = await TrackPlayer.getCurrentTrack();
        setTracks(queue as MusicTrack[]);
        setCurrentTrackIndex(currentIdx ?? 0);
      }
    } catch (e) {
      console.error('Persistence load error:', e);
    }
  };

  useTrackPlayerEvents([Event.PlaybackTrackChanged], async (event) => {
    if (event.type === Event.PlaybackTrackChanged && event.nextTrack !== undefined) {
      const index = event.nextTrack;
      setCurrentTrackIndex(index);
      await AsyncStorage.setItem(LAST_INDEX_KEY, index.toString());
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
      const queue = await TrackPlayer.getQueue();
      if (queue.length !== tracks.length) {
        await TrackPlayer.reset();
        await TrackPlayer.add(tracks);
      }
      await TrackPlayer.skip(index);
      await TrackPlayer.play();
      setCurrentTrackIndex(index);
      await AsyncStorage.setItem(LAST_INDEX_KEY, index.toString());
    } catch (e) {
      console.error('Play error:', e);
    }
  };

  const playPlaylist = async (playlistTracks: MusicTrack[], index: number) => {
    try {
      await TrackPlayer.reset();
      await TrackPlayer.add(playlistTracks);
      await TrackPlayer.skip(index);
      await TrackPlayer.play();
    } catch (e) {
      console.error('Play playlist error:', e);
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

  const scanMusicFiles = async (silent: boolean = false) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;
    
    if (!silent) setIsScanning(true);
    
    try {
      const folders = [`${RNFS.ExternalStorageDirectoryPath}/Music`, `${RNFS.ExternalStorageDirectoryPath}/Download`, `${RNFS.ExternalStorageDirectoryPath}/DCIM` ];
      let foundTracks: MusicTrack[] = [];
      for (const folder of folders) {
        if (await RNFS.exists(folder)) {
          const files = await RNFS.readDir(folder);
          const audioFiles = files.filter(f => f.isFile() && /\.(mp3|m4a|wav)$/i.test(f.name));
          const songs = await Promise.all(audioFiles.map(async (file, i) => {
            const meta = await extractArtwork(file.path);
            return { id: `scan-${file.name}-${Date.now()}-${i}`, url: `file://${file.path}`, title: meta.title || file.name.replace(/\.[^/.]+$/, ""), artist: meta.artist || 'Local Scan', artwork: meta.artwork } as MusicTrack;
          }));
          foundTracks = [...foundTracks, ...songs];
        }
      }
      
      if (foundTracks.length > 0) {
        const trackMap = new Map();
        tracks.forEach(t => { const key = `${t.title.toLowerCase().trim()}|${t.artist.toLowerCase().trim()}`; if (!trackMap.has(key)) trackMap.set(key, t); });
        foundTracks.forEach(t => { const key = `${t.title.toLowerCase().trim()}|${t.artist.toLowerCase().trim()}`; if (!trackMap.has(key)) trackMap.set(key, t); });
        const uniqueTracks = Array.from(trackMap.values());
        
        if (uniqueTracks.length > tracks.length) {
          await TrackPlayer.reset();
          await TrackPlayer.add(uniqueTracks);
          setTracks(uniqueTracks);
          await AsyncStorage.setItem(LAST_TRACKS_KEY, JSON.stringify(uniqueTracks));
          if (!silent) {
            setAlert({ visible: true, title: 'Success', message: `${uniqueTracks.length - tracks.length} new tracks found`, type: 'success' });
          }
        } else if (!silent) {
          setAlert({ visible: true, title: 'Info', message: 'No new music found', type: 'info' });
        }
      }
    } catch (e) {
      if (!silent) setAlert({ visible: true, title: 'Error', message: 'Scan failed', type: 'error' });
    } finally {
      if (!silent) setIsScanning(false);
    }
  };

  const removeFromFavorites = async (trackId: string) => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        let favs: MusicTrack[] = JSON.parse(stored);
        favs = favs.filter(t => t.id !== trackId);
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
        setFavorites(favs.map(f => f.id));
      }
    } catch (e) {
      console.error('Remove favorite error:', e);
    }
  };

  const addToFavorites = async (track: MusicTrack) => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      let favs: MusicTrack[] = stored ? JSON.parse(stored) : [];
      if (!favs.some(f => f.id === track.id)) {
        favs.push(track);
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
        setFavorites(favs.map(f => f.id));
      } else {
        await removeFromFavorites(track.id);
      }
    } catch (e) {
      console.error('Add favorite error:', e);
    }
  };

  const addToPlaylist = async (playlistId: string, track: MusicTrack) => {
    try {
      const updated = playlists.map(p => {
        if (p.id === playlistId && !p.tracks.some(t => t.id === track.id)) {
          return { ...p, tracks: [...p.tracks, track] };
        }
        return p;
      });
      setPlaylists(updated);
      await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Add to playlist error:', e);
    }
  };

  const createPlaylist = async (name: string, color: string) => {
    try {
      const newPlaylist: Playlist = { id: `playlist-${Date.now()}`, name: name.trim(), tracks: [], color: color };
      const updated = [...playlists, newPlaylist];
      setPlaylists(updated);
      await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));
      return true;
    } catch (e) {
      return false;
    }
  };

  const renamePlaylist = async (id: string, newName: string) => {
    try {
      const updated = playlists.map(p => p.id === id ? { ...p, name: newName.trim() } : p);
      setPlaylists(updated);
      await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Rename playlist error:', e);
    }
  };

  const deletePlaylist = async (id: string) => {
    try {
      const updated = playlists.filter(p => p.id !== id);
      setPlaylists(updated);
      await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Delete playlist error:', e);
    }
  };

  const favoriteTracks = tracks.filter(t => favorites.includes(t.id));

  const value = {
    tracks, currentTrackIndex, playbackState, position, duration, repeatMode, isShuffle, isScanning, alert, setAlert, favorites, favoriteTracks, playlists, togglePlayback, playTrack, playPlaylist, skipToNext, skipToPrevious, toggleRepeatMode, toggleShuffle, scanMusicFiles, removeFromFavorites, addToFavorites, addToPlaylist, createPlaylist, renamePlaylist, deletePlaylist
  };

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
};

export const useMusicContext = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusicContext must be used within a MusicProvider');
  }
  return context;
};
