import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, Image } from 'react-native';
import DocumentPicker, {
  DocumentPickerResponse,
  types,
} from 'react-native-document-picker';
import TrackPlayer from 'react-native-track-player';
import PlayerCard from '../components/PlayerCard';
import Controls from '../components/Controls';
import ProgressBar from '../components/ProgressBar';
import SearchBar from '../components/SearchBar';
import { usePlaybackState, useProgress, useTrackPlayerEvents, Event, State, RepeatMode } from 'react-native-track-player';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Icon = MaterialIcons as any;

interface SongsScreenProps {
  tracks: any[];
  setTracks: (tracks: any[]) => void;
  currentTrackIndex: number;
  setCurrentTrackIndex: (index: number) => void;
  favorites: any[];
  setFavorites: (favorites: any[]) => void;
  playlists: any[];
  setPlaylists: (playlists: any[]) => void;
}

export default function SongsScreen({ tracks, setTracks, currentTrackIndex, setCurrentTrackIndex, favorites, setFavorites, playlists, setPlaylists }: SongsScreenProps) {
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(RepeatMode.Off);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const playbackState = usePlaybackState();
  const { position, duration } = useProgress();

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
    const actualIndex = tracks.indexOf(filteredTracks[index]);
    await TrackPlayer.skip(actualIndex);
    setCurrentTrackIndex(actualIndex);
  };

  const pickFile = async () => {
    try {
      const result: DocumentPickerResponse[] = await DocumentPicker.pick({
        type: [types.audio],
        allowMultiSelection: true,
      });

      const newTracks = result.map((file, index) => ({
        id: `local-${Date.now()}-${index}`,
        url: file.uri,
        title: file.name || `Track ${index + 1}`,
        artist: 'Local File',
      }));

      await TrackPlayer.reset();
      await TrackPlayer.add(newTracks);
      setTracks(newTracks);
      setCurrentTrackIndex(0);
      Alert.alert('Success', `${newTracks.length} track(s) added`);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        Alert.alert('Error', 'Failed to pick file');
        console.error(err);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredTracks = tracks.filter(track => {
    const query = searchQuery.toLowerCase();
    return track.title?.toLowerCase().includes(query) || 
           track.artist?.toLowerCase().includes(query);
  });

  const toggleFavorite = (track: any) => {
    const isFavorite = favorites.some(fav => fav.id === track.id);
    if (isFavorite) {
      setFavorites(favorites.filter(fav => fav.id !== track.id));
    } else {
      setFavorites([...favorites, track]);
    }
  };

  const toggleRepeatMode = async () => {
    const modes = [RepeatMode.Off, RepeatMode.Track, RepeatMode.Queue];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
    await TrackPlayer.setRepeatMode(nextMode);
  };

  const getRepeatModeIcon = () => {
    switch (repeatMode) {
      case RepeatMode.Off:
        return 'repeat';
      case RepeatMode.Track:
        return 'repeat-one';
      case RepeatMode.Queue:
        return 'repeat';
      default:
        return 'repeat';
    }
  };

  const addToPlaylist = (playlistId: string) => {
    const updatedPlaylists = playlists.map((playlist: any) => {
      if (playlist.id === playlistId) {
        return {
          ...playlist,
          tracks: [...playlist.tracks, selectedTrack],
        };
      }
      return playlist;
    });
    setPlaylists(updatedPlaylists);
    setShowPlaylistModal(false);
    setSelectedTrack(null);
  };

  return (
    <View className="flex-1 bg-spotify-black">
      <ScrollView className="flex-1 bg-spotify-black" contentContainerStyle={{ paddingBottom: 96 }}>
        <View className="p-6">
          
          
          <TouchableOpacity 
            className="bg-spotify-green p-4 rounded-xl mb-4 w-full items-center"
            onPress={pickFile}
          >
            <Text className="text-white text-lg font-bold">📁 Select Music Files</Text>
          </TouchableOpacity>
          
          <SearchBar 
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search songs or artists..."
          />
          
          {filteredTracks.length > 0 ? (
            <View className="space-y-3">
              {filteredTracks.map((track, index) => {
                const actualIndex = tracks.indexOf(track);
                return (
                <TouchableOpacity
                  key={track.id}
                  className={`flex-row items-center p-4 rounded-xl ${currentTrackIndex === actualIndex ? 'bg-spotify-light' : 'bg-spotify-dark'}`}
                  onPress={() => playTrack(index)}
                >
                  <View className="w-12 h-12 bg-spotify-lighter rounded-lg mr-4 items-center justify-center overflow-hidden">
                    {track.artwork ? (
                      <Image source={{ uri: track.artwork }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <Icon name="music-note" size={24} color="#B3B3B3" />
                    )}
                  </View>
                  
                  <View className="flex-1">
                    <Text className={`text-base font-medium ${currentTrackIndex === actualIndex ? 'text-spotify-green' : 'text-white'}`} numberOfLines={1}>
                      {track.title}
                    </Text>
                    <Text className="text-spotify-gray text-sm" numberOfLines={1}>
                      {track.artist}
                    </Text>
                  </View>
                  
                  <TouchableOpacity onPress={(e) => { e.stopPropagation(); toggleFavorite(track); }} className="ml-2">
                    <Icon 
                      name={favorites.some(fav => fav.id === track.id) ? 'favorite' : 'favorite-border'} 
                      size={24} 
                      color={favorites.some(fav => fav.id === track.id) ? '#1DB954' : '#B3B3B3'} 
                    />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={(e) => { e.stopPropagation(); setSelectedTrack(track); setShowPlaylistModal(true); }} className="ml-2">
                    <Icon 
                      name="playlist-add" 
                      size={24} 
                      color="#B3B3B3" 
                    />
                  </TouchableOpacity>
                  
                  {currentTrackIndex === actualIndex && playbackState.state === State.Playing && (
                    <Icon name="equalizer" size={24} color="#1DB954" className="ml-2" />
                  )}
                </TouchableOpacity>
                )
              })}
            </View>
          ) : tracks.length > 0 ? (
            <Text className="text-spotify-gray text-center mt-12 text-base">
              No results found for "{searchQuery}"
            </Text>
          ) : (
            <Text className="text-spotify-gray text-center mt-12 text-base">
              No music loaded. Select music files to start.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Miniplayer */}
      {tracks.length > 0 && (
        <TouchableOpacity 
          className="absolute bottom-0 left-0 right-0 bg-spotify-dark border-t border-spotify-light p-4 flex-row items-center"
          onPress={() => setShowFullPlayer(true)}
        >
          <View className="w-12 h-12 bg-spotify-lighter rounded-lg mr-4 items-center justify-center overflow-hidden">
            {tracks[currentTrackIndex]?.artwork ? (
              <Image source={{ uri: tracks[currentTrackIndex].artwork }} className="w-full h-full" resizeMode="cover" />
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
          
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={(e) => { e.stopPropagation(); skipToPrevious(); }}>
              <Icon name="skip-previous" size={32} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={(e) => { e.stopPropagation(); togglePlayback(); }}>
              <Icon 
                name={playbackState.state === State.Playing ? 'pause' : 'play-arrow'} 
                size={32} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={(e) => { e.stopPropagation(); skipToNext(); }}>
              <Icon name="skip-next" size={32} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* Full Player Modal */}
      <Modal
        visible={showFullPlayer}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFullPlayer(false)}
      >
        <View className="flex-1 bg-spotify-black">
          <View className="flex-1 p-6 items-center justify-center">
            <TouchableOpacity 
              className="absolute top-12 right-6"
              onPress={() => setShowFullPlayer(false)}
            >
              <Icon name="keyboard-arrow-down" size={32} color="#FFFFFF" />
            </TouchableOpacity>
            
            <PlayerCard 
              title={tracks[currentTrackIndex]?.title || ''}
              artist={tracks[currentTrackIndex]?.artist || ''}
              artwork={tracks[currentTrackIndex]?.artwork || undefined}
            />
            
            <ProgressBar position={position} duration={duration} />
            
            <Controls 
              isPlaying={playbackState.state === State.Playing}
              onPlayPause={togglePlayback}
              onPrevious={skipToPrevious}
              onNext={skipToNext}
            />
            
            <View className="flex-row items-center justify-between w-full mt-6 px-4">
              <TouchableOpacity onPress={toggleRepeatMode} className="p-2">
                <Icon 
                  name={getRepeatModeIcon()} 
                  size={24} 
                  color={repeatMode === RepeatMode.Off ? '#B3B3B3' : '#1DB954'} 
                />
              </TouchableOpacity>
              
              <Text className="text-spotify-gray text-xs">
                {repeatMode === RepeatMode.Off ? 'Repeat: Off' : 
                 repeatMode === RepeatMode.Track ? 'Repeat: Track' : 
                 'Repeat: Queue'}
              </Text>
            </View>
            
            <Text className="text-spotify-gray text-xs mt-4">
              Status: {playbackState.state === State.Playing ? 'Playing' : 'Paused'}
            </Text>
          </View>
        </View>
      </Modal>

      {/* Add to Playlist Modal */}
      <Modal
        visible={showPlaylistModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPlaylistModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-6">
          <View className="bg-spotify-dark rounded-2xl p-6 w-full max-h-96">
            <Text className="text-white text-xl font-bold mb-4">Add to Playlist</Text>
            
            {playlists.length > 0 ? (
              <ScrollView className="max-h-60 mb-4">
                {playlists.map((playlist: any) => (
                  <TouchableOpacity
                    key={playlist.id}
                    className="flex-row items-center p-4 rounded-xl bg-spotify-light mb-2"
                    onPress={() => addToPlaylist(playlist.id)}
                  >
                    <Icon name="playlist-play" size={24} color="#B3B3B3" className="mr-3" />
                    <Text className="text-white flex-1">{playlist.name}</Text>
                    <Text className="text-spotify-gray text-sm">{playlist.tracks.length} songs</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <Text className="text-spotify-gray text-center mb-4">
                No playlists yet. Create a playlist first.
              </Text>
            )}

            <TouchableOpacity
              className="bg-spotify-light p-4 rounded-xl"
              onPress={() => {
                setShowPlaylistModal(false);
                setSelectedTrack(null);
              }}
            >
              <Text className="text-white text-center font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
