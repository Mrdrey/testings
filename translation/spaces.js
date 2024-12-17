import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
// Mapping of language pairs to endpoints
const languageEndpoints = {
  "de-en": "https://ubd034a3gk1uc3j1.us-east-1.aws.endpoints.huggingface.cloud",  // English to French
  "de-es": "https://hvdm18l09qmoa9mn.us-east-1.aws.endpoints.huggingface.cloud",  // English to Spanish
  "de-it": "https://uds0vl03l5hkg9de.us-east4.gcp.endpoints.huggingface.cloud",  // French to English
  "de-tl": "https://m7ticlejkpb3qjbm.us-east4.gcp.endpoints.huggingface.cloud",  // Spanish to English
  "en-de": "https://u5lea2yhe85qoxse.us-east-1.aws.endpoints.huggingface.cloud",
  "en-es": "https://j5totym2vksn2usz.us-east-1.aws.endpoints.huggingface.cloud",
  "en-it": "https://sea5t6wml9puupci.us-east4.gcp.endpoints.huggingface.cloud",
  "en-tl": "https://fz13t3akm679he6h.us-east4.gcp.endpoints.huggingface.cloud",
  "es-tl": "https://qji7yz82gttd4ldj.us-east4.gcp.endpoints.huggingface.cloud",
  "es-de": "https://pan12wu6kngamkf7.us-east4.gcp.endpoints.huggingface.cloud",
  "es-en": "https://q5vkvbrjwt9stg31.us-east-1.aws.endpoints.huggingface.cloud",
  "es-it": "https://bvza0rvmap6r6eeq.us-east4.gcp.endpoints.huggingface.cloud",
  "it-de": "https://y2k7ll7i9kuclxsi.us-east4.gcp.endpoints.huggingface.cloud",
  "it-en": "https://hujfx39n8n7jcxyo.us-east4.gcp.endpoints.huggingface.cloud",
  "it-es": "https://g2zlipl8qfnpntip.us-east4.gcp.endpoints.huggingface.cloud",
  "tl-de": "https://g8hxjh31t4og8mp6.us-east4.gcp.endpoints.huggingface.cloud",
  "tl-en": "https://gscv7n458yz19kio.us-east4.gcp.endpoints.huggingface.cloud",
  "tl-es": "https://hsvdhu8upqzkdx56.us-east-1.aws.endpoints.huggingface.cloud",
  
  // Add more language pair endpoints as needed
};

// Function to make the request to the selected Hugging Face API endpoint
async function query(data, endpoint) {
  const response = await fetch(endpoint, {
    headers: {
      "Accept": "application/json",
      "Authorization": "Bearer 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", // Replace with your Hugging Face API token
      "Content-Type": "application/json"
    },
    method: "POST",
    body: JSON.stringify(data),
  });
  const result = await response.json();
  return result;
}

const Translator = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [languagePair, setLanguagePair] = useState('en-fr');  // Default language pair

  const handleTranslate = async () => {
    setLoading(true);
    try {
      const response = await query({
        inputs: inputText,
        parameters: {}
      }, languageEndpoints[languagePair]);

      setTranslatedText(response[0]?.translation_text || "Translation error");
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedText('Error during translation');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter text to translate"
        value={inputText}
        onChangeText={setInputText}
      />
      <Picker
        selectedValue={languagePair}
        style={styles.picker}
        onValueChange={(itemValue) => setLanguagePair(itemValue)}
      >
        {Object.keys(languageEndpoints).map((pair) => (
          <Picker.Item key={pair} label={pair} value={pair} />
        ))}
      </Picker>
      <Button title="Translate" onPress={handleTranslate} />
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        translatedText && <Text style={styles.translatedText}>{translatedText}</Text>
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
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    width: '100%',
    paddingHorizontal: 10,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 10,
  },
  translatedText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Translator;
