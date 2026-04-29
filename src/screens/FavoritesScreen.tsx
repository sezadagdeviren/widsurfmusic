import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import { getArtworkUri } from '../utils/musicUtils';
import AlertModal from '../components/AlertModal';
import SearchBar from '../components/SearchBar';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInRight, FadeInDown, Layout } from 'react-native-reanimated';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Icon = MaterialIcons as any;

export default function FavoritesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    favoriteTracks, 
    alert, 
    setAlert, 
    playTrack, 
    removeFromFavorites,
    tracks 
  } = useMusicPlayer();

  const filteredFavorites = favoriteTracks.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <LinearGradient colors={['#191414', '#121212']} className="flex-1">
      <Animated.FlatList
        data={filteredFavorites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        itemLayoutAnimation={Layout.springify()}
        ListHeaderComponent={
          <View className="p-6 pb-2">
            <Animated.View entering={FadeInDown.duration(600)}>
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search favorites..."
              />
            </Animated.View>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center justify-center mt-20 p-10">
            <Icon name="favorite-border" size={64} color="#282828" />
            <Text className="text-spotify-gray text-center mt-4 text-base font-medium">No favorites yet.</Text>
          </View>
        }
        renderItem={({ item: track, index }) => (
          <Animated.View entering={FadeInRight.delay(index * 50)} className="px-6 mb-3">
            <TouchableOpacity 
              className="flex-row items-center p-3 rounded-2xl bg-spotify-dark/40"
              onPress={() => playTrack(tracks.findIndex(t => t.id === track.id))}
            >
              <View className="w-14 h-14 bg-spotify-lighter rounded-xl mr-4 items-center justify-center overflow-hidden">
                {track.artwork ? (
                  <Image source={{ uri: getArtworkUri(track.artwork) }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <Icon name="music-note" size={28} color="#404040" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-white text-base font-bold" numberOfLines={1}>{track.title}</Text>
                <Text className="text-spotify-gray text-xs mt-0.5" numberOfLines={1}>{track.artist}</Text>
              </View>
              <TouchableOpacity onPress={() => removeFromFavorites(track.id)} className="p-2">
                <Icon name="favorite" size={24} color="#1DB954" />
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        )}
      />

      {alert && (
        <AlertModal
          visible={alert.visible}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
    </LinearGradient>
  );
}
