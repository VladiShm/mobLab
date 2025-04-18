import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import MapView, { Marker, LongPressEvent } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";

import { MarkerData } from "../utils/types";
import { getAddress } from "../services/location";
import { MapProps } from "../utils/props";
import * as Location from "expo-location";
import userLocationIcon from "../assets/loc.png";

export default function Map({
  markers,
  onMarkerPress,
  onMapReady,
  onError,
  onAddMarker,
  userLocation,
}: MapProps & { userLocation: Location.LocationObject | null }) {
  const [isMapReady, setIsMapReady] = useState(false);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isMapReady) {
        onError("Ошибка при загрузке карты");
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [isMapReady]);

  const handleLongPress = async (event: LongPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    try {
      const address = await getAddress(latitude, longitude);
      const newMarker: MarkerData = {
        latitude,
        longitude,
        title: `Marker: ${markers.length + 1}`,
        description: "",
        address: address,
      };

      onAddMarker(newMarker);
    } catch (error) {
      console.error("Не удалось вычислить адрес:", error);
    }
  };

  const handleMapReady = () => {
    setIsMapReady(true);
    onMapReady();
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 58.0,
          longitude: 56.3,
          latitudeDelta: 1,
          longitudeDelta: 1,
        }}
        onLongPress={handleLongPress}
        onMapReady={handleMapReady}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            pinColor="#79bed9"
            title={marker.title}
            onPress={() => onMarkerPress(marker)}
          />
        ))}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
            }}
            icon={userLocationIcon}
            title="Я тут"
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  locationButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#ffff",
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
});
