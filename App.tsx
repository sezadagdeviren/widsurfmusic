/**
 * Music Player App - Music Player with react-native-track-player
 * @format
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StatusBar } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import TrackPlayer, {
  useTrackPlayerEvents,
  Event,
  Capability,
} from 'react-native-track-player';
import SongsScreen from './src/screens/SongsScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Icon = MaterialIcons as any;

const Tab = createBottomTabNavigator();

function App() {
  const [isReady, setIsReady] = useState(false);
  const [tracks, setTracks] = useState<any[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  useTrackPlayerEvents([Event.RemotePlay, Event.RemotePause, Event.RemoteNext, Event.RemotePrevious], async (event) => {
    if (event.type === Event.RemotePlay) {
      await TrackPlayer.play();
    } else if (event.type === Event.RemotePause) {
      await TrackPlayer.pause();
    } else if (event.type === Event.RemoteNext) {
      await TrackPlayer.skipToNext();
    } else if (event.type === Event.RemotePrevious) {
      await TrackPlayer.skipToPrevious();
    }
  });

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
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#121212',
            borderTopColor: '#282828',
            borderTopWidth: 1,
          },
          tabBarActiveTintColor: '#1DB954',
          tabBarInactiveTintColor: '#B3B3B3',
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#FFFFFF',
        }}
      >
        <Tab.Screen 
          name="Songs" 
          options={{ 
            title: 'Songs',
            tabBarIcon: ({ color, size }) => (
              <Icon name="music-note" size={size} color={color} />
            ),
          }}
        >
          {() => (
            <SongsScreen 
              tracks={tracks}
              setTracks={setTracks}
              currentTrackIndex={currentTrackIndex}
              setCurrentTrackIndex={setCurrentTrackIndex}
            />
          )}
        </Tab.Screen>
        <Tab.Screen 
          name="Favorites" 
          component={FavoritesScreen} 
          options={{ 
            title: 'Favorites',
            tabBarIcon: ({ color, size }) => (
              <Icon name="favorite" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ 
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Icon name="settings" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;
