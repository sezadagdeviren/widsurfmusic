import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const Icon = MaterialIcons as any;

interface ControlsProps {
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  isPlaying: boolean;
}

export default function Controls({ onPlayPause, onNext, onPrevious, isPlaying }: ControlsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={onPrevious} 
        style={styles.secondaryButton}
      >
        <Icon name="skip-previous" size={32} color="white" />
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={onPlayPause}
        style={styles.playButtonContainer}
      >
        <LinearGradient
          colors={['#1DB954', '#17a34a']}
          style={styles.playButtonGradient}
        >
          <Icon
            name={isPlaying ? "pause" : "play-arrow"}
            size={42}
            color="white"
          />
        </LinearGradient>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={onNext} 
        style={styles.secondaryButton}
      >
        <Icon name="skip-next" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  secondaryButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 30,
  },
  playButtonContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  playButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
