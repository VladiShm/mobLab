import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  FlatList,
  TouchableOpacity,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import { MarkerData, MarkerImage } from "../../utils/types";
import Toast from "react-native-toast-message";
import { useDatabase } from "../../contexts/DatabaseContext";
import { useRouter } from "expo-router";

export default function MarkerDetails() {
  const { marker: markerString } = useLocalSearchParams();
  const marker = JSON.parse(markerString as string) as MarkerData;
  const [currentMarker, setCurrentMarker] = useState<MarkerData>(marker);
  const {
    getMarkerById,
    getImages,
    updateMarker,
    addImage,
    deleteImage,
    deleteMarker,
  } = useDatabase();
  const router = useRouter();
  const [fullImageVisible, setFullImageVisible] = useState(false);
  const [fullImageUrl, setFullImageUrl] = useState("");

  useEffect(() => {
    const fetchMarkerData = async () => {
      try {
        const markerData = await getMarkerById(marker.id!);
        const images = await getImages(marker.id!);
        setCurrentMarker({
          ...markerData!,
          images: images,
        });
      } catch (error) {
        console.error("Ошибка при получении данных маркера:", error);
      }
    };

    fetchMarkerData();
  }, [marker.id, getMarkerById, getImages]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Нет доступа к галерее");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      try {
        const imageUri = result.assets[0].uri;
        await addImage({ marker_id: currentMarker.id!, uri: imageUri });
        setCurrentMarker((prev) => ({
          ...prev,
          images: [
            ...(prev.images || []),
            { marker_id: currentMarker.id!, uri: imageUri },
          ],
        }));
        Toast.show({
          type: "success",
          text1: "Сохранено",
          text2: "Изображение добавлено",
          position: "bottom",
        });
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Ошибка",
          text2: "Изображение не добавлено",
          position: "bottom",
        });
      }
    }
  };

  const removeImage = async (image: MarkerImage) => {
    try {
      await deleteImage(image);
      setCurrentMarker((prev) => ({
        ...prev,
        images: prev.images?.filter(
          (img) => img.id !== image.id || img.uri !== image.uri
        ),
      }));
      Toast.show({
        type: "success",
        text1: "Сохранено",
        text2: "Изображение удалено",
        position: "bottom",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Ошибка",
        text2: "Изображение удалено",
        position: "bottom",
      });
    }
  };

  const handleSave = async () => {
    try {
      await updateMarker(currentMarker);
      const updatedMarker = await getMarkerById(currentMarker.id!);
      const images = await getImages(currentMarker.id!);
      setCurrentMarker({
        ...updatedMarker!,
        images: images,
      });

      Toast.show({
        type: "success",
        text1: "Сохранено",
        text2: "Маркер обновлен",
        position: "bottom",
      });
      router.back();
    } catch (error) {
      console.error("Ошибка при сохранении маркера:", error);
      Toast.show({
        type: "error",
        text1: "Ошибка",
        text2: "Не удалось сохранить маркер",
        position: "bottom",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMarker(currentMarker);
      Toast.show({
        type: "success",
        text1: "Удалено",
        text2: "Маркер успешно удален",
        position: "bottom",
      });
      router.back();
    } catch (error) {
      console.error("Ошибка при удалении маркера:", error);
      Toast.show({
        type: "error",
        text1: "Ошибка",
        text2: "Не удалось удалить маркер",
        position: "bottom",
      });
    }
  };

  const handleFullImage = (uri: string) => {
    setFullImageVisible(true);
    setFullImageUrl(uri);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Название"
        value={currentMarker.title}
        onChangeText={(text) =>
          setCurrentMarker((prev) => ({ ...prev, title: text }))
        }
      />
      <TextInput
        style={styles.readonly}
        placeholder="Адрес"
        value={currentMarker.address}
        readOnly
      />
      <View style={styles.buttonContainer}>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Сохранить</Text>
        </Pressable>
        <Pressable
          style={[
            styles.saveButton,
            {
              backgroundColor: "transparent",
              borderColor: "black",
              borderWidth: 1,
            },
          ]}
          onPress={handleDelete}
        >
          <Text style={styles.saveButtonText}>Удалить</Text>
        </Pressable>
      </View>
      <Text style={styles.subtitle}>Изображения</Text>
      <Pressable style={styles.addButton} onPress={pickImage}>
        <Text style={styles.addButtonText}>Добавить</Text>
      </Pressable>
      <FlatList
        data={currentMarker.images || []}
        keyExtractor={(item) => item.uri}
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginBottom: 10,
        }}
        renderItem={({ item }) => (
          <View style={{ position: "relative", width: "48%" }}>
            <Pressable onPress={() => handleFullImage(item.uri)}>
              <Image source={{ uri: item.uri }} style={styles.image} />
            </Pressable>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeImage(item)}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Modal visible={fullImageVisible} transparent animationType="slide">
        <View style={styles.fullImageView}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setFullImageVisible(false)}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
          <Image source={{ uri: fullImageUrl }} style={styles.fullImage} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "black",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "black",
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 10,
  },
  readonly: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    color: "black",
    backgroundColor: "#f1f1f1",
  },
  saveButton: {
    backgroundColor: "transparent",
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "transparent",
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  imageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  imageWrapper: {
    flex: 1,
    marginRight: 10,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
  },
  removeButton: {
    backgroundColor: "rgba(255, 0, 0, 0.5)",
    borderRadius: 50,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  removeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  fullImageView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 10,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  closeButtonText: {
    color: "black",
    fontSize: 24,
    fontWeight: "bold",
  },
  fullImage: {
    width: "90%",
    height: "90%",
    borderRadius: 10,
  },
});
