import React, { createContext, useContext, useState, useEffect } from "react";
import { MarkerData, MarkerImage } from "../utils/types";
import { initDatabase } from "../database/schema";
import {
  getAllMarkers,
  getMarkerById,
  getImages,
  addMarker,
  addImage,
  updateMarker,
  deleteMarker,
  deleteImage,
} from "../database/operations";

interface DatabaseContextType {
  getAllMarkers: () => Promise<MarkerData[]>;
  getMarkerById: (id: number) => Promise<MarkerData | undefined>;
  getImages: (markerId: number) => Promise<MarkerImage[]>;
  addMarker: (marker: MarkerData) => Promise<number | undefined>;
  addImage: (image: MarkerImage) => Promise<void>;
  updateMarker: (marker: MarkerData) => Promise<void>;
  deleteMarker: (marker: MarkerData) => Promise<void>;
  deleteImage: (image: MarkerImage) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeDb = async () => {
      try {
        await initDatabase();
        setIsLoading(false);
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
      }
    };

    initializeDb();
  }, []);

  return (
    <DatabaseContext.Provider
      value={{
        getAllMarkers,
        getMarkerById,
        getImages,
        addMarker,
        addImage,
        updateMarker,
        deleteMarker,
        deleteImage,
        isLoading,
        error,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
};
