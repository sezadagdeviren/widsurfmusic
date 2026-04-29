import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, SafeAreaView, Image, StyleSheet } from 'react-native';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import { getArtworkUri } from '../utils/musicUtils';
import Controls from './Controls';
import ProgressBar from './ProgressBar';
import { State, RepeatMode } from 'react-native-track-player';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Icon = MaterialIcons as any;

interface GlobalPlayerProps {
  bottomOffset?: number;
  isStatic?: boolean;
}

export default function GlobalPlayer({ bottomOffset = 49, isStatic = false }: GlobalPlayerProps) {
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const {
    tracks,
    currentTrackIndex,
    playbackState,
    repeatMode,
    isShuffle,
    togglePlayback,
    skipToNext,
    skipToPrevious,
    toggleRepeatMode,
    toggleShuffle
  } = useMusicPlayer();

  const currentTrack = tracks[currentTrackIndex];

  if (!currentTrack) return null;

  const miniPlayerContent = (
    <View 
      className={`bg-spotify-dark border-t border-white/5 p-3 flex-row items-center ${isStatic ? '' : 'rounded-xl shadow-2xl'}`}
      style={!isStatic ? {
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      } : {}}
    >
      <TouchableOpacity 
        className="flex-1 flex-row items-center" 
        onPress={() => setShowFullPlayer(true)}
        activeOpacity={0.9}
      >
        <View className="w-12 h-12 bg-spotify-lighter rounded-lg mr-4 overflow-hidden">
          {currentTrack.artwork ? (
            <Image source={{ uri: getArtworkUri(currentTrack.artwork) }} className="w-full h-full" />
          ) : (
            <View className="w-full h-full items-center justify-center bg-white/5">
              <Icon name="music-note" size={24} color="#B3B3B3" />
            </View>
          )}
        </View>
        <View className="flex-1">
          <Text className="text-white text-sm font-bold" numberOfLines={1}>{currentTrack.title}</Text>
          <Text className="text-spotify-gray text-xs" numberOfLines={1}>{currentTrack.artist}</Text>
        </View>
      </TouchableOpacity>

      <View className="flex-row items-center space-x-1">
        <TouchableOpacity onPress={skipToPrevious} className="p-2">
          <Icon name="skip-previous" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={togglePlayback} className="p-2">
          <Icon name={playbackState.state === State.Playing ? "pause" : "play-arrow"} size={32} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={skipToNext} className="p-2">
          <Icon name="skip-next" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      {/* Miniplayer */}
      {isStatic ? (
        <View className="w-full bg-spotify-dark">
          {miniPlayerContent}
        </View>
      ) : (
        <View 
          className="absolute left-0 right-0 z-50 px-2"
          style={{ bottom: bottomOffset }}
        >
          {miniPlayerContent}
        </View>
      )}

      {/* Full Player Modal */}
      <Modal 
        visible={showFullPlayer} 
        animationType="slide" 
        transparent={false}
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
        onRequestClose={() => setShowFullPlayer(false)} // Telefonun geri tuşu için
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View className="flex-1 bg-spotify-black px-6" style={{ backgroundColor: '#121212' }}>
            <SafeAreaView className="flex-1">
              {/* Top Header */}
              <View className="flex-row justify-between items-center h-16">
                <TouchableOpacity onPress={() => setShowFullPlayer(false)}>
                  <Icon name="keyboard-arrow-down" size={36} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xs font-bold tracking-[2px] uppercase opacity-60">Now Playing</Text>
                <Icon name="more-vert" size={24} color="white" />
              </View>

              {/* Artwork Section (No animations, simple Image) */}
              <View className="flex-[3] justify-center items-center py-4">
                <View 
                  className="w-[300px] h-[300px] rounded-[40px] overflow-hidden shadow-2xl bg-spotify-lighter/10"
                  style={{
                    elevation: 15,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.5,
                    shadowRadius: 20,
                  }}
                >
                  {currentTrack.artwork ? (
                    <Image 
                      source={{ uri: getArtworkUri(currentTrack.artwork) }} 
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-full items-center justify-center bg-spotify-lighter/5">
                      <Icon name="music-note" size={100} color="#282828" />
                    </View>
                  )}
                </View>

                {/* Track Info */}
                <View className="items-center mt-12 px-4">
                  <Text className="text-white text-3xl font-black text-center mb-2" numberOfLines={1}>
                    {currentTrack.title}
                  </Text>
                  <Text className="text-spotify-green text-lg font-bold tracking-widest">
                    {currentTrack.artist.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Controls Section */}
              <View className="flex-[2] justify-end pb-10">
                <ProgressBar />
                <View className="flex-row justify-between items-center w-full px-2 mt-8">
                  <TouchableOpacity onPress={toggleShuffle}>
                    <Icon name="shuffle" size={24} color={isShuffle ? "#1DB954" : "white"} style={{ opacity: isShuffle ? 1 : 0.6 }} />
                  </TouchableOpacity>
                  <Controls 
                    isPlaying={playbackState.state === State.Playing} 
                    onPlayPause={togglePlayback} 
                    onNext={skipToNext} 
                    onPrevious={skipToPrevious} 
                  />
                  <TouchableOpacity onPress={toggleRepeatMode}>
                    <Icon name={repeatMode === RepeatMode.Track ? "repeat-one" : "repeat"} size={24} color={repeatMode !== RepeatMode.Off ? "#1DB954" : "white"} style={{ opacity: repeatMode !== RepeatMode.Off ? 1 : 0.6 }} />
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
          </View>
        </GestureHandlerRootView>
      </Modal>
    </>
  );
}
