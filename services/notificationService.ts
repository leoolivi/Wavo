// services/notificationService.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Track } from '@/types/music';

// Configura come vengono mostrate le notifiche
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Definisci le categorie di notifica con azioni
const MUSIC_CATEGORY = 'MUSIC_PLAYBACK';

export const NOTIFICATION_ACTIONS = {
  PLAY_PAUSE: 'PLAY_PAUSE',
  NEXT: 'NEXT',
  PREVIOUS: 'PREVIOUS',
} as const;

class NotificationService {
  private notificationId: string | null = null;
  private isInitialized = false;
  private actionHandlers: Map<string, () => void> = new Map();

  async initialize() {
    if (this.isInitialized) return;

    // Richiedi permessi
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('❌ Permessi notifiche non concessi');
      return;
    }

    // Configura categoria con azioni (iOS)
    if (Platform.OS === 'ios') {
      await Notifications.setNotificationCategoryAsync(MUSIC_CATEGORY, [
        {
          identifier: NOTIFICATION_ACTIONS.PREVIOUS,
          buttonTitle: '⏮️',
          options: {
            opensAppToForeground: false,
          },
        },
        {
          identifier: NOTIFICATION_ACTIONS.PLAY_PAUSE,
          buttonTitle: '⏯️',
          options: {
            opensAppToForeground: false,
          },
        },
        {
          identifier: NOTIFICATION_ACTIONS.NEXT,
          buttonTitle: '⏭️',
          options: {
            opensAppToForeground: false,
          },
        },
      ]);
    }

    // Configura canale Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('music-player', {
        name: 'Music Player',
        importance: Notifications.AndroidImportance.LOW,
        sound: null,
        vibrationPattern: [],
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: false,
        showBadge: false,
      });
    }

    // Setup listener per le azioni
    this.setupActionListener();

    this.isInitialized = true;
    console.log('✅ Notification service inizializzato');
  }

  private setupActionListener() {
    // Ascolta le risposte alle notifiche
    Notifications.addNotificationResponseReceivedListener((response) => {
      const actionIdentifier = response.actionIdentifier;
      
      // Gestisci le azioni
      if (actionIdentifier === NOTIFICATION_ACTIONS.PLAY_PAUSE) {
        this.actionHandlers.get('playPause')?.();
      } else if (actionIdentifier === NOTIFICATION_ACTIONS.NEXT) {
        this.actionHandlers.get('next')?.();
      } else if (actionIdentifier === NOTIFICATION_ACTIONS.PREVIOUS) {
        this.actionHandlers.get('previous')?.();
      }
    });
  }

  // Registra handler per le azioni
  registerActionHandlers(handlers: {
    playPause: () => void;
    next: () => void;
    previous: () => void;
  }) {
    this.actionHandlers.set('playPause', handlers.playPause);
    this.actionHandlers.set('next', handlers.next);
    this.actionHandlers.set('previous', handlers.previous);
  }

  async showMusicNotification(track: Track, isPlaying: boolean) {
    try {
      // Cancella la notifica precedente se esiste
      if (this.notificationId) {
        await Notifications.dismissNotificationAsync(this.notificationId);
      }

      const playPauseEmoji = isPlaying ? '⏸️' : '▶️';

      const notification = await Notifications.scheduleNotificationAsync({
        content: {
          title: track.title,
          body: `${track.uploader}${isPlaying ? ' • Playing' : ' • Paused'}`,
          data: { 
            trackUrl: track.url,
            isPlaying,
          },
          categoryIdentifier: MUSIC_CATEGORY,
          ...(Platform.OS === 'android' && {
            sticky: true,
            priority: Notifications.AndroidNotificationPriority.LOW,
            sound: undefined,
            vibrate: undefined,
          }),
          ...(Platform.OS === 'ios' && {
            sound: false,
            badge: 0,
          }),
        },
        trigger: null,
      });

      this.notificationId = notification;
      console.log('🔔 Notifica aggiornata:', track.title, isPlaying ? 'Playing' : 'Paused');
    } catch (error) {
      console.error('❌ Errore mostrando notifica:', error);
    }
  }

  async hideNotification() {
    if (this.notificationId) {
      await Notifications.dismissNotificationAsync(this.notificationId);
      this.notificationId = null;
      console.log('🔕 Notifica nascosta');
    }
  }

  async clearAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
    this.notificationId = null;
  }
}

export const notificationService = new NotificationService();