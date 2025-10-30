import { Track } from "@/types/music";
import { useAudioPlayer } from "expo-audio";
import { useEffect } from "react";

// --- Hook personalizzato per gestire il player ---
export default function useManagedAudioPlayer(track: Track | null) {
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