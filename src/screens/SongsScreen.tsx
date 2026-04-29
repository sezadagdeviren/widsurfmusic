import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, SafeAreaView, Platform } from 'react-native';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import { getArtworkUri } from '../utils/musicUtils';
import PlayerCard from '../components/PlayerCard';
import Controls from '../components/Controls';
import ProgressBar from '../components/ProgressBar';
import AlertModal from '../components/AlertModal';
import SearchBar from '../components/SearchBar';
import { State, RepeatMode } from 'react-native-track-player';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInUp, FadeInRight, FadeInDown, SlideInUp, Layout } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Icon = MaterialIcons as any;

export default function SongsScreen() {
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    tracks,
    currentTrackIndex,
    playbackState,
    repeatMode,
    isShuffle,
    alert,
    setAlert,
    togglePlayback,
    playTrack,
    skipToNext,
    skipToPrevious,
    toggleRepeatMode,
    toggleShuffle,
    scanMusicFiles
  } = useMusicPlayer();

  const filteredTracks = tracks.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentTrack = tracks[currentTrackIndex];

  return (
    <LinearGradient colors={['#191414', '#121212']} className="flex-1">
      <Animated.FlatList
        data={filteredTracks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        itemLayoutAnimation={Layout.springify()}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        ListHeaderComponent={
          <View className="p-6 pb-2">
            <Animated.View entering={FadeInDown.duration(600)}>
              <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
            </Animated.View>
            
            <View className="flex-row items-center justify-between mb-4 mt-6">
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
        renderItem={({ item: track, index }) => {
          const isSelected = currentTrackIndex === tracks.findIndex(t => t.id === track.id);
          return (
            <Animated.View entering={FadeInRight.delay(index * 30)} className="px-6 mb-3">
              <TouchableOpacity
                className={`flex-row items-center p-3 rounded-2xl ${isSelected ? 'bg-spotify-light/60 border border-spotify-green/30' : 'bg-spotify-dark/40'}`}
                onPress={() => playTrack(tracks.findIndex(t => t.id === track.id))}
              >
                <View className="w-14 h-14 bg-spotify-lighter rounded-xl mr-4 items-center justify-center overflow-hidden">
                  {track.artwork ? (
                    <Animated.Image source={{ uri: getArtworkUri(track.artwork) }} className="w-full h-full" />
                  ) : (
                    <Icon name="music-note" size={28} color="#404040" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className={`text-base font-bold ${isSelected ? 'text-spotify-green' : 'text-white'}`} numberOfLines={1}>{track.title}</Text>
                  <Text className="text-spotify-gray text-xs mt-0.5" numberOfLines={1}>{track.artist}</Text>
                </View>
                {isSelected && playbackState.state === State.Playing && (
                  <Icon name="volume-up" size={20} color="#1DB954" />
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        }}
      />

      {/* Miniplayer */}
      {currentTrack && (
        <Animated.View entering={SlideInUp.duration(400)} className="absolute bottom-0 left-0 right-0">
          <TouchableOpacity 
            className="bg-spotify-dark/95 border-t border-spotify-light p-4 flex-row items-center"
            onPress={() => setShowFullPlayer(true)}
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
            <TouchableOpacity onPress={togglePlayback} className="p-2">
              <Icon name={playbackState.state === State.Playing ? "pause" : "play-arrow"} size={32} color="white" />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Full Player Modal */}
      <Modal visible={showFullPlayer} animationType="slide" transparent={true}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View className="flex-1 bg-spotify-black">
            <LinearGradient colors={['#282828', '#121212']} className="flex-1 px-6">
              <SafeAreaView className="flex-1">
                <View className="flex-row justify-between items-center h-16">
                  <TouchableOpacity onPress={() => setShowFullPlayer(false)}><Icon name="keyboard-arrow-down" size={32} color="white" /></TouchableOpacity>
                  <Text className="text-white text-xs font-bold tracking-[2px] uppercase opacity-60">Now Playing</Text>
                  <Icon name="more-vert" size={24} color="white" />
                </View>

                <View className="flex-[3] justify-center items-center py-4">
                  <PlayerCard title={currentTrack?.title || ''} artist={currentTrack?.artist || ''} artwork={getArtworkUri(currentTrack?.artwork)} />
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

      {alert && (
        <AlertModal visible={alert.visible} title={alert.title} message={alert.message} type={alert.type} onClose={() => setAlert(null)} />
      )}
    </LinearGradient>
  );
}
