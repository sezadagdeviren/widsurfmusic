import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

export default function SettingsScreen() {
  return (
    <ScrollView className="flex-1 bg-spotify-black">
      <View className="p-6">
        <Text className="text-white text-3xl font-bold mb-8 mt-4">Settings</Text>
        
        <View className="space-y-4">
          <TouchableOpacity className="bg-spotify-light p-4 rounded-xl">
            <Text className="text-white text-lg">Audio Quality</Text>
            <Text className="text-spotify-gray text-sm mt-1">High</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-spotify-light p-4 rounded-xl">
            <Text className="text-white text-lg">Equalizer</Text>
            <Text className="text-spotify-gray text-sm mt-1">Off</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-spotify-light p-4 rounded-xl">
            <Text className="text-white text-lg">Notifications</Text>
            <Text className="text-spotify-gray text-sm mt-1">On</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-spotify-light p-4 rounded-xl">
            <Text className="text-white text-lg">Dark Mode</Text>
            <Text className="text-spotify-gray text-sm mt-1">Always On</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-spotify-light p-4 rounded-xl">
            <Text className="text-white text-lg">About</Text>
            <Text className="text-spotify-gray text-sm mt-1">Version 1.0.0</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
