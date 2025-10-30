import { Text, View, FlatList, Image, Pressable, ActivityIndicator } from "react-native";
import "../../global.css";
import Searchbar from "@/components/Searchbar";
import { useState, useCallback, memo } from "react";
import { CirclePlus, Download, EllipsisVertical } from "lucide-react-native";
import { getTrackDirectUrl, searchTracks } from '../../services/api';
import type { Track } from '../../types/music';
import MusicPlayer from "@/components/MusicPlayer";
import { useAudio } from "@/context/AudioContext";
import { SafeAreaView } from "react-native-safe-area-context";

interface YoutubeResultItemProps  {
  track: Track
  onDownload: (track: Track) => void;
  onPlay: (track: Track) => void;
  onAddToPlaylist: (track: Track) => void;
}

// ✅ Memoizza il componente per evitare re-render inutili
const YoutubeResultItem = memo(({ 
  track,
  onDownload, 
  onPlay, 
  onAddToPlaylist,
}: YoutubeResultItemProps) => {

  const [dropdownVisibility, setDropdownVisibility] = useState(false);

  return (
    <Pressable 
      className="flex-row items-center gap-3 py-3 active:bg-gray-500 my-1" 
      onPress={() => {
        onPlay(track)
        setDropdownVisibility(false);
      }}
    >
      <Image
        source={{ uri: track.thumbnail }}
        className="size-14 rounded-md"
      />
      <View className="flex-1 gap-1">
        <Text className="text-white font-semibold leading-tight" numberOfLines={1}>
          {track.title}
        </Text>
        <Text className="text-sm text-[#C6C4BB]" numberOfLines={1}>
          {track.uploader}
        </Text>
      </View>
      <Pressable 
        className="p-2.5 rounded-full active:bg-gray-500"
        hitSlop={8}
        onPress={(e) => {
          e.stopPropagation();
          onDownload(track);
        }}
      >
        <Download size={20} color="#fff" strokeWidth={2.5} />
      </Pressable>
      <Pressable 
        className="p-2.5 rounded-full active:bg-gray-500"
        hitSlop={8}
        onPress={(e) => {
          e.stopPropagation();
          onAddToPlaylist(track);
        }}
      >
        <CirclePlus size={20} color="#fff" strokeWidth={2.5} />
      </Pressable>
      <Pressable 
        className="p-2.5 rounded-full active:bg-gray-500"
        hitSlop={8}
        onPress={(e) => {
          e.stopPropagation();
          console.log(`bg-[#1E293B] mt-2 py-2 px-1 rounded-md border border-red-500 absolute right-0 ${dropdownVisibility == true ? "hidden" : ""}`);
          setDropdownVisibility(false);
        }}
      >
        <EllipsisVertical size={20} color="#fff" strokeWidth={2.5} />
      </Pressable>
      <View className={`bg-[#1E293B] mt-2 py-2 px-1 rounded-md border border-red-500 absolute right-0 ${dropdownVisibility == true ? "hidden" : ""}`}>
        <Pressable>
          <Text className="text-white">Aggiungi alla playlist</Text>
        </Pressable>
      </View>
    </Pressable>
  );
});

YoutubeResultItem.displayName = 'YoutubeResultItem';

export default function Index() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Track[]>([]);
  
  // Usa il context per gestire l'audio
  const { playTrack, addToQueue } = useAudio();

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const tracks = await searchTracks(query);
      setResults(tracks);
    } catch (error) {
      console.error("Errore durante la ricerca:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ useCallback per evitare che le funzioni vengano ricreate ad ogni render
  const handlePlay = useCallback(async (track: Track) => {
    try {
      let direct_url_data = await getTrackDirectUrl(track.url);
      track.directUrl = direct_url_data.stream_url;
      await playTrack(track);
      console.log(`Playing ${track.title}...`);
      console.log(`URL: ${track.directUrl}...`);
    } catch (error) {
      console.error("Errore durante la riproduzione:", error);
    }
  }, [playTrack]);

  const handleDownload = useCallback((track: Track) => {
    console.log("Download Pressed for:", track.title);
    // Implementa qui la logica di download
  }, []);

  const handleAddToPlaylist = useCallback((track: Track) => {
    console.log("Add to playlist:", track.title);
    addToQueue(track);
  }, [addToQueue]);

  const handleClean = () => {
    setResults([]);
    setQuery("");
  };

  // ✅ Memoizza il renderItem per evitare ricreazioni
  const renderItem = useCallback(({ item }: { item: Track }) => (
    <YoutubeResultItem 
      track={item}
      onAddToPlaylist={handleAddToPlaylist}
      onPlay={handlePlay}
      onDownload={handleDownload}
    />
  ), [handleAddToPlaylist, handlePlay, handleDownload]);

  // ✅ keyExtractor stabile
  const keyExtractor = useCallback((item: Track) => item.url, []);

  return (
    <SafeAreaView className="flex-1 items-center px-5 bg-[#141B1E]">
      <Searchbar 
        value={query} 
        onChangeText={setQuery} 
        onSearch={handleSearch} 
        onClean={handleClean} 
      />
      
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#548AAE" />
        </View>
      ) : (
        <FlatList 
          className="w-full" 
          data={results}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          // ✅ Ottimizzazioni aggiuntive per performance
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
        />
      )}
      
      <MusicPlayer />
    </SafeAreaView>
  );
}