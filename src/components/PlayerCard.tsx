import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeInUp,
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

interface PlayerCardProps {
  title: string;
  artist: string;
  artwork?: string;
}

export default function PlayerCard({ title, artist, artwork }: PlayerCardProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 20000 }),
      -1,
      false
    );
  }, []);

  const artworkStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View className="w-full items-center">
      {/* Artwork with glow and shadow */}
      <Animated.View 
        entering={FadeInUp.delay(200).duration(1000)}
        className="w-[280px] h-[280px] mb-12"
      >
        <View style={styles.artworkShadow}>
          <View className="w-full h-full rounded-[40px] overflow-hidden border border-white/10 bg-spotify-lighter/10">
            {artwork ? (
              <Image 
                source={{ uri: artwork }} 
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={['#282828', '#121212']}
                className="w-full h-full items-center justify-center"
              >
                <Text style={{ fontSize: 80 }} className="opacity-40">🎵</Text>
              </LinearGradient>
            )}
          </View>
        </View>
      </Animated.View>
      
      {/* Text Info */}
      <Animated.View 
        entering={FadeIn.delay(400)}
        className="items-center px-6"
      >
        <Text className="text-white text-3xl font-black text-center mb-2" numberOfLines={1}>
          {title}
        </Text>
        <Text className="text-spotify-gray text-lg font-bold opacity-60 tracking-wider">
          {artist.toUpperCase()}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  artworkShadow: {
    width: '100%',
    height: '100%',
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
});
