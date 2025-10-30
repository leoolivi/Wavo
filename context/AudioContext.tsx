// context/AudioContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { Track, Playlist } from '@/types/music';

// --- Tipi ---
interface AudioContextType {
  currentTrack: Track | null;
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  repeatMode: 'off' | 'track' | 'queue';

  playTrack: (track: Track) => Promise<void>;
  playPlaylist: (playlist: Playlist, startIndex?: number) => Promise<void>;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  skipToNext: () => Promise<void>;
  skipToPrevious: () => Promise<void>;
  skipToTrack: (index: number) => Promise<void>;
  seekTo: (seconds: number) => void;

  addToQueue: (track: Track) => void;
  addPlaylistToQueue: (playlist: Playlist) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;

  setRepeatMode: (mode: 'off' | 'track' | 'queue') => void;
  setVolume: (volume: number) => void;

  currentTime: number;
  duration: number;
  volume: number;
}

// --- Hook personalizzato per gestire il player ---
function useManagedAudioPlayer(track: Track | null) {
  const player = useAudioPlayer(track ? track.localUri || track.directUrl : undefined);

  useEffect(() => {
    if (!player || !track) return;

    // Riproduci la nuova traccia
    player.play();

    // ✅ Cleanup sicuro: controlla che il player sia ancora valido
    return () => {
      try {
        if (player.playing) {
          player.pause();
        }
      } catch (err) {
        console.warn('Player cleanup skipped:', err);
      }
    };
  }, [track]);

  return player;
}

// --- Context React ---
const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [repeatMode, setRepeatMode] = useState<'off' | 'track' | 'queue'>('off');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // ✅ Stati locali per currentTime, duration e volume che si aggiornano in tempo reale
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volumeState, setVolumeState] = useState(1);

  // ✅ Player gestito da custom hook
  const player = useManagedAudioPlayer(currentTrack);


  // ✅ Polling continuo per aggiornare currentTime, duration, volume e isPlaying
  useEffect(() => {
    if (!player) return;

    const interval = setInterval(() => {
      try {
        // Aggiorna il tempo corrente
        if (player.currentTime !== undefined) {
          setCurrentTime(player.currentTime);
        }
        
        // Aggiorna la durata
        if (player.duration !== undefined) {
          setDuration(player.duration);
        }
        
        // Aggiorna il volume
        if (player.volume !== undefined) {
          setVolumeState(player.volume);
        }
        
        // Aggiorna lo stato di riproduzione
        if (player.playing !== undefined) {
          setIsPlaying(player.playing);
        }

        // Auto-skip quando la canzone finisce
        if (player.currentTime >= player.duration - 0.5 && player.duration > 0 && player.playing) {
          if (repeatMode === 'track') {
            player.seekTo(0);
            player.play();
          } else {
            skipToNext();
          }
        }
      } catch (err) {
        console.warn('Error updating player state:', err);
      }
    }, 100); // Aggiorna ogni 100ms per fluidità

    return () => clearInterval(interval);
  }, [player, repeatMode]);

  // --- Funzioni di controllo ---
  const playTrack = async (track: Track) => {
    setQueue([track]);
    setCurrentIndex(0);
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const playPlaylist = async (playlist: Playlist, startIndex: number = 0) => {
    if (playlist.tracks.length === 0) return;
    setQueue(playlist.tracks);
    setCurrentIndex(startIndex);
    setCurrentTrack(playlist.tracks[startIndex]);
  };

  const play = () => {
    player?.play();
    setIsPlaying(true);
  };
  
  const pause = () => {
    player?.pause();
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (player?.playing) {
      pause();
    } else {
      play();
    }
  };

  const skipToNext = async () => {
    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentTrack(queue[nextIndex]);
    } else if (repeatMode === 'queue' && queue.length > 0) {
      setCurrentIndex(0);
      setCurrentTrack(queue[0]);
    }
  };

  const skipToPrevious = async () => {
    if (player && player.currentTime > 3) {
      player.seekTo(0);
      return;
    }
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentTrack(queue[prevIndex]);
    } else if (repeatMode === 'queue' && queue.length > 0) {
      const lastIndex = queue.length - 1;
      setCurrentIndex(lastIndex);
      setCurrentTrack(queue[lastIndex]);
    }
  };

  const skipToTrack = async (index: number) => {
    if (index >= 0 && index < queue.length) {
      setCurrentIndex(index);
      setCurrentTrack(queue[index]);
    }
  };

  const seekTo = (seconds: number) => {
    if (player) {
      player.seekTo(seconds);
      setCurrentTime(seconds); // ✅ Aggiorna immediatamente lo stato locale
    }
  };

  const addToQueue = (track: Track) => setQueue(prev => [...prev, track]);
  const addPlaylistToQueue = (playlist: Playlist) =>
    setQueue(prev => [...prev, ...playlist.tracks]);

  const removeFromQueue = (index: number) => {
    if (index === currentIndex) {
      pause();
      setCurrentTrack(null);
    } else if (index < currentIndex) {
      setCurrentIndex(prev => prev - 1);
    }
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  const clearQueue = () => {
    pause();
    setCurrentTrack(null);
    setQueue([]);
    setCurrentIndex(0);
  };

  const handleSetRepeatMode = (mode: 'off' | 'track' | 'queue') => setRepeatMode(mode);
  
  const setVolume = (volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    if (player) {
      player.volume = clampedVolume;
      setVolumeState(clampedVolume); // ✅ Aggiorna immediatamente lo stato locale
    }
  };

  const value: AudioContextType = {
    currentTrack,
    queue,
    currentIndex,
    isPlaying,
    repeatMode,
    playTrack,
    playPlaylist,
    play,
    pause,
    togglePlayPause,
    skipToNext,
    skipToPrevious,
    skipToTrack,
    seekTo,
    addToQueue,
    addPlaylistToQueue,
    removeFromQueue,
    clearQueue,
    setRepeatMode: handleSetRepeatMode,
    setVolume,
    currentTime, // ✅ Usa lo stato locale aggiornato
    duration,    // ✅ Usa lo stato locale aggiornato
    volume: volumeState, // ✅ Usa lo stato locale aggiornato
  };


  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}