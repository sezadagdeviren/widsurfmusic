import React from 'react';
import { View, Text } from 'react-native';

interface ProgressBarProps {
  position: number;
  duration: number;
}

export default function ProgressBar({ position, duration }: ProgressBarProps) {
  const progress = duration > 0 ? (position / duration) * 100 : 0;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className="w-full mb-8">
      <View className="flex-row justify-between mb-3">
        <Text className="text-spotify-gray text-sm">
          {formatTime(position)}
        </Text>
        <Text className="text-spotify-gray text-sm">
          {formatTime(duration)}
        </Text>
      </View>
      
      <View className="w-full h-1.5 bg-spotify-lighter rounded-full overflow-hidden">
        <View 
          className="h-full bg-spotify-green rounded-full"
          style={{ width: `${progress}%` }}
        />
      </View>
    </View>
  );
}
