import React from 'react';
import { View, Text, Modal, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Icon = MaterialIcons as any;

interface LoadingModalProps {
  visible: boolean;
  message?: string;
}

export default function LoadingModal({ visible, message = "Scanning your device..." }: LoadingModalProps) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View className="flex-1 bg-black/80 items-center justify-center p-6">
        <Animated.View 
          entering={FadeIn} 
          exiting={FadeOut}
          className="bg-spotify-dark p-10 rounded-[40px] items-center border border-white/10 shadow-2xl"
        >
          <View className="bg-spotify-green/20 p-6 rounded-full mb-6">
            <ActivityIndicator size="large" color="#1DB954" />
          </View>
          <Text className="text-white text-xl font-bold mb-2">Scanning Music</Text>
          <Text className="text-spotify-gray text-center">{message}</Text>
          
          <View className="flex-row items-center mt-8 bg-white/5 px-4 py-2 rounded-full">
            <Icon name="search" size={16} color="#B3B3B3" />
            <Text className="text-spotify-gray text-xs ml-2 uppercase tracking-widest font-bold">Please Wait</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
