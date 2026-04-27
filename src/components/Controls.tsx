import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Icon = MaterialIcons as any;

interface ControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export default function Controls({ isPlaying, onPlayPause, onPrevious, onNext }: ControlsProps) {
  return (
    <View className="flex-row items-center justify-center gap-8 mb-6">
      <TouchableOpacity 
        onPress={onPrevious}
        className="w-16 h-16 items-center justify-center"
      >
        <Icon name="skip-previous" size={40} color="#FFFFFF" />
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={onPlayPause}
        className={`w-24 h-24 rounded-full items-center justify-center ${isPlaying ? 'bg-spotify-green' : 'bg-white'}`}
      >
        <Icon 
          name={isPlaying ? 'pause' : 'play-arrow'} 
          size={50} 
          color={isPlaying ? '#FFFFFF' : '#000000'} 
        />
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={onNext}
        className="w-16 h-16 items-center justify-center"
      >
        <Icon name="skip-next" size={40} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
