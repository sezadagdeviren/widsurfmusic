import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import SearchBar from '../components/SearchBar';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInUp, FadeInRight, FadeInDown, Layout } from 'react-native-reanimated';

const Icon = MaterialIcons as any;

const PLAYLISTS_KEY = '@music_player_playlists';

const PLAYLIST_COLORS = [
  '#E91E63', // Pink
  '#9C27B0', // Purple
  '#673AB7', // Deep Purple
  '#3F51B5', // Indigo
  '#2196F3', // Blue
  '#00BCD4', // Cyan
  '#009688', // Teal
  '#4CAF50', // Green
  '#FF9800', // Orange
  '#F44336', // Red
];

interface Playlist {
  id: string;
  name: string;
  tracks: any[];
  createdAt: number;
  color?: string;
}

export default function PlaylistsScreen() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PLAYLIST_COLORS[0]);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      const storedPlaylists = await AsyncStorage.getItem(PLAYLISTS_KEY);
      if (storedPlaylists) {
        setPlaylists(JSON.parse(storedPlaylists));
      }
    } catch (error) {
      console.error('Error loading playlists:', error);
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) {
      return;
    }

    try {
      const newPlaylist: Playlist = {
        id: `playlist-${Date.now()}`,
        name: newPlaylistName.trim(),
        tracks: [],
        createdAt: Date.now(),
        color: selectedColor,
      };

      const updatedPlaylists = [...playlists, newPlaylist];
      setPlaylists(updatedPlaylists);
      await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updatedPlaylists));
      
      setNewPlaylistName('');
      setSelectedColor(PLAYLIST_COLORS[0]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    try {
      const updatedPlaylists = playlists.filter(playlist => playlist.id !== playlistId);
      setPlaylists(updatedPlaylists);
      await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updatedPlaylists));
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <LinearGradient
      colors={['#191414', '#121212']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="flex-1"
    >
      <Animated.FlatList
        data={filteredPlaylists}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        itemLayoutAnimation={Layout.springify()}
        ListHeaderComponent={
          <View className="p-6 pb-2">
            <Animated.View entering={FadeInDown.duration(600)}>
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search playlists..."
                onClear={() => setSearchQuery('')}
              />
            </Animated.View>
            
            <Animated.View entering={FadeInUp.delay(200)}>
              <TouchableOpacity 
                className="bg-spotify-green p-4 rounded-2xl mb-4 w-full items-center flex-row justify-center shadow-lg"
                onPress={() => setShowCreateModal(true)}
              >
                <Icon name="add-circle" size={20} color="#FFFFFF" />
                <Text className="text-white text-sm font-bold ml-2">Create New Playlist</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center justify-center mt-20 p-10">
            <Icon name="playlist-add" size={64} color="#282828" />
            <Text className="text-spotify-gray text-center mt-4 text-base font-medium">
              No playlists yet.
            </Text>
            <Text className="text-spotify-gray/60 text-center mt-2 text-sm">
              Organize your music by creating your first playlist.
            </Text>
          </View>
        }
        renderItem={({ item: playlist, index }) => (
          <Animated.View
            entering={FadeInRight.delay(index * 50)}
            layout={Layout.springify()}
            className="px-6 mb-3"
          >
            <View className="flex-row items-center p-3 rounded-2xl bg-spotify-dark/40">
              <View 
                className="w-14 h-14 rounded-xl mr-4 items-center justify-center shadow-sm"
                style={{ backgroundColor: playlist.color || '#282828' }}
              >
                <Icon name="playlist-play" size={28} color="#FFFFFF" />
              </View>
              
              <View className="flex-1">
                <Text className="text-white text-base font-bold" numberOfLines={1}>
                  {playlist.name}
                </Text>
                <Text className="text-spotify-gray text-xs font-medium mt-0.5">
                  {playlist.tracks.length} songs
                </Text>
              </View>
              
              <TouchableOpacity onPress={() => deletePlaylist(playlist.id)} className="p-2">
                <Icon name="delete-outline" size={24} color="#B3B3B3" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      />

      {/* Create Playlist Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowCreateModal(false);
          setNewPlaylistName('');
          setSelectedColor(PLAYLIST_COLORS[0]);
        }}
      >
        <View className="flex-1 bg-black/80 items-center justify-center p-6">
          <LinearGradient
            colors={['#282828', '#191414']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            className="bg-spotify-dark p-8 rounded-[32px] w-full shadow-2xl border border-white/10"
          >
            <View className="flex-row items-center justify-between mb-8">
              <Text className="text-white text-2xl font-black">New Playlist</Text>
              <TouchableOpacity onPress={() => {
                setShowCreateModal(false);
                setNewPlaylistName('');
                setSelectedColor(PLAYLIST_COLORS[0]);
              }}>
                <Icon name="close" size={28} color="#B3B3B3" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              className="bg-spotify-lighter/50 text-white p-5 rounded-2xl mb-8 text-lg font-bold"
              placeholder="Playlist name"
              placeholderTextColor="#555"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
            />
            
            <Text className="text-white text-sm font-bold mb-4 uppercase tracking-widest opacity-60">Choose a theme</Text>
            <View className="flex-row flex-wrap mb-8 justify-between">
              {PLAYLIST_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  className={`w-12 h-12 rounded-2xl mb-3 items-center justify-center ${selectedColor === color ? 'border-2 border-white' : ''}`}
                  style={{ backgroundColor: color }}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && <Icon name="check" size={24} color="white" />}
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity
              className="bg-spotify-green p-5 rounded-2xl w-full items-center shadow-lg active:opacity-80"
              onPress={createPlaylist}
            >
              <Text className="text-white font-black text-lg">Create Playlist</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>
    </LinearGradient>
  );
}
