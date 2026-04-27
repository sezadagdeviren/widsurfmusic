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
import { usePlaybackState, useProgress, useTrackPlayerEvents, Event, State } from 'react-native-track-player';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Icon = MaterialIcons as any;

interface SongsScreenProps {
  tracks: any[];
  setTracks: (tracks: any[]) => void;
  currentTrackIndex: number;
  setCurrentTrackIndex: (index: number) => void;
}

export default function SongsScreen({ tracks, setTracks, currentTrackIndex, setCurrentTrackIndex }: SongsScreenProps) {
  const [showFullPlayer, setShowFullPlayer] = useState(false);
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
    await TrackPlayer.skip(index);
    setCurrentTrackIndex(index);
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

  return (
    <View className="flex-1 bg-spotify-black">
      <ScrollView className="flex-1 bg-spotify-black" contentContainerStyle={{ paddingBottom: 96 }}>
        <View className="p-6">
          <Text className="text-white text-3xl font-bold mb-8 mt-4">Songs</Text>
          
          <TouchableOpacity 
            className="bg-spotify-green p-4 rounded-xl mb-8 w-full items-center"
            onPress={pickFile}
          >
            <Text className="text-white text-lg font-bold">📁 Select Music Files</Text>
          </TouchableOpacity>
          
          {tracks.length > 0 ? (
            <View className="space-y-3">
              {tracks.map((track, index) => (
                <TouchableOpacity
                  key={track.id}
                  className={`flex-row items-center p-4 rounded-xl ${currentTrackIndex === index ? 'bg-spotify-light' : 'bg-spotify-dark'}`}
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
                    <Text className={`text-base font-medium ${currentTrackIndex === index ? 'text-spotify-green' : 'text-white'}`} numberOfLines={1}>
                      {track.title}
                    </Text>
                    <Text className="text-spotify-gray text-sm" numberOfLines={1}>
                      {track.artist}
                    </Text>
                  </View>
                  
                  {currentTrackIndex === index && playbackState.state === State.Playing && (
                    <Icon name="equalizer" size={24} color="#1DB954" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
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
          
          <TouchableOpacity onPress={(e) => { e.stopPropagation(); togglePlayback(); }}>
            <Icon 
              name={playbackState.state === State.Playing ? 'pause' : 'play-arrow'} 
              size={32} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
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
            
            <Text className="text-spotify-gray text-xs mt-4">
              Status: {playbackState.state === State.Playing ? 'Playing' : 'Paused'}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}
