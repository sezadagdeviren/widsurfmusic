import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, FlatList } from 'react-native';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import AlertModal from '../components/AlertModal';
import SearchBar from '../components/SearchBar';
import LoadingModal from '../components/LoadingModal';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';

// Modular Components
import { SongItem } from '../components/SongsScreen/SongItem';
import { PlaylistSelectionModal } from '../components/SongsScreen/PlaylistSelectionModal';

const Icon = MaterialIcons as any;

export default function SongsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrackForPlaylist, setSelectedTrackForPlaylist] = useState<any>(null);
  
  const {
    tracks, 
    currentTrackIndex, 
    isScanning, 
    alert, 
    setAlert, 
    favorites, 
    playlists, 
    playTrack, 
    scanMusicFiles, 
    addToFavorites, 
    addToPlaylist
  } = useMusicPlayer();

  const filteredTracks = tracks.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <LinearGradient colors={['#191414', '#121212']} className="flex-1">
      <FlatList
        data={filteredTracks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 150 }}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        ListHeaderComponent={
          <View className="p-6 pb-2">
            <Animatable.View animation="fadeInDown" duration={600}>
              <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
            </Animatable.View>
            <View className="flex-row items-center justify-between mb-4 mt-6">
              <Animatable.View animation="fadeInRight" delay={200} className="flex-1">
                <TouchableOpacity 
                  className="bg-spotify-light p-4 rounded-2xl items-center shadow-lg flex-row justify-center" 
                  onPress={() => scanMusicFiles(false)}
                >
                  <Icon name="sync" size={20} color="white" />
                  <Text className="text-white text-sm font-bold ml-2">Scan Device</Text>
                </TouchableOpacity>
              </Animatable.View>
            </View>
          </View>
        }
        renderItem={({ item: track, index }) => {
          const trackIdxInFullList = tracks.findIndex(t => t.id === track.id);
          const isSelected = currentTrackIndex === trackIdxInFullList;
          const isFavorite = favorites.includes(track.id);
          
          return (
            <SongItem
              track={track}
              index={index}
              isSelected={isSelected}
              isFavorite={isFavorite}
              onPlay={() => playTrack(trackIdxInFullList)}
              onAddToPlaylist={() => setSelectedTrackForPlaylist(track)}
              onToggleFavorite={() => addToFavorites(track)}
            />
          );
        }}
        ListEmptyComponent={
          !isScanning ? (
            <View className="items-center justify-center py-20 px-10">
              <Icon name="music-note" size={64} color="#282828" />
              <Text className="text-spotify-gray text-center mt-4 text-lg">No songs found.</Text>
              <TouchableOpacity 
                className="mt-6 bg-spotify-green px-8 py-3 rounded-full"
                onPress={() => scanMusicFiles(false)}
              >
                <Text className="text-black font-bold">Scan Music</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      <PlaylistSelectionModal
        visible={!!selectedTrackForPlaylist}
        playlists={playlists}
        onClose={() => setSelectedTrackForPlaylist(null)}
        onAddToPlaylist={(playlistId) => {
          addToPlaylist(playlistId, selectedTrackForPlaylist);
          setSelectedTrackForPlaylist(null);
        }}
      />

      <LoadingModal visible={isScanning} />

      {alert && (
        <AlertModal 
          visible={alert.visible} 
          title={alert.title} 
          message={alert.message} 
          type={alert.type} 
          onClose={() => setAlert(null)} 
        />
      )}
    </LinearGradient>
  );
}
