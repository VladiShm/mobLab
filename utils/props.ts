import { MarkerData, MarkerImage } from "./types";
import * as Location from "expo-location";

export interface MapProps {
  markers: MarkerData[];
  onMarkerPress: (marker: MarkerData) => void;
  onMapReady: () => void;
  onError: (error: string) => void;
  onAddMarker: (marker: MarkerData) => void;
}

export interface ImageListProps {
  marker: MarkerData;
  onAddImage: () => void;
  onRemoveImage: (image: MarkerImage) => void;
}

export interface MarkerActionProps {
  marker: MarkerData;
  onInfoPress: () => void;
  onDeletePress: () => void;
  onCancelPress: () => void;
}
