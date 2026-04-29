import React from 'react';
import { View, Text, Modal, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Icon = MaterialIcons as any;

interface LoadingModalProps {
  visible: boolean;
  message?: string;
  progress?: number;
  total?: number;
}

export default function LoadingModal({ 
  visible, 
  message = "Scanning your device...",
  progress = 0,
  total = 0
}: LoadingModalProps) {
  if (!visible) return null;

  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View className="flex-1 bg-black/80 items-center justify-center p-6">
        <Animated.View 
          entering={FadeIn} 
          exiting={FadeOut}
          className="bg-spotify-dark p-10 rounded-[40px] items-center border border-white/10 shadow-2xl w-full max-w-[320px]"
        >
          <View className="bg-spotify-green/20 p-6 rounded-full mb-6 relative">
            <ActivityIndicator size="large" color="#1DB954" />
            {total > 0 && (
              <View className="absolute inset-0 items-center justify-center">
                 {/* Spinner stays, but we can overlay or put percentage below */}
              </View>
            )}
          </View>
          
          <Text className="text-white text-xl font-bold mb-2">Scanning Music</Text>
          <Text className="text-spotify-gray text-center mb-4">{message}</Text>
          
          {total > 0 && (
            <View className="w-full items-center mb-6">
              <View className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                <View 
                  className="h-full bg-spotify-green rounded-full" 
                  style={{ width: `${percentage}%` }}
                />
              </View>
              <Text className="text-spotify-green font-bold text-lg">{percentage}%</Text>
              <Text className="text-spotify-gray text-xs mt-1">{progress} / {total} files</Text>
            </View>
          )}
          
          <View className="flex-row items-center bg-white/5 px-4 py-2 rounded-full">
            <Icon name="search" size={16} color="#B3B3B3" />
            <Text className="text-spotify-gray text-xs ml-2 uppercase tracking-widest font-bold">
              {percentage === 100 ? "Finishing..." : "Please Wait"}
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
