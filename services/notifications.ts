import * as Notifications from "expo-notifications";
import { MarkerData } from "../utils/types";
import { calculateDistance } from "./location";

interface ActiveNotification {
  markerId: number;
  notificationId: string;
  timestamp: number;
}

class NotificationManager {
  private activeNotifications: Map<number, ActiveNotification>;

  constructor() {
    this.activeNotifications = new Map();
    this.setupNotifications();
  }

  public async setupNotifications() {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("Нет разрешения на уведомления");
      return;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }

  async showNotification(marker: MarkerData): Promise<void> {
    if (this.activeNotifications.has(marker.id!)) {
      return;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Вы около маркера",
        body: `Вы около маркера: ${marker.title}`,
      },
      trigger: null,
    });

    this.activeNotifications.set(marker.id!, {
      markerId: marker.id!,
      notificationId,
      timestamp: Date.now(),
    });
  }

  async removeNotification(markerId: number): Promise<void> {
    const notification = this.activeNotifications.get(markerId);
    if (notification) {
      await Notifications.cancelScheduledNotificationAsync(
        notification.notificationId
      );
      this.activeNotifications.delete(markerId);
    }
  }

  async checkProximity(
    userLocation: { latitude: number; longitude: number },
    markers: MarkerData[]
  ): Promise<void> {
    const proximityThreshold = 100;
    for (const marker of markers) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        marker.latitude,
        marker.longitude
      );

      if (distance <= proximityThreshold) {
        await this.showNotification(marker);
      } else {
        await this.removeNotification(marker.id!);
      }
    }
  }
}

export const notificationManager = new NotificationManager();
