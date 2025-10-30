export interface Track {
  title: string;
  url: string;
  directUrl?: string,
  duration: number;
  uploader: string;
  thumbnail: string;
  localUri?: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  thumbnail?: string;
}

export interface DownloadTask {
  taskId: string;
  track: Track;
  status: 'queued' | 'downloading' | 'completed' | 'error';
  progress?: string;
  localUri?: string;
}