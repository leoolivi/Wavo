export interface YouTubeSearchResult {
  title: string;
  url: string;
  duration: number; // in secondi
  uploader: string;
  thumbnail: string;
}

export interface YouTubeSearchResponse {
  results: YouTubeSearchResult[];
  count: number;
}