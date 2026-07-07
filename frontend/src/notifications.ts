import * as Notifications from "expo-notifications";

import * as Device from "expo-device";

import { Platform } from "react-native";

export async function registerForPushNotifications() {
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus =
      existingStatus;

    if (
      existingStatus !== "granted"
    ) {
      const { status } =
        await Notifications.requestPermissionsAsync();

      finalStatus = status;
    }

    if (
      finalStatus !== "granted"
    ) {
      alert(
        "Permission not granted!"
      );

      return;
    }
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync(
      "default",
      {
        name: "default",

        importance:
          Notifications.AndroidImportance.MAX,
      }
    );
  }
}

export async function sendNotification(
  title: string,
  body: string
) {
  await Notifications.scheduleNotificationAsync(
    {
      content: {
        title,
        body,
      },

      trigger: null,
    }
  );
}