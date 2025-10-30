import { AudioProvider } from '@/context/AudioContext';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { setAudioModeAsync } from 'expo-audio';
import { useEffect } from 'react';




export default function RootLayout() {
  useEffect(() => {
    const setAudioMode = async () => {
        await setAudioModeAsync({
          playsInSilentMode: true,        // Riproduce anche con il silenzioso
          shouldPlayInBackground: true,   // 🔥 Consente la riproduzione in background
          interruptionModeAndroid: 'duckOthers', // Abbassa altri suoni invece di fermarli
          interruptionMode: 'mixWithOthers',     // iOS: mixa con altri audio
        });
    }
    setAudioMode()
  })

  return (
    <SafeAreaProvider>
      <AudioProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AudioProvider>
      
    </SafeAreaProvider>
  );
}