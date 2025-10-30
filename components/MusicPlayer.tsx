import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, Pressable, Modal, Dimensions, Animated } from 'react-native';
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Repeat1, ChevronDown } from 'lucide-react-native';
import { useAudio } from '@/context/AudioContext';
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');

export default function MusicPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    skipToNext,
    skipToPrevious,
    currentTime,
    duration,
    volume,
    setVolume,
    seekTo,
    repeatMode,
    setRepeatMode
  } = useAudio();

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);

  // Animazione per la copertina (floating effect)
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      Animated.timing(floatAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [isPlaying]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  // Aggiorna la posizione dello slider
  useEffect(() => {
    if (!isSeeking) {
      setSeekPosition(currentTime);
    }
  }, [currentTime, isSeeking]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekChange = (value: number) => {
    setSeekPosition(value);
  };

  const handleSeekComplete = (value: number) => {
    seekTo(value);
    setIsSeeking(false);
  };

  const handleRepeatToggle = () => {
    const modes: Array<'off' | 'track' | 'queue'> = ['off', 'track', 'queue'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  if (!currentTrack) return null;

  return (
    <>
      {/* Mini Player - Barra inferiore */}
      <Pressable 
        onPress={() => setIsOpen(true)}
        className="absolute bottom-0 w-screen bg-[#1E293B] border-t border-slate-700"
        style={{ 
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 10,
        }}
      >
        <View className="flex-row items-center gap-4 py-3 px-5">
          <Image
            source={{ uri: currentTrack.thumbnail }}
            className="w-14 h-14 rounded-lg"
            resizeMode="cover"
          />
          <View className="flex-1">
            <Text className="text-white font-semibold text-sm" numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text className="text-slate-400 text-xs" numberOfLines={1}>
              {currentTrack.uploader}
            </Text>
          </View>

          <Pressable 
            onPress={(e) => {
              skipToPrevious();
            }}
            className="p-2 rounded-full active:bg-slate-700"
            hitSlop={8}
          >
            <SkipBack size={20} color="#fff" strokeWidth={2.5} />
          </Pressable>

          <Pressable 
            onPress={(e) => {
              togglePlayPause();
            }}
            className="p-3 rounded-full bg-white active:bg-slate-200"
            hitSlop={8}
          >
            {isPlaying ? (
              <Pause size={20} color="#0F172A" strokeWidth={2.5} fill="#0F172A" />
            ) : (
              <Play size={20} color="#0F172A" strokeWidth={2.5} fill="#0F172A" style={{ marginLeft: 2 }} />
            )}
          </Pressable>
          
          <Pressable 
            onPress={(e) => {
              skipToNext();
            }}
            className="p-2 rounded-full active:bg-slate-700"
            hitSlop={8}
          >
            <SkipForward size={20} color="#fff" strokeWidth={2.5} />
          </Pressable>
        </View>
      </Pressable>

      {/* Fullscreen Player Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setIsOpen(false)}
      >
        <View className="flex-1 bg-slate-900">
          <View className="flex-1 px-6 pt-12 pb-8">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-8">
              <Pressable
                onPress={() => setIsOpen(false)}
                className="p-2 rounded-full active:bg-slate-700/50"
                hitSlop={12}
              >
                <ChevronDown size={28} color="#fff" strokeWidth={2} />
              </Pressable>
              <Text className="text-white text-sm font-medium">Now Playing</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Album Art */}
            <View className="flex-1 items-center justify-center mb-8">
              <Animated.View 
                style={[
                  {
                    transform: [{ translateY }],
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 20 },
                    shadowOpacity: 0.5,
                    shadowRadius: 30,
                    elevation: 20,
                  }
                ]}
              >
                <Image
                  source={{ uri: currentTrack.thumbnail }}
                  style={{ 
                    width: Math.min(width - 80, 400), 
                    height: Math.min(width - 80, 400),
                    borderRadius: 24,
                  }}
                  resizeMode="cover"
                />
              </Animated.View>
            </View>

            {/* Track Info */}
            <View className="items-center mb-8">
              <Text className="text-white text-3xl font-bold text-center mb-2" numberOfLines={2}>
                {currentTrack.title}
              </Text>
              <Text className="text-slate-400 text-lg text-center" numberOfLines={1}>
                {currentTrack.uploader}
              </Text>
            </View>

            {/* Timeline */}
            <View className="mb-8">
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={0}
                maximumValue={duration || 1}
                value={seekPosition}
                onSlidingStart={handleSeekStart}
                onValueChange={handleSeekChange}
                onSlidingComplete={handleSeekComplete}
                minimumTrackTintColor="#3B82F6"
                maximumTrackTintColor="#475569"
                thumbTintColor="#fff"
              />
              <View className="flex-row justify-between px-1">
                <Text className="text-slate-400 text-sm">{formatTime(seekPosition)}</Text>
                <Text className="text-slate-400 text-sm">{formatTime(duration)}</Text>
              </View>
            </View>

            {/* Playback Controls */}
            <View className="flex-row items-center justify-center mb-8" style={{ gap: 24 }}>
              <Pressable
                onPress={handleRepeatToggle}
                className="p-3 rounded-full active:bg-slate-700/50"
                hitSlop={12}
              >
                {repeatMode === 'track' ? (
                  <Repeat1 size={24} color="#3B82F6" strokeWidth={2} />
                ) : (
                  <Repeat 
                    size={24} 
                    color={repeatMode === 'queue' ? '#3B82F6' : '#94A3B8'} 
                    strokeWidth={2}
                  />
                )}
              </Pressable>

              <Pressable 
                onPress={skipToPrevious}
                className="p-4 rounded-full active:bg-slate-700/50"
                hitSlop={12}
              >
                <SkipBack size={32} color="#fff" strokeWidth={2.5} />
              </Pressable>

              <Pressable 
                onPress={togglePlayPause}
                className="p-6 rounded-full bg-white active:bg-slate-200"
                style={{
                  shadowColor: '#fff',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                {isPlaying ? (
                  <Pause size={40} color="#0F172A" strokeWidth={2.5} fill="#0F172A" />
                ) : (
                  <Play size={40} color="#0F172A" strokeWidth={2.5} fill="#0F172A" style={{ marginLeft: 4 }} />
                )}
              </Pressable>
              
              <Pressable 
                onPress={skipToNext}
                className="p-4 rounded-full active:bg-slate-700/50"
                hitSlop={12}
              >
                <SkipForward size={32} color="#fff" strokeWidth={2.5} />
              </Pressable>

              <View style={{ width: 56 }} />
            </View>

            {/* Volume Control */}
            <View className="flex-row items-center px-2" style={{ gap: 16 }}>
              <Volume2 size={20} color="#94A3B8" />
              <View className="flex-1">
                <Slider
                  style={{ width: '100%', height: 40 }}
                  minimumValue={0}
                  maximumValue={1}
                  value={volume}
                  onValueChange={setVolume}
                  minimumTrackTintColor="#3B82F6"
                  maximumTrackTintColor="#475569"
                  thumbTintColor="#fff"
                />
              </View>
              <Text className="text-slate-400 text-sm w-12 text-right">
                {Math.round(volume * 100)}%
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}