import React from 'react';
import { View, Text, Image } from 'react-native';

interface PlayerCardProps {
  title: string;
  artist: string;
  artwork?: string;
}

export default function PlayerCard({ title, artist, artwork }: PlayerCardProps) {
  return (
    <View className="bg-spotify-dark rounded-2xl p-6 items-center mb-6">
      <View className="w-56 h-56 bg-spotify-lighter rounded-xl mb-5 items-center justify-center overflow-hidden shadow-2xl">
        {artwork ? (
          <Image 
            source={{ uri: artwork }} 
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <Text style={{ fontSize: 80 }}>🎵</Text>
        )}
      </View>
      
      <Text className="text-white text-2xl font-bold mb-2 text-center" numberOfLines={2}>
        {title}
      </Text>
      <Text className="text-spotify-gray text-base" numberOfLines={1}>
        {artist}
      </Text>
    </View>
  );
}
