import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
// Mapping of language pairs to endpoints
const languageEndpoints = {
  "en-fr": "https://dnrhqdf7rxq5x9dv.us-east-1.aws.endpoints.huggingface.cloud",  // English to French
  "en-es": "https://sbyu0cluqvifebsa.us-east4.gcp.endpoints.huggingface.cloud",  // English to Spanish
  "fr-en": "https://mtqndaowbnvvo1yo.us-east-1.aws.endpoints.huggingface.cloud",  // French to English
  "es-en": "https://q5vkvbrjwt9stg31.us-east-1.aws.endpoints.huggingface.cloud",  // Spanish to English
  "fr-es": "https://lqzyycky258tic7q.us-east-1.aws.endpoints.huggingface.cloud",

  "es-fr": "https://uipytrqr02bnx75g.us-east-1.aws.endpoints.huggingface.cloud",
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
  const [languagePair, setLanguagePair] = useState('en-es');  // Default language pair

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
