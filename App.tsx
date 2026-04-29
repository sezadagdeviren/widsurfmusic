import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StatusBar } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import TrackPlayer, { Capability } from 'react-native-track-player';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Screens
import SongsScreen from './src/screens/SongsScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import PlaylistsScreen from './src/screens/PlaylistsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Icon = MaterialIcons as any;
const Tab = createBottomTabNavigator();

// Uyarıları engellemek için ekranları açıkça tanımlıyoruz
const SongsComponent = () => <SongsScreen />;
const FavoritesComponent = () => <FavoritesScreen />;
const PlaylistsComponent = () => <PlaylistsScreen />;
const SettingsComponent = () => <SettingsScreen />;

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setupPlayer();
    return () => {
      TrackPlayer.reset();
    };
  }, []);

  const setupPlayer = async () => {
    try {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.Stop,
          Capability.SeekTo,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
        ],
        progressUpdateEventInterval: 1,
      });
      setIsReady(true);
    } catch (error) {
      console.error('Error setting up player:', error);
    }
  };

  if (!isReady) {
    return (
      <View className="flex-1 bg-spotify-black justify-center items-center">
        <Text className="text-white text-lg">Loading Music Player...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#121212',
              borderTopColor: '#282828',
              borderTopWidth: 1,
            },
            tabBarActiveTintColor: '#1DB954',
            tabBarInactiveTintColor: '#B3B3B3',
          }}
        >
          <Tab.Screen 
            name="Songs" 
            component={SongsComponent}
            options={{ 
              title: 'Songs',
              tabBarIcon: ({ color, size }) => <Icon name="music-note" size={size} color={color} />,
            }}
          />
          <Tab.Screen 
            name="Favorites" 
            component={FavoritesComponent}
            options={{ 
              title: 'Favorites',
              tabBarIcon: ({ color, size }) => <Icon name="favorite" size={size} color={color} />,
            }}
          />
          <Tab.Screen 
            name="Playlists" 
            component={PlaylistsComponent}
            options={{ 
              title: 'Playlists',
              tabBarIcon: ({ color, size }) => <Icon name="playlist-play" size={size} color={color} />,
            }}
          />
          <Tab.Screen 
            name="Settings" 
            component={SettingsComponent}
            options={{ 
              title: 'Settings',
              tabBarIcon: ({ color, size }) => <Icon name="settings" size={size} color={color} />,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
