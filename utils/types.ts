export interface MarkerData {
  id?: number;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  address: string;
  images?: MarkerImage[];
}

export interface MarkerImage {
  id?: number;
  marker_id: number;
  uri: string;
}
