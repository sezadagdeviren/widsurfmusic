import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import TrackPlayer, { useActiveTrack, usePlaybackState, State } from 'react-native-track-player';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ProgressBar from '../components/ProgressBar';
import LinearGradient from 'react-native-linear-gradient';

const Icon = MaterialIcons as any;

export default function TestProgressBarScreen() {
  const activeTrack = useActiveTrack();
  const playbackState = usePlaybackState();

  const togglePlayback = async () => {
    if (playbackState.state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1DB954', '#121212']}
        style={styles.gradient}
      >
        <View style={styles.card}>
          <Text style={styles.title}>ProgressBar Test</Text>
          <Text style={styles.subtitle}>
            {activeTrack ? `${activeTrack.title} - ${activeTrack.artist}` : 'No track playing'}
          </Text>

          <View style={styles.progressContainer}>
            <ProgressBar />
          </View>

          <TouchableOpacity
            onPress={togglePlayback}
            style={styles.playButton}
          >
            <Icon
              name={playbackState.state === State.Playing ? "pause" : "play-arrow"}
              size={56}
              color="black"
            />
          </TouchableOpacity>

          <Text style={styles.footer}>
            Dokunma testi: Eğer çubuğa bastığında terminalde "SLIDER START" yazmıyorsa Slider bileşeni dokunmatik algılamıyor demektir.
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 30,
    borderRadius: 40,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 10,
  },
  subtitle: {
    color: '#B3B3B3',
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginVertical: 20,
  },
  playButton: {
    width: 80,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    elevation: 10,
  },
  footer: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    marginTop: 40,
    textAlign: 'center',
  }
});
