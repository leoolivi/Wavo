import { Text, View, FlatList, Image, Pressable, Alert } from "react-native";
import "../global.css";
import Searchbar from "@/components/Searchbar";
import { useState } from "react";
import { YouTubeSearchResponse, YouTubeSearchResult } from "@/types/types";
import { Download } from "lucide-react-native";
import * as FileSystem from 'expo-file-system';
import documentDirectory from "expo-file-system";

// const BACKEND_SERVER_URL = process.env.BACKEND_SERVER_URL;
const BACKEND_SERVER_URL = "http://0.0.0.0:8000";

interface YoutubeResultItemProps {
  thumbnail: string;
  title: string;
  uploader: string;
  url: string;
  duration: number;
  onDownload: (props: YouTubeSearchResult) => void;
}

const YoutubeResultItem = ({ thumbnail, title, uploader, onDownload, url, duration} : YoutubeResultItemProps) => {
  console.log("Rendering item:", title);
    return (
    <View className="flex-row items-center gap-3 px-4 py-3 bg-white active:bg-gray-50 rounded-2xl shadow-sm border border-gray-100 my-1">
      <Image
        source={{ uri: thumbnail }}
        className="size-14 rounded-xl"
      />
      <View className="flex-1 gap-1">
        <Text className="text-base font-semibold text-gray-900 leading-tight" numberOfLines={1}>
          {title}
        </Text>
        <Text className="text-sm text-gray-500" numberOfLines={1}>
          {uploader}
        </Text>
      </View>
      <Pressable 
        className="p-2.5 rounded-full bg-gray-50 active:bg-gray-100"
        hitSlop={8}
        onPress={() => console.log("Download pressed")}
      >
        <Download size={20} color="#374151" strokeWidth={2.5} />
      </Pressable>
    </View>
    );
}

interface DownloadSongParams {
  url: string;
  title: string;
  uploader: string;
  onProgress?: (progress: number) => void;
  onComplete?: (filePath: string) => void;
  onError?: (error: string) => void;
}

/* export const downloadSong = async ({
  url,
  title,
  uploader,
  onProgress,
  onComplete,
  onError
}: DownloadSongParams) => {
  try {
    // 1. Avvia il download sul server
    const startResponse = await fetch(`${BACKEND_SERVER_URL}/api/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        format: 'mp3',
        quality: '192'
      })
    });

    if (!startResponse.ok) {
      throw new Error('Failed to start download');
    }

    const { task_id } = await startResponse.json();

    // 2. Polling dello stato del download
    let isCompleted = false;
    let attempts = 0;
    const maxAttempts = 60; // 5 minuti max (60 * 5s)

    while (!isCompleted && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Aspetta 5 secondi
      
      const statusResponse = await fetch(`${BACKEND_SERVER_URL}/api/status/${task_id}`);
      const status = await statusResponse.json();

      if (status.status === 'downloading' || status.status === 'processing') {
        // Estrai la percentuale dal progress string (es. "45.2%")
        const progressMatch = status.progress?.match(/(\d+\.?\d*)/);
        if (progressMatch && onProgress) {
          onProgress(parseFloat(progressMatch[1]));
        }
      } else if (status.status === 'completed') {
        isCompleted = true;
        
        // 3. Scarica il file sul dispositivo
        const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `${sanitizedTitle}_${uploader.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp3`;
        const localUri = `${documentDirectory}${fileName}`;

        const downloadResumable = FileSystem.createDownloadResumable(
          `${BACKEND_SERVER_URL}/api/download/${task_id}`,
          localUri,
          {},
          (downloadProgress) => {
            const progress = (downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite) * 100;
            if (onProgress) {
              onProgress(progress);
            }
          }
        );

        const result = await downloadResumable.downloadAsync();
        
        if (result && result.uri) {
          // 4. Cleanup del file sul server
          await fetch(`${BACKEND_SERVER_URL}/api/cleanup/${task_id}`, {
            method: 'DELETE'
          });

          if (onComplete) {
            onComplete(result.uri);
          }

          Alert.alert('Download completato!', `${title} è stato salvato sul dispositivo.`);
        }
      } else if (status.status === 'error') {
        throw new Error(status.message || 'Download failed');
      }

      attempts++;
    }

    if (!isCompleted) {
      throw new Error('Download timeout');
    }

  } catch (error) {
    console.error('Download error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (onError) {
      onError(errorMessage);
    }
    
    Alert.alert('Errore', `Impossibile scaricare la canzone: ${errorMessage}`);
  }
}; */

export default function Index() {
    const [searchValue, setSearchValue] = useState("");
    const [searchResults, setSearchResults] = useState<YouTubeSearchResponse>({results: [], count: 0});

    const searchYouTube = async (query: string): Promise<YouTubeSearchResponse> => {
      const response = await fetch(
      `${BACKEND_SERVER_URL}/api/search?query=${encodeURIComponent(query)}&limit=3`
      );
      if (!response.ok) {
      throw new Error(`Errore nella richiesta: ${response.status}`);
      }
      const data: YouTubeSearchResponse = await response.json();
      return data;
    };

    const handleSearch = async (text: string) => {
      console.log("Searching for:", text);
      setSearchResults(await searchYouTube(text));
      console.log(searchResults);
    }

    const handleClean = () => {
      setSearchValue("");
      setSearchResults({results: [], count: 0});
    }

/*     const handleDownload = async () => {
      downloadSong({});
    } */


    return (
    <View
        className="flex-1 items-center px-5 mt-20"
      >
        <Searchbar value={searchValue} onChangeText={setSearchValue} onSearch={handleSearch} onClean={handleClean}></Searchbar>
        <FlatList className=" w-full" data={searchResults.results} renderItem={({item}) => 
          <YoutubeResultItem 
            thumbnail={item.thumbnail}
            uploader={item.uploader}
            title={item.title}
            url={item.url}
            duration={item.duration}
            onDownload={() => {}}/>}></FlatList>
    </View>
    );
}