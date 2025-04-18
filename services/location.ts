import * as Location from "expo-location";
import { useEffect, useState } from "react";

interface LocationConfig {
  accuracy: Location.Accuracy;
  timeInterval: number;
  distanceInterval: number;
}

interface LocationState {
  location: Location.LocationObject | null;
  errorMsg: string | null;
}

export const useLocation = (config: LocationConfig) => {
  const [locationState, setLocationState] = useState<LocationState>({
    location: null,
    errorMsg: null,
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationState({
          location: null,
          errorMsg: "Нет доступа к местоположению",
        });
        return;
      }

      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: config.accuracy,
          timeInterval: config.timeInterval,
          distanceInterval: config.distanceInterval,
        },
        (newLocation) => {
          setLocationState({
            location: newLocation,
            errorMsg: null,
          });
        }
      );

      return () => {
        if (locationSubscription) {
          locationSubscription.remove();
        }
      };
    })();
  }, [config.accuracy, config.timeInterval, config.distanceInterval]);

  return locationState;
};

export const getAddress = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ru`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
        },
      }
    );
    const data = await response.json();
    const address = data.address;

    if (!address) {
      return "Адрес не найден";
    }

    let result =
      "Г. " +
      (address.city || address.town || address.village || "") +
      ", " +
      (address.road || "") +
      ", " +
      (address.house_number || "") +
      (address.house_number ? " " : "") +
      (address.house || "");

    return result.replace(/,\s*$/, "");
  } catch (error) {
    console.error("Ошибка при получении адреса:", error);
    throw error;
  }
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};
