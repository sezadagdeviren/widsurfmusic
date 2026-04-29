import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Icon = MaterialIcons as any;

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export default function AlertModal({ visible, title, message, type = 'info', onClose }: AlertModalProps) {
  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'error';
      case 'info':
      default:
        return 'info';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#1DB954';
      case 'error':
        return '#E91E63';
      case 'info':
      default:
        return '#2196F3';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/80 items-center justify-center p-6">
        <View className="bg-spotify-dark p-6 rounded-2xl w-full max-w-sm">
          <View className="items-center mb-4">
            <Icon name={getIconName()} size={48} color={getIconColor()} />
          </View>
          
          <Text className="text-white text-xl font-bold text-center mb-2">{title}</Text>
          <Text className="text-spotify-gray text-center mb-6">{message}</Text>
          
          <TouchableOpacity
            className="bg-spotify-green p-4 rounded-xl w-full items-center"
            onPress={onClose}
          >
            <Text className="text-white font-bold">OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
