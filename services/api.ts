import { API_HOST } from '../constants/config';
import type { Track } from '../types/music';

export const searchTracks = async (query: string, limit: number = 20): Promise<Track[]> => {
  try {
    const response = await fetch(`${API_HOST}/api/search?query=${encodeURIComponent(query)}&limit=${limit}`);
    const data = await response.json();
    return data.results.map((r: any) => ({
      id: r.url,
      title: r.title,
      url: r.url,
      duration: r.duration,
      uploader: r.uploader,
      thumbnail: r.thumbnail,
    }));
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};

export const getTrackInfo = async (url: string) => {
  const response = await fetch(`${API_HOST}/api/info?url=${encodeURIComponent(url)}`);
  return response.json();
};

export const getTrackDirectUrl = async (url: string) => {
  const response = await fetch(`${API_HOST}/api/stream?url=${encodeURIComponent(url)}`);
  return response.json();
};

export const startDownload = async (url: string, format: string = 'mp3', quality: string = '192') => {
  const response = await fetch(`${API_HOST}/api/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, format, quality }),
  });
  return response.json();
};

export const checkDownloadStatus = async (taskId: string) => {
  const response = await fetch(`${API_HOST}/api/status/${taskId}`);
  return response.json();
};

export const getDownloadUrl = (taskId: string) => {
  return `${API_HOST}/api/download/${taskId}`;
};

export const cleanupFile = async (taskId: string) => {
  await fetch(`${API_HOST}/api/cleanup/${taskId}`, { method: 'DELETE' });
};