import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Image, Platform, PermissionsAndroid, SafeAreaView } from 'react-native';
const jsmediatags = require('jsmediatags/dist/jsmediatags.min.js');
import { Buffer } from 'buffer';
import DocumentPicker, {
  DocumentPickerResponse,
  types,
} from 'react-native-document-picker';
import TrackPlayer from 'react-native-track-player';
import PlayerCard from '../components/PlayerCard';
import Controls from '../components/Controls';
import ProgressBar from '../components/ProgressBar';
import AlertModal from '../components/AlertModal';
import SearchBar from '../components/SearchBar';
import { usePlaybackState, useProgress, useTrackPlayerEvents, Event, State, RepeatMode } from 'react-native-track-player';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInUp, FadeInRight, FadeInDown, SlideInUp, Layout } from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent, GestureHandlerRootView } from 'react-native-gesture-handler';

// Polyfill Buffer
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

const Icon = MaterialIcons as any;

const FAVORITES_KEY = '@music_player_favorites';
const PLAYLISTS_KEY = '@music_player_playlists';

interface SongsScreenProps {
  tracks: any[];
  setTracks: (tracks: any[]) => void;
  currentTrackIndex: number;
  setCurrentTrackIndex: (index: number) => void;
}

export default function SongsScreen({ tracks, setTracks, currentTrackIndex, setCurrentTrackIndex }: SongsScreenProps) {
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [alertModal, setAlertModal] = useState({ visible: false, title: '', message: '', type: 'info' as 'success' | 'error' | 'info' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const playbackState = usePlaybackState();
  const { position, duration } = useProgress();
  const [repeatMode, setRepeatMode] = useState(RepeatMode.Off);
  const [isShuffle, setIsShuffle] = useState(false);

  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
          {
            title: 'Music Permission',
            message: 'App needs access to your music files.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to your storage to read music files.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const extractArtwork = async (filePath: string): Promise<{ artwork?: string, title?: string, artist?: string }> => {
    try {
      if (!jsmediatags || !jsmediatags.read) {
        return {};
      }

      const cleanPath = filePath.startsWith('file://') ? filePath.replace('file://', '') : filePath;
      const exists = await RNFS.exists(cleanPath);
      
      if (!exists) {
        return {};
      }

      const fileData = await RNFS.readFile(cleanPath, 'base64');
      const buffer = Buffer.from(fileData, 'base64');

      return new Promise((resolve) => {
        try {
          jsmediatags.read(buffer, {
            onSuccess: (tag: any) => {
              const { image, picture, title, artist } = tag.tags;
              const artworkData = image || picture;
              let artworkBase64: string | undefined = undefined;
              
              if (artworkData) {
                console.log(`--- Artwork Found for ${cleanPath.split('/').pop()} ---`);
                const { format, data } = artworkData;
                const imageData = new Uint8Array(data);
                artworkBase64 = `data:${format};base64,${Buffer.from(imageData).toString('base64')}`;
              }

              resolve({
                artwork: artworkBase64,
                title: title,
                artist: artist
              });
            },
            onError: (error: any) => {
              console.log('jsmediatags error:', cleanPath, error.type);
              resolve({});
            },
          });
        } catch (innerError) {
          console.log('jsmediatags inner error:', innerError);
          resolve({});
        }
      });
    } catch (err) {
      return {};
    }
  };

  useEffect(() => {
    if (tracks[currentTrackIndex]) {
      console.log('--- Current Track ---');
      console.log('Title:', tracks[currentTrackIndex].title);
      console.log('Artist:', tracks[currentTrackIndex].artist);
      console.log('Artwork:', tracks[currentTrackIndex].artwork || 'No artwork');
      console.log('---------------------');
    }
  }, [currentTrackIndex, tracks]);

  useEffect(() => {
    loadFavorites();
    loadPlaylists();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
      if (storedFavorites) {
        const favoritesArray = JSON.parse(storedFavorites);
        setFavorites(favoritesArray.map((track: any) => track.id));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const loadPlaylists = async () => {
    try {
      const storedPlaylists = await AsyncStorage.getItem(PLAYLISTS_KEY);
      if (storedPlaylists) {
        setPlaylists(JSON.parse(storedPlaylists));
      }
    } catch (error) {
      console.error('Error loading playlists:', error);
    }
  };

  useTrackPlayerEvents([Event.PlaybackTrackChanged], async (event) => {
    if (event.type === Event.PlaybackTrackChanged) {
      const index = await TrackPlayer.getCurrentTrack();
      setCurrentTrackIndex(index ?? 0);
    }
  });

  const togglePlayback = async () => {
    if (playbackState.state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const skipToNext = async () => {
    await TrackPlayer.skipToNext();
  };

  const skipToPrevious = async () => {
    await TrackPlayer.skipToPrevious();
  };

  const playTrack = async (index: number) => {
    await TrackPlayer.skip(index);
    setCurrentTrackIndex(index);
  };

  const toggleRepeatMode = async () => {
    let nextMode = RepeatMode.Off;
    if (repeatMode === RepeatMode.Off) nextMode = RepeatMode.Track;
    else if (repeatMode === RepeatMode.Track) nextMode = RepeatMode.Queue;
    
    await TrackPlayer.setRepeatMode(nextMode);
    setRepeatMode(nextMode);
  };

  const toggleShuffle = async () => {
    const newShuffleState = !isShuffle;
    setIsShuffle(newShuffleState);
  };

  const handleSeek = async (value: number) => {
    await TrackPlayer.seekTo(value);
  };

  const getArtworkUri = (artwork?: string) => {
    if (!artwork) return undefined;
    if (artwork.startsWith('http') || artwork.startsWith('file://') || artwork.startsWith('content://') || artwork.startsWith('data:')) {
      return artwork;
    }
    return `file://${artwork}`;
  };

  const scanMusicFiles = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      setAlertModal({ visible: true, title: 'Permission Denied', message: 'Cannot access files without permission.', type: 'error' });
      return;
    }

    try {
      const foldersToScan = [
        `${RNFS.ExternalStorageDirectoryPath}/Music`,
        `${RNFS.ExternalStorageDirectoryPath}/Download`,
        `${RNFS.ExternalStorageDirectoryPath}/DCIM`,
      ];

      console.log('Scanning folders:', foldersToScan);
      let allSongs: any[] = [];

      for (const folder of foldersToScan) {
        try {
          const exists = await RNFS.exists(folder);
          console.log(`Folder ${folder} exists:`, exists);
          if (!exists) continue;

          const files = await RNFS.readDir(folder);
          console.log(`Found ${files.length} items in ${folder}`);
          
          const audioFiles = files.filter(f => 
            f.isFile() && 
            (f.name.endsWith('.mp3') || f.name.endsWith('.m4a') || f.name.endsWith('.wav'))
          );

          console.log(`Found ${audioFiles.length} audio files in ${folder}`);

          const folderSongs = await Promise.all(audioFiles.map(async (file, index) => {
            try {
              const metadata = await extractArtwork(file.path);
              return {
                id: `scan-${file.name}-${Date.now()}-${index}`,
                url: `file://${file.path}`,
                title: metadata.title || file.name.replace(/\.[^/.]+$/, ""),
                artist: metadata.artist || 'Local Scan',
                artwork: metadata.artwork,
              };
            } catch (songErr) {
              console.log(`Error processing song ${file.name}:`, songErr);
              return {
                id: `scan-${file.name}-${Date.now()}-${index}`,
                url: `file://${file.path}`,
                title: file.name.replace(/\.[^/.]+$/, ""),
                artist: 'Local Scan',
                artwork: undefined,
              };
            }
          }));

          allSongs = [...allSongs, ...folderSongs];
        } catch (e) {
          console.log(`Error scanning folder ${folder}:`, e);
        }
      }

      if (allSongs.length > 0) {
        // Filter out duplicates (based on title and artist)
        const uniqueSongs = allSongs.filter((song, index, self) =>
          index === self.findIndex((t) => (
            t.title === song.title && t.artist === song.artist
          ))
        );

        // Also check against existing tracks
        const newUniqueSongs = uniqueSongs.filter(song => 
          !tracks.some(t => t.title === song.title && t.artist === song.artist)
        );

        if (newUniqueSongs.length > 0) {
          const updatedTracks = [...tracks, ...newUniqueSongs];
          await TrackPlayer.reset();
          await TrackPlayer.add(updatedTracks);
          setTracks(updatedTracks);
          setCurrentTrackIndex(0);
          setAlertModal({ visible: true, title: 'Success', message: `${newUniqueSongs.length} new track(s) added`, type: 'success' });
        } else {
          setAlertModal({ visible: true, title: 'Info', message: 'No new songs found', type: 'info' });
        }
      } else {
        setAlertModal({ visible: true, title: 'Info', message: 'No music files found in DCIM, Downloads or Music folders', type: 'info' });
      }
    } catch (error) {
      console.error('Error scanning music files:', error);
      setAlertModal({ visible: true, title: 'Error', message: 'Failed to scan folders', type: 'error' });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addToFavorites = async (track: any) => {
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
      let favoritesArray: any[] = storedFavorites ? JSON.parse(storedFavorites) : [];
      
      const exists = favoritesArray.some((fav: any) => fav.id === track.id);
      if (exists) {
        setAlertModal({ visible: true, title: 'Info', message: 'Already in favorites', type: 'info' });
        return;
      }
      
      favoritesArray.push(track);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favoritesArray));
      setFavorites([...favorites, track.id]);
      setAlertModal({ visible: true, title: 'Success', message: 'Added to favorites', type: 'success' });
    } catch (error) {
      console.error('Error adding to favorites:', error);
      setAlertModal({ visible: true, title: 'Error', message: 'Failed to add to favorites', type: 'error' });
    }
  };

  const removeFromFavorites = async (trackId: string) => {
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
      if (storedFavorites) {
        let favoritesArray: any[] = JSON.parse(storedFavorites);
        favoritesArray = favoritesArray.filter((track: any) => track.id !== trackId);
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favoritesArray));
        setFavorites(favorites.filter(id => id !== trackId));
        setAlertModal({ visible: true, title: 'Success', message: 'Removed from favorites', type: 'success' });
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      setAlertModal({ visible: true, title: 'Error', message: 'Failed to remove from favorites', type: 'error' });
    }
  };

  const isFavorite = (trackId: string) => {
    return favorites.includes(trackId);
  };

  const openPlaylistModal = (track: any) => {
    setSelectedTrack(track);
    setShowPlaylistModal(true);
  };

  const addToPlaylist = async (playlistId: string) => {
    try {
      const playlistIndex = playlists.findIndex(p => p.id === playlistId);
      if (playlistIndex === -1) return;

      const updatedPlaylists = [...playlists];
      const trackExists = updatedPlaylists[playlistIndex].tracks.some((t: any) => t.id === selectedTrack.id);
      
      if (trackExists) {
        setAlertModal({ visible: true, title: 'Info', message: 'Song already in playlist', type: 'info' });
        setShowPlaylistModal(false);
        return;
      }

      updatedPlaylists[playlistIndex].tracks.push(selectedTrack);
      setPlaylists(updatedPlaylists);
      await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updatedPlaylists));
      
      setAlertModal({ visible: true, title: 'Success', message: 'Added to playlist', type: 'success' });
      setShowPlaylistModal(false);
    } catch (error) {
      console.error('Error adding to playlist:', error);
      setAlertModal({ visible: true, title: 'Error', message: 'Failed to add to playlist', type: 'error' });
    }
  };

  const filteredTracks = tracks.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <LinearGradient
      colors={['#191414', '#121212']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="flex-1"
    >
      <Animated.FlatList
        data={filteredTracks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        itemLayoutAnimation={Layout.springify()}
        ListHeaderComponent={
          <View className="p-6 pb-2">
            <Animated.View entering={FadeInDown.duration(600)}>
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search songs..."
                onClear={() => setSearchQuery('')}
              />
            </Animated.View>
            
            <View className="flex-row items-center justify-between mb-4">
              <Animated.View entering={FadeInRight.delay(200)} className="flex-1">
                <TouchableOpacity 
                  className="bg-spotify-light p-4 rounded-2xl items-center shadow-lg flex-row justify-center"
                  onPress={scanMusicFiles}
                >
                  <Icon name="sync" size={20} color="white" />
                  <Text className="text-white text-sm font-bold ml-2">Scan Device</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center justify-center mt-20 p-10">
            <Icon name="music-off" size={64} color="#282828" />
            <Text className="text-spotify-gray text-center mt-4 text-base font-medium">
              Your library is empty.
            </Text>
            <Text className="text-spotify-gray/60 text-center mt-2 text-sm">
              Add some music to start listening!
            </Text>
          </View>
        }
        renderItem={({ item: track, index }) => {
          const originalIndex = tracks.findIndex(t => t.id === track.id);
          return (
            <Animated.View
              entering={FadeInRight.delay(index * 50)}
              layout={Layout.springify()}
              className="px-6 mb-3"
            >
              <TouchableOpacity
                className={`flex-row items-center p-3 rounded-2xl ${currentTrackIndex === originalIndex ? 'bg-spotify-light/60 border border-spotify-green/30' : 'bg-spotify-dark/40'}`}
                onPress={() => playTrack(originalIndex)}
              >
                <View className="w-14 h-14 bg-spotify-lighter rounded-xl mr-4 items-center justify-center overflow-hidden shadow-sm">
                  {track.artwork ? (
                    <Image source={{ uri: getArtworkUri(track.artwork) }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <Icon name="music-note" size={28} color="#404040" />
                  )}
                </View>
                
                <View className="flex-1">
                  <Text className={`text-base font-bold ${currentTrackIndex === originalIndex ? 'text-spotify-green' : 'text-white'}`} numberOfLines={1}>
                    {track.title}
                  </Text>
                  <Text className="text-spotify-gray text-xs font-medium mt-0.5" numberOfLines={1}>
                    {track.artist}
                  </Text>
                </View>
                
                <View className="flex-row items-center">
                  <TouchableOpacity 
                    onPress={(e) => { e.stopPropagation(); openPlaylistModal(track); }} 
                    className="p-2"
                  >
                    <Icon name="playlist-add" size={22} color="#B3B3B3" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={(e) => { e.stopPropagation(); isFavorite(track.id) ? removeFromFavorites(track.id) : addToFavorites(track); }}
                    className="p-2"
                  >
                    <Icon 
                      name={isFavorite(track.id) ? 'favorite' : 'favorite-border'} 
                      size={22} 
                      color={isFavorite(track.id) ? '#1DB954' : '#B3B3B3'} 
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        }}
      />

      {/* Miniplayer */}
      {tracks.length > 0 && (
        <Animated.View entering={SlideInUp.duration(500)}>
          <TouchableOpacity 
            className="absolute bottom-0 left-0 right-0 bg-spotify-dark/95 border-t border-spotify-light p-4 flex-row items-center backdrop-blur-sm"
            onPress={() => setShowFullPlayer(true)}
          >
          <View className="w-12 h-12 bg-spotify-lighter rounded-lg mr-4 items-center justify-center overflow-hidden">
            {tracks[currentTrackIndex]?.artwork ? (
              <Image source={{ uri: getArtworkUri(tracks[currentTrackIndex].artwork) }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <Icon name="music-note" size={24} color="#B3B3B3" />
            )}
          </View>
          
          <View className="flex-1">
            <Text className="text-white text-sm font-medium" numberOfLines={1}>
              {tracks[currentTrackIndex]?.title}
            </Text>
            <Text className="text-spotify-gray text-xs" numberOfLines={1}>
              {tracks[currentTrackIndex]?.artist}
            </Text>
          </View>
          
          <View className="flex-row items-center space-x-2">
            <TouchableOpacity onPress={(e) => { e.stopPropagation(); skipToPrevious(); }} className="p-1">
              <Icon name="skip-previous" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={(e) => { e.stopPropagation(); togglePlayback(); }} className="p-1">
              <Icon 
                name={playbackState.state === State.Playing ? 'pause' : 'play-arrow'} 
                size={36} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={(e) => { e.stopPropagation(); skipToNext(); }} className="p-1">
              <Icon name="skip-next" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        </Animated.View>
      )}

      {/* Full Player Modal */}
      <Modal
        visible={showFullPlayer}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFullPlayer(false)}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View className="flex-1 bg-spotify-black">
            <LinearGradient
              colors={['#282828', '#121212']}
              className="flex-1 px-6"
            >
              <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="flex-row justify-between items-center h-16">
                  <TouchableOpacity onPress={() => setShowFullPlayer(false)} className="p-2">
                    <Icon name="keyboard-arrow-down" size={32} color="white" />
                  </TouchableOpacity>
                  <Text className="text-white text-xs font-bold tracking-[2px] uppercase opacity-60">Now Playing</Text>
                  <TouchableOpacity className="p-2">
                    <Icon name="more-vert" size={24} color="white" />
                  </TouchableOpacity>
                </View>

                {/* Artwork Section (Flexible) */}
                <View className="flex-[3] justify-center items-center py-4">
                  <PlayerCard 
                    title={tracks[currentTrackIndex]?.title || ''}
                    artist={tracks[currentTrackIndex]?.artist || ''}
                    artwork={tracks[currentTrackIndex]?.artwork ? getArtworkUri(tracks[currentTrackIndex].artwork) : undefined}
                  />
                </View>

                {/* Interaction Section (Bottom) */}
                <View className="flex-[2] justify-end pb-10">
                  {/* Progress Bar */}
                  <View className="w-full mb-8">
                    <ProgressBar />
                  </View>

                  {/* Main Controls Row */}
                  <View className="flex-row justify-between items-center w-full px-2">
                    <TouchableOpacity onPress={toggleShuffle} className="w-10 items-center">
                      <Icon name="shuffle" size={24} color={isShuffle ? "#1DB954" : "white"} style={{ opacity: isShuffle ? 1 : 0.6 }} />
                    </TouchableOpacity>
                    
                    <View className="flex-1 items-center">
                      <Controls 
                        isPlaying={playbackState.state === State.Playing}
                        onPlayPause={togglePlayback}
                        onNext={skipToNext}
                        onPrevious={skipToPrevious}
                      />
                    </View>

                    <TouchableOpacity onPress={toggleRepeatMode} className="w-10 items-center">
                      <Icon
                        name={repeatMode === RepeatMode.Track ? "repeat-one" : "repeat"}
                        size={24}
                        color={repeatMode !== RepeatMode.Off ? "#1DB954" : "white"}
                        style={{ opacity: repeatMode !== RepeatMode.Off ? 1 : 0.6 }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </SafeAreaView>
            </LinearGradient>
          </View>
        </GestureHandlerRootView>
      </Modal>

      <AlertModal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ ...alertModal, visible: false })}
      />

      {/* Playlist Selection Modal */}
      <Modal
        visible={showPlaylistModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPlaylistModal(false)}
      >
        <View className="flex-1 bg-black/80 items-center justify-center p-6">
          <LinearGradient
            colors={['#282828', '#191414']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            className="bg-spotify-dark p-6 rounded-2xl w-full max-h-96 shadow-2xl"
          >
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-white text-2xl font-bold">Add to Playlist</Text>
              <TouchableOpacity onPress={() => setShowPlaylistModal(false)}>
                <Icon name="close" size={28} color="#B3B3B3" />
              </TouchableOpacity>
            </View>
            
            {playlists.length > 0 ? (
              <ScrollView className="flex-1">
                <View className="space-y-3">
                  {playlists.map((playlist) => (
                    <TouchableOpacity
                      key={playlist.id}
                      className="flex-row items-center p-4 rounded-xl bg-spotify-lighter"
                      onPress={() => addToPlaylist(playlist.id)}
                    >
                      <View 
                        className="w-10 h-10 rounded-lg mr-4 items-center justify-center"
                        style={{ backgroundColor: playlist.color || '#282828' }}
                      >
                        <Icon name="playlist-play" size={20} color="#FFFFFF" />
                      </View>
                      
                      <View className="flex-1">
                        <Text className="text-white text-base font-medium" numberOfLines={1}>
                          {playlist.name}
                        </Text>
                        <Text className="text-spotify-gray text-sm">
                          {playlist.tracks.length} songs
                        </Text>
                      </View>
                      
                      <Icon name="add" size={24} color="#1DB954" />
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            ) : (
              <View className="items-center justify-center py-8">
                <Icon name="playlist-add" size={60} color="#B3B3B3" />
                <Text className="text-spotify-gray text-center mt-4 text-base">
                  No playlists yet.
                </Text>
                <Text className="text-spotify-gray text-center mt-2 text-sm">
                  Create a playlist first to add songs.
                </Text>
              </View>
            )}
          </LinearGradient>
        </View>
      </Modal>
    </LinearGradient>
  );
}
