import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import * as Animatable from 'react-native-animatable';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { MusicTrack } from '../../types/music';
import { getArtworkUri } from '../../utils/musicUtils';

const Icon = MaterialIcons as any;

interface SongItemProps {
  track: MusicTrack;
  index: number;
  isSelected: boolean;
  isFavorite: boolean;
  onPlay: () => void;
  onAddToPlaylist: () => void;
  onToggleFavorite: () => void;
}

const SongItemComponent: React.FC<SongItemProps> = ({
  track,
  index,
  isSelected,
  isFavorite,
  onPlay,
  onAddToPlaylist,
  onToggleFavorite,
}) => {
  // Animasyonu sadece ilk yüklenen 15 öğe için aktif tutalım, geri kalanı doğrudan görünsün
  const shouldAnimate = index < 15;

  const content = (
    <View className={`flex-row items-center p-3 rounded-2xl ${isSelected ? 'bg-spotify-light/60 border border-spotify-green/30' : 'bg-spotify-dark/40'}`}>
      <TouchableOpacity className="flex-1 flex-row items-center" onPress={onPlay}>
        <View className="w-14 h-14 bg-spotify-lighter rounded-xl mr-4 items-center justify-center overflow-hidden">
          {track.artwork ? (
            <Image 
              source={{ uri: getArtworkUri(track.artwork) }} 
              className="w-full h-full"
              fadeDuration={0} // Performans için
            />
          ) : (
            <Icon name="music-note" size={28} color="#404040" />
          )}
        </View>
        <View className="flex-1">
          <Text className={`text-base font-bold ${isSelected ? 'text-spotify-green' : 'text-white'}`} numberOfLines={1}>
            {track.title}
          </Text>
          <Text className="text-spotify-gray text-xs mt-0.5" numberOfLines={1}>
            {track.artist}
          </Text>
        </View>
      </TouchableOpacity>
      
      <View className="flex-row items-center">
        <TouchableOpacity onPress={onToggleFavorite} className="p-2">
          <Icon 
            name={isFavorite ? "favorite" : "favorite-border"} 
            size={22} 
            color={isFavorite ? "#1DB954" : "#B3B3B3"} 
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onAddToPlaylist} className="p-2">
          <Icon name="playlist-add" size={22} color="#B3B3B3" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="px-6 mb-3">
      {content}
    </View>
  );
};

export const SongItem = memo(SongItemComponent, (prevProps, nextProps) => {
  return (
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isFavorite === nextProps.isFavorite &&
    prevProps.track.id === nextProps.track.id &&
    prevProps.track.title === nextProps.track.title &&
    prevProps.track.artwork === nextProps.track.artwork
  );
});
