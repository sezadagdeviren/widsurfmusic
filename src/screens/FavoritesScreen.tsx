import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AlertModal from '../components/AlertModal';
import SearchBar from '../components/SearchBar';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInUp, FadeInRight, FadeInDown, Layout } from 'react-native-reanimated';

const Icon = MaterialIcons as any;

const FAVORITES_KEY = '@music_player_favorites';

interface Track {
  id: string;
  url: string;
  title: string;
  artist: string;
  artwork?: string;
}

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [alertModal, setAlertModal] = useState({ visible: false, title: '', message: '', type: 'info' as 'success' | 'error' | 'info' });

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const removeFavorite = async (trackId: string) => {
    try {
      const updatedFavorites = favorites.filter(track => track.id !== trackId);
      setFavorites(updatedFavorites);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      setAlertModal({ visible: true, title: 'Success', message: 'Removed from favorites', type: 'success' });
    } catch (error) {
      console.error('Error removing favorite:', error);
      setAlertModal({ visible: true, title: 'Error', message: 'Failed to remove from favorites', type: 'error' });
    }
  };

  const filteredFavorites = favorites.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getArtworkUri = (artwork?: string) => {
    if (!artwork) return undefined;
    if (artwork.startsWith('http') || artwork.startsWith('file://') || artwork.startsWith('content://')) {
      return artwork;
    }
    return `file://${artwork}`;
  };

  return (
    <LinearGradient
      colors={['#191414', '#121212']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="flex-1"
    >
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
                onClear={() => setSearchQuery('')}
              />
            </Animated.View>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center justify-center mt-20 p-10">
            <Icon name="favorite-border" size={64} color="#282828" />
            <Text className="text-spotify-gray text-center mt-4 text-base font-medium">
              No favorites yet.
            </Text>
            <Text className="text-spotify-gray/60 text-center mt-2 text-sm">
              Tap the heart icon on any song to add it here.
            </Text>
          </View>
        }
        renderItem={({ item: track, index }) => (
          <Animated.View
            entering={FadeInRight.delay(index * 50)}
            layout={Layout.springify()}
            className="px-6 mb-3"
          >
            <View className="flex-row items-center p-3 rounded-2xl bg-spotify-dark/40">
              <View className="w-14 h-14 bg-spotify-lighter rounded-xl mr-4 items-center justify-center overflow-hidden shadow-sm">
                {track.artwork ? (
                  <Image source={{ uri: getArtworkUri(track.artwork) }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <Icon name="music-note" size={28} color="#404040" />
                )}
              </View>
              
              <View className="flex-1">
                <Text className="text-white text-base font-bold" numberOfLines={1}>
                  {track.title}
                </Text>
                <Text className="text-spotify-gray text-xs font-medium mt-0.5" numberOfLines={1}>
                  {track.artist}
                </Text>
              </View>
              
              <TouchableOpacity onPress={() => removeFavorite(track.id)} className="p-2">
                <Icon name="favorite" size={24} color="#1DB954" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      />

      <AlertModal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ ...alertModal, visible: false })}
      />
    </LinearGradient>
  );
}
