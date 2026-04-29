import React from 'react';
import { View, Text, TouchableOpacity, Image, FlatList } from 'react-native';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import { getArtworkUri } from '../utils/musicUtils';
import AlertModal from '../components/AlertModal';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Icon = MaterialIcons as any;

export default function FavoritesScreen() {
  const {
    favoriteTracks,
    currentTrackIndex,
    tracks,
    alert,
    setAlert,
    playTrack,
    removeFromFavorites
  } = useMusicPlayer();

  return (
    <View className="flex-1 bg-spotify-black">
      <View className="p-6 pt-12">
        <Text className="text-white text-3xl font-bold mb-6">Favorites</Text>
      </View>

      <FlatList
        data={favoriteTracks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 160 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-20">
            <Icon name="favorite-border" size={64} color="#282828" />
            <Text className="text-spotify-gray mt-4 text-lg">No favorite tracks yet</Text>
          </View>
        }
        renderItem={({ item: track, index }) => {
          const originalIndex = tracks.findIndex(t => t.id === track.id);
          const isSelected = currentTrackIndex === originalIndex;

          return (
            <View className="px-6 mb-3">
              <View className={`flex-row items-center p-3 rounded-2xl ${isSelected ? 'bg-spotify-light/60 border border-spotify-green/30' : 'bg-spotify-dark/40'}`}>
                <TouchableOpacity 
                  className="flex-1 flex-row items-center" 
                  onPress={() => playTrack(originalIndex)}
                >
                  <View className="w-14 h-14 bg-spotify-lighter rounded-xl mr-4 items-center justify-center overflow-hidden">
                    {track.artwork ? (
                      <Image source={{ uri: getArtworkUri(track.artwork) }} className="w-full h-full" />
                    ) : (
                      <Icon name="music-note" size={28} color="#404040" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className={`text-base font-bold ${isSelected ? 'text-spotify-green' : 'text-white'}`} numberOfLines={1}>{track.title}</Text>
                    <Text className="text-spotify-gray text-xs mt-0.5" numberOfLines={1}>{track.artist}</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => removeFromFavorites(track.id)} className="p-2">
                  <Icon name="favorite" size={24} color="#1DB954" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
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
    </View>
  );
}
