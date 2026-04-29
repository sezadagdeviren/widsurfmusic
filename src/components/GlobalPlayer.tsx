import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import { getArtworkUri } from '../utils/musicUtils';
import PlayerCard from './PlayerCard';
import Controls from './Controls';
import ProgressBar from './ProgressBar';
import { State, RepeatMode } from 'react-native-track-player';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { SlideInUp } from 'react-native-reanimated';
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
            <Animated.Image source={{ uri: getArtworkUri(currentTrack.artwork) }} className="w-full h-full" />
          ) : (
            <Icon name="music-note" size={24} color="#B3B3B3" />
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
        <Animated.View 
          entering={SlideInUp.duration(400)} 
          className="absolute left-0 right-0 z-50 px-2"
          style={{ bottom: bottomOffset }}
        >
          {miniPlayerContent}
        </Animated.View>
      )}

      {/* Full Player Modal (Kesinlikle Sızdırmaz Tam Ekran Yapı) */}
      <Modal 
        visible={showFullPlayer} 
        animationType="slide" 
        transparent={false}
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View className="flex-1 bg-spotify-black" style={{ backgroundColor: '#121212' }}>
            <LinearGradient colors={['#282828', '#121212']} className="flex-1 px-6">
              <SafeAreaView className="flex-1">
                <View className="flex-row justify-between items-center h-16">
                  <TouchableOpacity onPress={() => setShowFullPlayer(false)}><Icon name="keyboard-arrow-down" size={32} color="white" /></TouchableOpacity>
                  <Text className="text-white text-xs font-bold tracking-[2px] uppercase opacity-60">Now Playing</Text>
                  <Icon name="more-vert" size={24} color="white" />
                </View>

                <View className="flex-[3] justify-center items-center py-4">
                  <PlayerCard title={currentTrack.title} artist={currentTrack.artist} artwork={getArtworkUri(currentTrack.artwork)} />
                </View>

                <View className="flex-[2] justify-end pb-10">
                  <ProgressBar />
                  <View className="flex-row justify-between items-center w-full px-2 mt-8">
                    <TouchableOpacity onPress={toggleShuffle}><Icon name="shuffle" size={24} color={isShuffle ? "#1DB954" : "white"} style={{ opacity: isShuffle ? 1 : 0.6 }} /></TouchableOpacity>
                    <Controls isPlaying={playbackState.state === State.Playing} onPlayPause={togglePlayback} onNext={skipToNext} onPrevious={skipToPrevious} />
                    <TouchableOpacity onPress={toggleRepeatMode}><Icon name={repeatMode === RepeatMode.Track ? "repeat-one" : "repeat"} size={24} color={repeatMode !== RepeatMode.Off ? "#1DB954" : "white"} style={{ opacity: repeatMode !== RepeatMode.Off ? 1 : 0.6 }} /></TouchableOpacity>
                  </View>
                </View>
              </SafeAreaView>
            </LinearGradient>
          </View>
        </GestureHandlerRootView>
      </Modal>
    </>
  );
}
