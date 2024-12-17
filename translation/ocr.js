import React, { useState } from 'react';
import { View, Text, Button, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const OcrApp = () => {
  const [imageUri, setImageUri] = useState(null);
  const [extractedText, setExtractedText] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to pick an image from the gallery
  const pickImage = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access camera roll is required!");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      setImageUri(pickerResult.uri);
      extractTextFromImage(pickerResult.uri);
    }
  };

  // Function to extract text from image by uploading it to the Flask server
  const extractTextFromImage = async (uri) => {
    const formData = new FormData();
    formData.append('image', {
      uri: uri,
      type: 'image/jpeg',
      name: 'image.jpg',
    });

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://192.168.100.153:5000/ocr', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setExtractedText(response.data.extracted_text);
    } catch (err) {
      setError('Error extracting text from image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Pick an Image" onPress={pickImage} />
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.image} />
      )}
      {loading && <Text>Loading...</Text>}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {extractedText && (
        <View style={styles.textContainer}>
          <Text style={styles.header}>Extracted Text:</Text>
          <Text style={styles.text}>{extractedText}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 300,
    height: 300,
    marginVertical: 20,
  },
  textContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  header: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  text: {
    marginTop: 10,
    color: 'blue',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
});

export default OcrApp;
