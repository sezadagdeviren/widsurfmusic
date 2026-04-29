import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import SearchBar from '../components/SearchBar';
import AlertModal from '../components/AlertModal';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInUp, FadeInRight, FadeInDown, Layout } from 'react-native-reanimated';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Icon = MaterialIcons as any;

const PLAYLIST_COLORS = ['#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#00BCD4', '#009688', '#4CAF50', '#FF9800', '#F44336'];

export default function PlaylistsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PLAYLIST_COLORS[0]);

  const { playlists, createPlaylist, deletePlaylist, alert, setAlert } = useMusicPlayer();

  const handleCreate = async () => {
    if (!newPlaylistName.trim()) return;
    const success = await createPlaylist(newPlaylistName, selectedColor);
    if (success) {
      setNewPlaylistName('');
      setShowCreateModal(false);
    }
  };

  const filteredPlaylists = playlists.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <LinearGradient colors={['#191414', '#121212']} className="flex-1">
      <Animated.FlatList
        data={filteredPlaylists}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        itemLayoutAnimation={Layout.springify()}
        ListHeaderComponent={
          <View className="p-6 pb-2">
            <Animated.View entering={FadeInDown.duration(600)}>
              <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Search playlists..." />
            </Animated.View>
            <Animated.View entering={FadeInUp.delay(200)}>
              <TouchableOpacity 
                className="bg-spotify-green p-4 rounded-2xl mb-4 w-full items-center flex-row justify-center shadow-lg mt-4"
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
            <Text className="text-spotify-gray text-center mt-4 text-base font-medium">No playlists yet.</Text>
          </View>
        }
        renderItem={({ item: playlist, index }) => (
          <Animated.View entering={FadeInRight.delay(index * 50)} className="px-6 mb-3">
            <View className="flex-row items-center p-3 rounded-2xl bg-spotify-dark/40">
              <View className="w-14 h-14 rounded-xl mr-4 items-center justify-center shadow-sm" style={{ backgroundColor: playlist.color || '#282828' }}>
                <Icon name="playlist-play" size={28} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-base font-bold" numberOfLines={1}>{playlist.name}</Text>
                <Text className="text-spotify-gray text-xs font-medium mt-0.5">{playlist.tracks.length} songs</Text>
              </View>
              <TouchableOpacity onPress={() => deletePlaylist(playlist.id)} className="p-2">
                <Icon name="delete-outline" size={24} color="#B3B3B3" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      />

      <Modal visible={showCreateModal} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/80 items-center justify-center p-6">
          <LinearGradient colors={['#282828', '#191414']} className="p-8 rounded-[32px] w-full border border-white/10">
            <View className="flex-row items-center justify-between mb-8">
              <Text className="text-white text-2xl font-black">New Playlist</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}><Icon name="close" size={28} color="#B3B3B3" /></TouchableOpacity>
            </View>
            <TextInput
              className="bg-spotify-lighter/50 text-white p-5 rounded-2xl mb-8 text-lg font-bold"
              placeholder="Playlist name"
              placeholderTextColor="#555"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
            />
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
            <TouchableOpacity className="bg-spotify-green p-5 rounded-2xl w-full items-center" onPress={handleCreate}>
              <Text className="text-white font-black text-lg">Create Playlist</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>

      {alert && (
        <AlertModal visible={alert.visible} title={alert.title} message={alert.message} type={alert.type} onClose={() => setAlert(null)} />
      )}
    </LinearGradient>
  );
}
