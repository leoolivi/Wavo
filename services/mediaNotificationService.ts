// services/mediaNotificationService.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Track } from '@/types/music';
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

// Configura task manager per gestire notifiche in background
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }: any) => {
  if (error) {
    console.error('Task error:', error);
    return;
  }
  console.log('Background task received data:', data);
});

class MediaNotificationService {
  private notificationId: string | null = null;
  private currentTrack: Track | null = null;
  private isPlaying: boolean = false;
  private listeners: {
    onPlay?: () => void;
    onPause?: () => void;
    onNext?: () => void;
    onPrevious?: () => void;
  } = {};

  async initialize() {
    // Richiedi permessi
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Permessi notifiche non concessi');
      return;
    }

    // Setup canale Android con priorità media per widget persistente
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('music-controls', {
        name: 'Music Controls',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: null,
        vibrationPattern: [],
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: false,
        showBadge: false,
        enableLights: false,
        enableVibrate: false,
      });
    }

    // Listener per azioni
    this.setupNotificationListener();
    
    console.log('✅ Media notification service inizializzato');
  }

  private setupNotificationListener() {
    // iOS: usa categoria actions
    if (Platform.OS === 'ios') {
      Notifications.addNotificationResponseReceivedListener((response) => {
        const action = response.actionIdentifier;
        
        if (action === 'PLAY') this.listeners.onPlay?.();
        else if (action === 'PAUSE') this.listeners.onPause?.();
        else if (action === 'NEXT') this.listeners.onNext?.();
        else if (action === 'PREVIOUS') this.listeners.onPrevious?.();
      });
    }
    
    // Android: usa data payload per gestire azioni via tap
    Notifications.addNotificationReceivedListener((notification) => {
      const action = notification.request.content.data.action;
      
      if (action === 'PLAY') this.listeners.onPlay?.();
      else if (action === 'PAUSE') this.listeners.onPause?.();
      else if (action === 'NEXT') this.listeners.onNext?.();
      else if (action === 'PREVIOUS') this.listeners.onPrevious?.();
    });
  }

  setListeners(listeners: {
    onPlay?: () => void;
    onPause?: () => void;
    onNext?: () => void;
    onPrevious?: () => void;
  }) {
    this.listeners = listeners;
  }

  async show(track: Track, isPlaying: boolean) {
    this.currentTrack = track;
    this.isPlaying = isPlaying;

    try {
      // Cancella notifica precedente
      if (this.notificationId) {
        await Notifications.dismissNotificationAsync(this.notificationId);
      }

      const playPauseIcon = isPlaying ? '⏸' : '▶️';
      const statusText = isPlaying ? 'Playing' : 'Paused';

      // iOS: Notifica con categoria
      if (Platform.OS === 'ios') {
        await this.setupIOSCategory(isPlaying);
        
        this.notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: track.title,
            body: `${track.uploader} • ${statusText}`,
            categoryIdentifier: 'MUSIC_PLAYER',
            sound: false,
            badge: 0,
            data: { trackId: track.url },
          },
          trigger: null,
        });
      }
      
      // Android: Notifica persistente stile media
      else {
        this.notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: track.title,
            subtitle: track.uploader,
            body: `⏮ ${playPauseIcon} ⏭   •   ${statusText}`,
            sticky: true,
            autoDismiss: false,
            priority: Notifications.AndroidNotificationPriority.DEFAULT,
            sound: undefined,
            vibrate: undefined,
            data: {
              trackId: track.url,
              isPlaying,
            },
          },
          trigger: null,
        });
      }

      console.log('🎵 Notifica media aggiornata');
    } catch (error) {
      console.error('Errore mostrando notifica:', error);
    }
  }

  private async setupIOSCategory(isPlaying: boolean) {
    const playPauseAction = isPlaying ? 'PAUSE' : 'PLAY';
    const playPauseTitle = isPlaying ? 'Pause' : 'Play';

    await Notifications.setNotificationCategoryAsync('MUSIC_PLAYER', [
      {
        identifier: 'PREVIOUS',
        buttonTitle: '⏮',
        options: { opensAppToForeground: false },
      },
      {
        identifier: playPauseAction,
        buttonTitle: playPauseTitle,
        options: { opensAppToForeground: false },
      },
      {
        identifier: 'NEXT',
        buttonTitle: '⏭',
        options: { opensAppToForeground: false },
      },
    ]);
  }

  async update(isPlaying: boolean) {
    if (this.currentTrack) {
      await this.show(this.currentTrack, isPlaying);
    }
  }

  async hide() {
    if (this.notificationId) {
      await Notifications.dismissNotificationAsync(this.notificationId);
      this.notificationId = null;
      this.currentTrack = null;
    }
  }

  async clear() {
    await Notifications.dismissAllNotificationsAsync();
    this.notificationId = null;
    this.currentTrack = null;
  }
}

export const mediaNotificationService = new MediaNotificationService();