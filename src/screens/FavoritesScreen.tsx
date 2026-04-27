import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import SearchBar from '../components/SearchBar';
import TrackPlayer from 'react-native-track-player';
import { usePlaybackState, useProgress, useTrackPlayerEvents, Event, State } from 'react-native-track-player';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Icon = MaterialIcons as any;

interface FavoritesScreenProps {
  favorites: any[];
  setFavorites: (favorites: any[]) => void;
  tracks: any[];
  setTracks: (tracks: any[]) => void;
  currentTrackIndex: number;
  setCurrentTrackIndex: (index: number) => void;
}

export default function FavoritesScreen({ favorites, setFavorites, tracks, setTracks, currentTrackIndex, setCurrentTrackIndex }: FavoritesScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const playbackState = usePlaybackState();
  const { position, duration } = useProgress();

  useTrackPlayerEvents([Event.PlaybackTrackChanged], async (event) => {
    if (event.type === Event.PlaybackTrackChanged) {
      const index = await TrackPlayer.getCurrentTrack();
      setCurrentTrackIndex(index ?? 0);
    }
  });

  const filteredFavorites = favorites.filter(track => {
    const query = searchQuery.toLowerCase();
    return track.title?.toLowerCase().includes(query) || 
           track.artist?.toLowerCase().includes(query);
  });

  const toggleFavorite = (track: any) => {
    setFavorites(favorites.filter(fav => fav.id !== track.id));
  };

  const playTrack = async (index: number) => {
    const actualIndex = tracks.indexOf(filteredFavorites[index]);
    await TrackPlayer.skip(actualIndex);
    setCurrentTrackIndex(actualIndex);
  };

  return (
    <ScrollView className="flex-1 bg-spotify-black" contentContainerStyle={{ paddingBottom: 96 }}>
      <View className="p-6">
        <Text className="text-white text-3xl font-bold mb-4 mt-4">Favorites</Text>
        
        <SearchBar 
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search favorites..."
        />
        
        {filteredFavorites.length > 0 ? (
          <View className="space-y-3">
            {filteredFavorites.map((track, index) => {
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
                      name="favorite" 
                      size={24} 
                      color="#1DB954" 
                    />
                  </TouchableOpacity>
                  
                  {currentTrackIndex === actualIndex && playbackState.state === State.Playing && (
                    <Icon name="equalizer" size={24} color="#1DB954" className="ml-2" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : favorites.length > 0 ? (
          <Text className="text-spotify-gray text-center mt-12 text-base">
            No results found for "{searchQuery}"
          </Text>
        ) : (
          <View className="items-center justify-center mt-20">
            <Text style={{ fontSize: 80 }}>❤️</Text>
            <Text className="text-spotify-gray text-center mt-4 text-base">
              No favorites yet.
            </Text>
            <Text className="text-spotify-gray text-center mt-2 text-sm">
              Add songs to your favorites to see them here.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
