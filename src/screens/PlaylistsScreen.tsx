import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, FlatList, Image, SafeAreaView } from 'react-native';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import AlertModal from '../components/AlertModal';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { getArtworkUri } from '../utils/musicUtils';

const Icon = MaterialIcons as any;

export default function PlaylistsScreen() {
  const {
    playlists,
    alert,
    setAlert,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    playPlaylist
  } = useMusicPlayer();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [editPlaylistName, setEditPlaylistName] = useState('');
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);

  const handleCreatePlaylist = async () => {
    if (newPlaylistName.trim()) {
      const success = await createPlaylist(newPlaylistName, '#1DB954');
      if (success) {
        setNewPlaylistName('');
        setIsModalVisible(false);
      }
    }
  };

  const handleRenamePlaylist = async () => {
    if (editingPlaylistId && editPlaylistName.trim()) {
      await renamePlaylist(editingPlaylistId, editPlaylistName);
      setEditingPlaylistId(null);
      setEditPlaylistName('');
      setIsEditModalVisible(false);
    }
  };

  const startEditing = (id: string, currentName: string) => {
    setEditingPlaylistId(id);
    setEditPlaylistName(currentName);
    setIsEditModalVisible(true);
  };

  if (selectedPlaylist) {
    return (
      <View className="flex-1 bg-spotify-black">
        <LinearGradient colors={['#282828', '#121212']} className="flex-1">
          <SafeAreaView className="flex-1">
            <View className="flex-row items-center px-6 py-4">
              <TouchableOpacity onPress={() => setSelectedPlaylist(null)} className="p-2 -ml-2">
                <Icon name="arrow-back" size={28} color="white" />
              </TouchableOpacity>
              <View className="flex-1 ml-4">
                <Text className="text-white text-2xl font-bold" numberOfLines={1}>{selectedPlaylist.name}</Text>
                <Text className="text-spotify-gray text-xs uppercase tracking-widest">{selectedPlaylist.tracks.length} Tracks</Text>
              </View>
              <TouchableOpacity className="p-2 mr-2" onPress={() => startEditing(selectedPlaylist.id, selectedPlaylist.name)}>
                <Icon name="edit" size={24} color="#B3B3B3" />
              </TouchableOpacity>
              <TouchableOpacity className="p-2" onPress={() => deletePlaylist(selectedPlaylist.id).then(() => setSelectedPlaylist(null))}>
                <Icon name="delete-outline" size={24} color="#ff4444" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={selectedPlaylist.tracks}
              keyExtractor={(item, index) => `pl-detail-${selectedPlaylist.id}-${item.id}-${index}`}
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 160 }}
              ListHeaderComponent={
                <View className="items-center py-8">
                  <View className="w-48 h-48 bg-spotify-lighter rounded-3xl items-center justify-center shadow-2xl mb-6 overflow-hidden">
                    <LinearGradient colors={['#1DB95420', '#1DB95410']} className="w-full h-full items-center justify-center">
                      <Icon name="playlist-play" size={80} color="#1DB954" />
                    </LinearGradient>
                  </View>
                  <TouchableOpacity 
                    className="bg-spotify-green px-10 py-4 rounded-full shadow-lg flex-row items-center"
                    onPress={() => playPlaylist(selectedPlaylist.tracks, 0)}
                  >
                    <Icon name="play-arrow" size={24} color="black" />
                    <Text className="text-black font-bold ml-2 uppercase tracking-widest text-sm">Play All</Text>
                  </TouchableOpacity>
                </View>
              }
              renderItem={({ item: track, index }) => (
                <View className="mb-4">
                  <TouchableOpacity 
                    className="flex-row items-center p-3 bg-spotify-dark/40 rounded-2xl border border-white/5"
                    onPress={() => playPlaylist(selectedPlaylist.tracks, index)}
                  >
                    <View className="w-12 h-12 bg-spotify-lighter rounded-xl mr-4 items-center justify-center overflow-hidden">
                      {track.artwork ? (
                        <Image source={{ uri: getArtworkUri(track.artwork) }} className="w-full h-full" />
                      ) : (
                        <Icon name="music-note" size={24} color="#404040" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-bold" numberOfLines={1}>{track.title}</Text>
                      <Text className="text-spotify-gray text-xs">{track.artist}</Text>
                    </View>
                    <Icon name="more-vert" size={20} color="#B3B3B3" />
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                <View className="items-center justify-center pt-20">
                  <Icon name="library-music" size={48} color="#282828" />
                  <Text className="text-spotify-gray mt-4">This playlist is empty</Text>
                </View>
              }
            />
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#191414', '#121212']} className="flex-1">
      <SafeAreaView className="flex-1">
        <View className="p-6 flex-row justify-between items-center">
          <View>
            <Text className="text-white text-3xl font-bold">Your Library</Text>
            <Text className="text-spotify-gray text-sm">Playlists</Text>
          </View>
          <TouchableOpacity 
            className="bg-spotify-green p-3 rounded-full shadow-lg"
            onPress={() => setIsModalVisible(true)}
          >
            <Icon name="add" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={playlists}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 160 }}
          renderItem={({ item: playlist, index }) => (
            <View className="mb-4">
              <TouchableOpacity 
                className="flex-row items-center p-4 bg-spotify-dark/60 rounded-3xl border border-white/5"
                onPress={() => setSelectedPlaylist(playlist)}
              >
                <View className="w-16 h-16 rounded-2xl mr-4 items-center justify-center overflow-hidden" style={{ backgroundColor: playlist.color + '15' }}>
                  <Icon name="playlist-play" size={32} color={playlist.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-lg font-bold">{playlist.name}</Text>
                  <Text className="text-spotify-gray text-sm">{playlist.tracks.length} Tracks</Text>
                </View>
                <View className="flex-row items-center">
                  <TouchableOpacity onPress={() => startEditing(playlist.id, playlist.name)} className="p-2 mr-1">
                    <Icon name="edit" size={20} color="#B3B3B3" />
                  </TouchableOpacity>
                  <Icon name="chevron-right" size={24} color="#404040" />
                </View>
              </TouchableOpacity>
            </View>
          )}
        </FlatList>
      </SafeAreaView>

      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/80 items-center justify-center p-6">
          <View className="bg-spotify-dark p-8 rounded-[40px] w-full border border-white/10 shadow-2xl">
            <Text className="text-white text-2xl font-bold mb-6 text-center">New Playlist</Text>
            <TextInput
              className="bg-spotify-lighter/20 p-5 rounded-2xl text-white mb-8 border border-white/5"
              placeholder="Give it a name..."
              placeholderTextColor="#B3B3B3"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
            />
            <View className="flex-row justify-between">
              <TouchableOpacity className="px-6 py-3" onPress={() => setIsModalVisible(false)}>
                <Text className="text-spotify-gray font-bold text-lg">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-spotify-green px-8 py-3 rounded-full" onPress={handleCreatePlaylist}>
                <Text className="text-black font-bold text-lg">Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isEditModalVisible} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/80 items-center justify-center p-6">
          <View className="bg-spotify-dark p-8 rounded-[40px] w-full border border-white/10 shadow-2xl">
            <Text className="text-white text-2xl font-bold mb-6 text-center">Rename Playlist</Text>
            <TextInput
              className="bg-spotify-lighter/20 p-5 rounded-2xl text-white mb-8 border border-white/5"
              placeholder="Enter new name..."
              placeholderTextColor="#B3B3B3"
              value={editPlaylistName}
              onChangeText={setEditPlaylistName}
              autoFocus
            />
            <View className="flex-row justify-between">
              <TouchableOpacity className="px-6 py-3" onPress={() => setIsEditModalVisible(false)}>
                <Text className="text-spotify-gray font-bold text-lg">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-spotify-green px-8 py-3 rounded-full" onPress={handleRenamePlaylist}>
                <Text className="text-black font-bold text-lg">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {alert && (
        <AlertModal visible={alert.visible} title={alert.title} message={alert.message} type={alert.type} onClose={() => setAlert(null)} />
      )}
    </LinearGradient>
  );
}
