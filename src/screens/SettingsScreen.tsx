import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Icon = MaterialIcons as any;

export default function SettingsScreen() {
  const settingsOptions = [
    { id: '1', title: 'Audio Quality', icon: 'high-quality', value: 'Extreme' },
    { id: '2', title: 'Storage', icon: 'storage', value: '1.2 GB Used' },
    { id: '3', title: 'Sleep Timer', icon: 'timer', value: 'Off' },
    { id: '4', title: 'Equalizer', icon: 'graphic-eq', value: '' },
    { id: '5', title: 'Crossfade', icon: 'shuffle', value: '12s' },
  ];

  return (
    <LinearGradient colors={['#191414', '#121212']} className="flex-1">
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1 px-6">
          <View className="py-12 items-center">
            <View className="bg-spotify-green/10 p-6 rounded-full mb-4">
              <Icon name="settings" size={48} color="#1DB954" />
            </View>
            <Text className="text-white text-2xl font-bold">Settings</Text>
            <Text className="text-spotify-gray text-sm mt-1">Customize your experience</Text>
          </View>

          <View className="mb-8">
            <Text className="text-white text-lg font-bold mb-4">Playback</Text>
            {settingsOptions.map((option) => (
              <TouchableOpacity 
                key={option.id} 
                className="flex-row items-center justify-between py-4 border-b border-white/5"
              >
                <View className="flex-row items-center">
                  <Icon name={option.icon} size={24} color="#B3B3B3" />
                  <Text className="text-white text-base ml-4">{option.title}</Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-spotify-gray text-sm mr-2">{option.value}</Text>
                  <Icon name="chevron-right" size={20} color="#404040" />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View className="mb-10">
            <Text className="text-white text-lg font-bold mb-4">Support</Text>
            <TouchableOpacity className="flex-row items-center py-4">
              <Icon name="help-outline" size={24} color="#B3B3B3" />
              <Text className="text-white text-base ml-4">Help Center</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center py-4">
              <Icon name="info-outline" size={24} color="#B3B3B3" />
              <Text className="text-white text-base ml-4">Terms and Conditions</Text>
            </TouchableOpacity>
          </View>

          <View className="items-center pb-10">
            <Text className="text-spotify-gray text-xs">Music Player Pro v1.0.0</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
