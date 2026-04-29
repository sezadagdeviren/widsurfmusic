import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Icon = MaterialIcons as any;

export default function SettingsScreen() {
  const settings = [
    { title: 'Audio Quality', value: 'High', icon: 'high-quality' },
    { title: 'Equalizer', value: 'Off', icon: 'equalizer' },
    { title: 'Notifications', value: 'On', icon: 'notifications' },
    { title: 'Dark Mode', value: 'Always On', icon: 'dark-mode' },
    { title: 'Storage', value: '2.4 GB used', icon: 'storage' },
    { title: 'About', value: 'Version 1.0.0', icon: 'info' },
  ];

  return (
    <LinearGradient
      colors={['#191414', '#121212']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="flex-1"
    >
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="p-6">
          <Animated.View entering={FadeInDown.duration(600)} className="mb-8 items-center">
            <View className="w-24 h-24 bg-spotify-green rounded-full items-center justify-center shadow-2xl mb-4">
              <Icon name="person" size={48} color="white" />
            </View>
            <Text className="text-white text-2xl font-black">User Account</Text>
            <Text className="text-spotify-gray text-sm font-bold uppercase tracking-widest mt-1">Premium Member</Text>
          </Animated.View>

          <View className="space-y-4">
            {settings.map((item, index) => (
              <Animated.View 
                key={item.title}
                entering={FadeInUp.delay(index * 100)}
              >
                <TouchableOpacity className="bg-spotify-dark/40 p-5 rounded-[24px] flex-row items-center border border-white/5 shadow-sm">
                  <View className="w-12 h-12 bg-spotify-lighter/20 rounded-xl items-center justify-center mr-4">
                    <Icon name={item.icon} size={24} color="#1DB954" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-lg font-bold">{item.title}</Text>
                    <Text className="text-spotify-gray text-sm font-medium mt-0.5">{item.value}</Text>
                  </View>
                  <Icon name="chevron-right" size={24} color="#333" />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          <Animated.View entering={FadeInUp.delay(800)} className="mt-12">
            <TouchableOpacity className="bg-red-900/20 p-5 rounded-[24px] items-center border border-red-900/30">
              <Text className="text-red-500 font-black text-lg">Log Out</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
