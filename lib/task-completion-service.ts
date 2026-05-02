import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { CalendarEvent } from "./events-context";

export interface TaskCompletionNotification {
  eventId: string;
  eventTitle: string;
  endTime: string;
  notificationId?: string;
  dismissed: boolean;
  dismissedAt?: string;
}

const STORAGE_KEY = "task_completion_notifications";

/**
 * Service pour gérer les notifications de fin de tâche
 * Vérifie régulièrement si des tâches sont terminées et envoie des notifications
 */
export class TaskCompletionService {
  private static checkInterval: ReturnType<typeof setInterval> | null = null;
  private static listeners: Set<() => void> = new Set();

  /**
   * Initialise le service et démarre la vérification périodique
   */
  static async initialize() {
    // Vérifier immédiatement
    await this.checkCompletedTasks();

    // Vérifier toutes les minutes
    this.checkInterval = setInterval(
      () => this.checkCompletedTasks(),
      60 * 1000
    );
  }

  /**
   * Arrête le service
   */
  static stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Vérifie les tâches terminées et envoie les notifications
   */
  static async checkCompletedTasks() {
    try {
      const savedNotifications = await this.getNotifications();
      const now = new Date();

      // Récupérer les événements depuis AsyncStorage
      const eventsJson = await AsyncStorage.getItem("events");
      if (!eventsJson) return;

      const events: CalendarEvent[] = JSON.parse(eventsJson);

      for (const event of events) {
        const endTime = new Date(event.endDate);

        // Vérifier si la tâche est terminée et pas déjà notifiée
        if (
          endTime <= now &&
          !savedNotifications.some((n) => n.eventId === event.id && !n.dismissed)
        ) {
          // Envoyer la notification
          const notificationId = await this.sendCompletionNotification(event);

          // Enregistrer la notification
          const notification: TaskCompletionNotification = {
            eventId: event.id,
            eventTitle: event.title,
            endTime: event.endDate,
            notificationId,
            dismissed: false,
          };

          savedNotifications.push(notification);
        }
      }

      // Sauvegarder les notifications mises à jour
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(savedNotifications)
      );

      // Notifier les listeners
      this.notifyListeners();
    } catch (error) {
      console.error("Error checking completed tasks:", error);
    }
  }

  /**
   * Envoie une notification de fin de tâche
   */
  private static async sendCompletionNotification(
    event: CalendarEvent
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Tâche terminée",
          body: `"${event.title}" est terminée. Avez-vous complété cette tâche ?`,
          data: {
            eventId: event.id,
            eventTitle: event.title,
            type: "task_completion",
          },
          sound: "default",
          priority: "high",
        },
        trigger: null, // Envoyer immédiatement
      });

      return notificationId;
    } catch (error) {
      console.error("Error sending notification:", error);
      return "";
    }
  }

  /**
   * Marque une notification comme rejetée
   */
  static async dismissNotification(eventId: string) {
    try {
      const notifications = await this.getNotifications();
      const notification = notifications.find((n) => n.eventId === eventId);

      if (notification) {
        notification.dismissed = true;
        notification.dismissedAt = new Date().toISOString();
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
      this.notifyListeners();
    } catch (error) {
      console.error("Error dismissing notification:", error);
    }
  }

  /**
   * Récupère les notifications enregistrées
   */
  static async getNotifications(): Promise<TaskCompletionNotification[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      return json ? JSON.parse(json) : [];
    } catch (error) {
      console.error("Error getting notifications:", error);
      return [];
    }
  }

  /**
   * Récupère les notifications non rejetées
   */
  static async getPendingNotifications(): Promise<TaskCompletionNotification[]> {
    try {
      const notifications = await this.getNotifications();
      return notifications.filter((n) => !n.dismissed);
    } catch (error) {
      console.error("Error getting pending notifications:", error);
      return [];
    }
  }

  /**
   * Enregistre un listener pour les changements
   */
  static subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notifie tous les listeners
   */
  private static notifyListeners() {
    this.listeners.forEach((callback) => callback());
  }

  /**
   * Réinitialise toutes les notifications
   */
  static async reset() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      this.notifyListeners();
    } catch (error) {
      console.error("Error resetting notifications:", error);
    }
  }
}
