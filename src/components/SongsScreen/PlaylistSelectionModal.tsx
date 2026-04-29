import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Playlist } from '../../types/music';

const Icon = MaterialIcons as any;

interface PlaylistSelectionModalProps {
  visible: boolean;
  playlists: Playlist[];
  onClose: () => void;
  onAddToPlaylist: (playlistId: string) => void;
}

export const PlaylistSelectionModal: React.FC<PlaylistSelectionModalProps> = ({
  visible,
  playlists,
  onClose,
  onAddToPlaylist,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/80 items-center justify-center p-6">
        <View className="bg-spotify-dark p-6 rounded-3xl w-full border border-white/10 max-h-[80%]">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-white text-xl font-bold">Add to Playlist</Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Icon name="close" size={24} color="#B3B3B3" />
            </TouchableOpacity>
          </View>

          {playlists.length === 0 ? (
            <View className="py-10 items-center">
              <Icon name="playlist-add" size={48} color="#282828" />
              <Text className="text-spotify-gray mt-4 text-center">No playlists found. Create one in the Playlists tab.</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="space-y-2">
                {playlists.map((playlist) => (
                  <TouchableOpacity
                    key={playlist.id}
                    className="p-4 bg-spotify-lighter/20 rounded-2xl flex-row items-center active:bg-spotify-lighter/40"
                    onPress={() => onAddToPlaylist(playlist.id)}
                  >
                    <View 
                      className="w-10 h-10 rounded-lg mr-4 items-center justify-center"
                      style={{ backgroundColor: playlist.color || '#282828' }}
                    >
                      <Icon name="playlist-play" size={24} color="#FFFFFF" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-bold text-base" numberOfLines={1}>
                        {playlist.name}
                      </Text>
                      <Text className="text-spotify-gray text-xs">
                        {playlist.tracks.length} songs
                      </Text>
                    </View>
                    <Icon name="chevron-right" size={20} color="#B3B3B3" />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
          
          <TouchableOpacity 
            className="mt-6 p-4 items-center bg-spotify-lighter/10 rounded-2xl" 
            onPress={onClose}
          >
            <Text className="text-white font-bold">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
