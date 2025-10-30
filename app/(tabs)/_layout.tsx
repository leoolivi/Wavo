import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MusicPlayer from '@/components/MusicPlayer';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1A2A33',
          borderTopColor: '#548AAE',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#E8E9E8',
        tabBarInactiveTintColor: '#C6C4BB',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Libreria',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Impostazioni',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}