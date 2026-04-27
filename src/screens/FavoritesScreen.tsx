import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

export default function FavoritesScreen() {
  return (
    <ScrollView className="flex-1 bg-spotify-black">
      <View className="p-6">
        <Text className="text-white text-3xl font-bold mb-8 mt-4">Favorites</Text>
        
        <View className="items-center justify-center mt-20">
          <Text style={{ fontSize: 80 }}>❤️</Text>
          <Text className="text-spotify-gray text-center mt-4 text-base">
            No favorites yet.
          </Text>
          <Text className="text-spotify-gray text-center mt-2 text-sm">
            Add songs to your favorites to see them here.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
