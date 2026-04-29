import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Icon = MaterialIcons as any;

interface ControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function Controls({ isPlaying, onPlayPause, onNext, onPrevious }: ControlsProps) {
  return (
    <View className="flex-row items-center justify-center space-x-8">
      <TouchableOpacity onPress={onPrevious} activeOpacity={0.7} className="p-2">
        <Icon name="skip-previous" size={40} color="white" />
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={onPlayPause} 
        activeOpacity={0.8}
        className="bg-white w-20 h-20 rounded-full items-center justify-center shadow-xl"
      >
        <Icon name={isPlaying ? "pause" : "play-arrow"} size={48} color="black" />
      </TouchableOpacity>
      
      <TouchableOpacity onPress={onNext} activeOpacity={0.7} className="p-2">
        <Icon name="skip-next" size={40} color="white" />
      </TouchableOpacity>
    </View>
  );
}
