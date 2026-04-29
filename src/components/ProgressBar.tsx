import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TrackPlayer, { useProgress } from 'react-native-track-player';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  runOnJS, 
  withSpring
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

export default function ProgressBar() {
  const { position, duration } = useProgress();
  const progress = useSharedValue(0);
  const containerWidth = useSharedValue(0);
  const isDragging = useSharedValue(false);

  // Sync progress with TrackPlayer position
  useEffect(() => {
    if (!isDragging.value && duration > 0) {
      progress.value = position / duration;
    }
  }, [position, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const seekTo = (p: number) => {
    if (duration > 0) {
      TrackPlayer.seekTo(p * duration);
    }
  };

  // Pan gesture for dragging
  const panGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
    })
    .onUpdate((event) => {
      const p = Math.min(1, Math.max(0, event.x / containerWidth.value));
      progress.value = p;
    })
    .onEnd(() => {
      isDragging.value = false;
      runOnJS(seekTo)(progress.value);
    });

  // Tap gesture for jumping
  const tapGesture = Gesture.Tap()
    .onStart((event) => {
      const p = Math.min(1, Math.max(0, event.x / containerWidth.value));
      progress.value = p;
      runOnJS(seekTo)(p);
    });

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const animatedThumbStyle = useAnimatedStyle(() => ({
    left: `${progress.value * 100}%`,
    transform: [{ scale: withSpring(isDragging.value ? 1.5 : 1) }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      <GestureDetector gesture={Gesture.Exclusive(panGesture, tapGesture)}>
        <View 
          style={styles.sliderWrapper}
          onLayout={(e) => { 
            containerWidth.value = e.nativeEvent.layout.width; 
          }}
        >
          <View style={styles.trackBackground}>
            <Animated.View style={[styles.progressFill, animatedProgressStyle]} />
          </View>
          <Animated.View style={[styles.thumb, animatedThumbStyle]} />
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeText: {
    color: '#B3B3B3',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  sliderWrapper: {
    height: 40,
    justifyContent: 'center',
    width: '100%',
  },
  trackBackground: {
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1DB954',
  },
  thumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginLeft: -8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5,
  }
});
