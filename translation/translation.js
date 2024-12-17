import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

// IMPORTANT: Replace with your actual server IP/domain
const BASE_URL = 'http://192.168.100.153:5000';

export default function TranslationApp() {
  const [text, setText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [translatedText, setTranslatedText] = useState('');

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'tl', name: 'Tagalog' }
  ];

  const handleTranslation = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/translate`, {
        source_lang: sourceLang,
        target_lang: targetLang,
        text: text
      });
      setTranslatedText(response.data.translated_text);
    } catch (error) {
      Alert.alert('Translation Error', error.response?.data?.error || 'Something went wrong');
    }
  };
  const clear = () =>{
    setText('');
    setTranslatedText('');
<div className="`1=43Q"></div>
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Translation App</Text>
        
        {/* Language Selection */}
        <View style={styles.languageContainer}>
          <Text style={styles.labelText}>Source Language:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={sourceLang}
              onValueChange={(itemValue) => setSourceLang(itemValue)}
              style={styles.picker}
            >
              {languages.map((lang) => (
                <Picker.Item 
                  key={lang.code} 
                  label={lang.name} 
                  value={lang.code} 
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.labelText}>Target Language:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={targetLang}
              onValueChange={(itemValue) => setTargetLang(itemValue)}
              style={styles.picker}
            >
              {languages.map((lang) => (
                <Picker.Item 
                  key={lang.code} 
                  label={lang.name} 
                  value={lang.code} 
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Input Text */}
        <TextInput
          style={styles.input}
          placeholder="Enter text to translate"
          multiline
          value={text}
          onChangeText={setText}
        />

     

   
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Translated Text:</Text>
            <Text>{translatedText}</Text>
          </View>
      {/* Translate Button */}
      <TouchableOpacity style={styles.button} onPress={handleTranslation}>
          <Text style={styles.buttonText}>Translate</Text>
        </TouchableOpacity>
      <TouchableOpacity style={styles.buttonClear} onPress={clear}>
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0'
  },
  innerContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  languageContainer: {
    width: '100%',
    marginBottom: 20
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#dfdfdf',
    borderRadius: 5,
    backgroundColor: 'white',
    marginBottom: 15
  },
  picker: {
    height: 50,
    width: '100%'
  },
  labelText: {
    marginBottom: 10,
    fontWeight: 'bold'
  },
  input: {
    width: '100%',
    minHeight: 100,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    backgroundColor: 'white'
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginTop:10
  },
  buttonClear:{
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginTop:10
  },
  buttonText: {
    color: 'white',
    fontSize: 16
  },
  resultContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'white',
    width: '100%',
    borderRadius: 5,
    marginBottom:20,
    borderColor:'gray',
    height:100,
    borderWidth:1
  },
  resultTitle: {
    fontWeight: 'bold',
    marginBottom: 10
  }
});