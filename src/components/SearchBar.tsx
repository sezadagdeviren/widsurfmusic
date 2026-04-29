import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Icon = MaterialIcons as any;

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export default function SearchBar({ value, onChangeText, placeholder = 'Search...', onClear }: SearchBarProps) {
  return (
    <View className="flex-row items-center bg-spotify-dark rounded-xl px-4 py-3 mb-4">
      <Icon name="search" size={20} color="#B3B3B3" />
      
      <TextInput
        className="flex-1 ml-3 text-white text-base"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#B3B3B3"
      />
      
      {value.length > 0 && onClear && (
        <TouchableOpacity onPress={onClear}>
          <Icon name="close" size={20} color="#B3B3B3" />
        </TouchableOpacity>
      )}
    </View>
  );
}
