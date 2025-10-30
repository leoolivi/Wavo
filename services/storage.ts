import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import documentDirectory from 'expo-file-system';
import type { Track, Playlist } from '../types/music';
import { API_HOST } from '@/constants/config';

const PLAYLISTS_KEY = '@playlists';
const DOWNLOADS_KEY = '@downloads';
const FAVORITES_KEY = '@favorites';

export const savePlaylists = async (playlists: Playlist[]) => {
  await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
};

export const loadPlaylists = async (): Promise<Playlist[]> => {
  const data = await AsyncStorage.getItem(PLAYLISTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveDownloads = async (downloads: Track[]) => {
  await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(downloads));
};

export const loadDownloads = async (): Promise<Track[]> => {
  const data = await AsyncStorage.getItem(DOWNLOADS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveFavorites = async (favorites: Track[]) => {
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

export const loadFavorites = async (): Promise<Track[]> => {
  const data = await AsyncStorage.getItem(FAVORITES_KEY);
  return data ? JSON.parse(data) : [];
};

export const downloadTrack = async (taskId: string, track: Track): Promise<string> => {
  const fileUri = `${documentDirectory}${taskId}.mp3`;
  const downloadUrl = `${API_HOST}/api/download/${taskId}`;
  
  const { uri } = await FileSystem.downloadAsync(downloadUrl, fileUri);
  return uri;
};