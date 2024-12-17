import React, { useState } from 'react';
import { View, Text, Button, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const Beam = () => {
  const [imageUri, setImageUri] = useState(null);
  const [extractedText, setExtractedText] = useState(null);

  // Request permission to access the media library
  const pickImage = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
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

  // Extract text using Hugging Face's Donut API
  const extractTextFromImage = async (uri) => {
    try {
      // Prepare the image for upload (use FormData for file upload)
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        name: 'donut-image.jpg',
        type: 'image/jpeg',
      });

      // Replace with your Hugging Face API endpoint and token
      const apiKey = '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'; // Get your key from Hugging Face
      const apiUrl = 'https://api-inference.huggingface.co/models/donut';  // Use Donut model's URL

      const response = await axios.post(apiUrl, formData, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Extract text from the response
      const result = response.data;
      if (result && result.generated_text) {
        setExtractedText(result.generated_text);
      } else {
        setExtractedText('No text found in the image');
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      setExtractedText('Error extracting text');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Button title="Pick an Image" onPress={pickImage} />
      {imageUri && (
        <Image source={{ uri: imageUri }} style={{ width: 300, height: 300, marginVertical: 20 }} />
      )}
      {extractedText && (
        <View style={{ marginTop: 20 }}>
          <Text>Extracted Text:</Text>
          <Text style={{ marginTop: 10, color: 'blue' }}>{extractedText}</Text>
        </View>
      )}
    </View>
  );
};

export default Beam;
