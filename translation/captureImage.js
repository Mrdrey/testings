import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Button,
  Image,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";

export default function CaptureImage() {
  const [targetLang, setTargetLang] = useState("es");
  const [extractedText, setExtractedText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Sorry, we need camera permissions to make this work!",
            [{ text: "OK", onPress: () => console.log("Permission denied") }]
          );
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "You need to enable permission to access the image library",
          [{ text: "OK" }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        setExtractedText("");
        setTranslatedText("");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image: " + error.message);
    }
  };

  const captureImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "You need to enable permission to use the camera",
          [{ text: "OK" }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        setExtractedText("");
        setTranslatedText("");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to capture image: " + error.message);
    }
  };

  const processImage = async () => {
    if (!selectedImage) {
      Alert.alert("Error", "Please select or capture an image first.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("image", {
      uri: selectedImage,
      name: "image.jpg",
      type: "image/jpeg",
    });
    formData.append("target_lang", targetLang);

    try {
      const response = await axios.post(
        "http://192.168.100.153:5000/ocr_translate",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        const { extracted_text, detected_lang, translated_text } = response.data;
        setExtractedText(extracted_text);
        setTranslatedText(translated_text);
        Alert.alert(
          "Language Detected",
          `Detected language: ${detected_lang.toUpperCase()}`
        );
      } else {
        Alert.alert("Error", "OCR and translation failed. Please try again.");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        `Failed to process image: ${error.response ? error.response.data.error : error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Function to clear all data
  const clearData = () => {
    setSelectedImage(null);
    setExtractedText("");
    setTranslatedText("");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>Image Text Translator</Text>
        <View style={styles.languageSection}>
          <Text style={styles.label}>Target Language:</Text>
          <Picker
            selectedValue={targetLang}
            onValueChange={setTargetLang}
            style={styles.picker}
          >
            <Picker.Item label="English" value="en" />
            <Picker.Item label="Spanish" value="es" />
            <Picker.Item label="French" value="fr" />
          </Picker>
        </View>

        <TouchableOpacity
          style={styles.imagePicker}
          onPress={pickImage}
          activeOpacity={0.7}
        >
          <Text style={styles.imagePickerText}>Select Image</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cameraButton}
          onPress={captureImage}
          activeOpacity={0.7}
        >
          <Text style={styles.cameraButtonText}>Capture Image</Text>
        </TouchableOpacity>

        {selectedImage && (
  <View style={styles.imageSection}>
    <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
    <View style={styles.buttonContainer}>
      <Button
        title={isLoading ? "Processing..." : "Extract & Translate Text"}
        onPress={processImage}
        disabled={isLoading}
        style={styles.translatebtn}
      />
      <Button title="Clear" onPress={clearData} color="#d9534f" style={styles.clearbtn} />
    </View>
  </View>
)}
        {extractedText ? (
          <View style={styles.resultSection}>
            <Text style={styles.resultLabel}>Extracted Text:</Text>
            <Text style={styles.resultText}>{extractedText}</Text>
          </View>
        ) : null}

        {translatedText ? (
          <View style={styles.resultSection}>
            <Text style={styles.resultLabel}>Translated Text:</Text>
            <Text style={styles.resultText}>{translatedText}</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  content: {
    padding: 20,
    marginVertical: 30,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    padding: 15,
    backgroundColor: "#007bff",
    borderRadius: 10,
    marginBottom: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  languageSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
    color: "#555",
  },
  picker: {
    height: 50,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 10,
  },
  imagePicker: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    borderRadius: 50,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#007bff",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  imagePickerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cameraButton: {
    backgroundColor: "#28a745",
    paddingVertical: 15,
    borderRadius: 50,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#28a745",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  cameraButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  imageSection: {
    marginBottom: 20,
    alignItems: "center",
    borderRadius: 5,
    backgroundColor: "#f8f9fa",
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    justifyContent: "center", // Ensure centered content
    width: '100%',
  },
  imagePreview: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginBottom: 15,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  resultSection: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 5,
    backgroundColor: "#f8f9fa",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    alignItems: 'flex-start', // Align content to the left
    width: '100%',
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#555",
  },
  resultText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: "row", 
    justifyContent: "space-between", 
    width: '100%', 
    marginTop: 20
  },
  translatebtn: {
    flex: 1,
    marginRight: 10,
  },
  clearbtn: {
    flex: 1,
    marginLeft: 10,
  },
});
