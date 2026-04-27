import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Icon = MaterialIcons as any;

interface Playlist {
  id: string;
  name: string;
  tracks: any[];
}

interface PlaylistsScreenProps {
  playlists: Playlist[];
  setPlaylists: (playlists: Playlist[]) => void;
  tracks: any[];
}

export default function PlaylistsScreen({ playlists, setPlaylists, tracks }: PlaylistsScreenProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const createPlaylist = () => {
    if (!newPlaylistName.trim()) {
      Alert.alert('Error', 'Please enter a playlist name');
      return;
    }

    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name: newPlaylistName,
      tracks: [],
    };

    setPlaylists([...playlists, newPlaylist]);
    setNewPlaylistName('');
    setShowCreateModal(false);
    Alert.alert('Success', 'Playlist created successfully');
  };

  const deletePlaylist = (playlistId: string) => {
    Alert.alert(
      'Delete Playlist',
      'Are you sure you want to delete this playlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPlaylists(playlists.filter(p => p.id !== playlistId));
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-spotify-black">
      <View className="p-6">
        <View className="flex-row items-center justify-between mb-6 mt-4">
          <Text className="text-white text-3xl font-bold">Playlists</Text>
          <TouchableOpacity
            className="bg-spotify-green p-3 rounded-full"
            onPress={() => setShowCreateModal(true)}
          >
            <Icon name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {playlists.length > 0 ? (
          <View className="space-y-3">
            {playlists.map((playlist) => (
              <TouchableOpacity
                key={playlist.id}
                className="flex-row items-center p-4 rounded-xl bg-spotify-dark"
                onPress={() => {
                  // TODO: Navigate to playlist detail screen
                  Alert.alert('Playlist', `${playlist.name}\n${playlist.tracks.length} songs`);
                }}
              >
                <View className="w-16 h-16 bg-spotify-lighter rounded-lg mr-4 items-center justify-center">
                  <Icon name="playlist-play" size={32} color="#B3B3B3" />
                </View>

                <View className="flex-1">
                  <Text className="text-white text-base font-medium" numberOfLines={1}>
                    {playlist.name}
                  </Text>
                  <Text className="text-spotify-gray text-sm">
                    {playlist.tracks.length} songs
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    deletePlaylist(playlist.id);
                  }}
                  className="p-2"
                >
                  <Icon name="delete" size={24} color="#FF4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="items-center justify-center mt-20">
            <Icon name="playlist-play" size={80} color="#B3B3B3" />
            <Text className="text-spotify-gray text-center mt-4 text-base">
              No playlists yet.
            </Text>
            <Text className="text-spotify-gray text-center mt-2 text-sm">
              Create a playlist to organize your music.
            </Text>
          </View>
        )}
      </View>

      {/* Create Playlist Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-6">
          <View className="bg-spotify-dark rounded-2xl p-6 w-full">
            <Text className="text-white text-xl font-bold mb-4">Create Playlist</Text>

            <TextInput
              className="bg-spotify-lighter text-white rounded-lg p-4 mb-4"
              placeholder="Playlist name"
              placeholderTextColor="#B3B3B3"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-spotify-light p-4 rounded-xl"
                onPress={() => {
                  setNewPlaylistName('');
                  setShowCreateModal(false);
                }}
              >
                <Text className="text-white text-center font-medium">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-spotify-green p-4 rounded-xl"
                onPress={createPlaylist}
              >
                <Text className="text-white text-center font-medium">Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
