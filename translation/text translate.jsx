import React, { useCallback, useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Animated, FlatList } from 'react-native';
import { icons } from '../../constants';  // Import your icons here
import CustomButton from '../../components/CustomButton';
import supportedLanguages from '../../utils/supportedLanguages';
import { datasets } from '../../utils/DS-EnToEsLang';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import { useDispatch } from 'react-redux';  // Import Redux dispatch
import uuid from 'react-native-uuid';  // For generating unique IDs
import { addHistoryItem } from '../../store/HistorySlice' // Import addHistoryItem action
import { getSentenceEmbedding } from '../../utils/embeddingUtils'; // Adjust import path as necessary

export default function TextTranslate(props) {
  const params = props.route.params || {};
  const dispatch = useDispatch();

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [languageTo, setLanguageTo] = useState("es");
  const [languageFrom, setLanguageFrom] = useState("en");
  const [isLoading, setIsLoading] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  const slideAnim = useRef(new Animated.Value(-50)).current;  // Start above the screen

  useEffect(() => {
    if (params.languageTo) setLanguageTo(params.languageTo);
    if (params.languageFrom) setLanguageFrom(params.languageFrom);
  }, [params.languageFrom, params.languageTo]);

  const onSubmit = useCallback(async () => {
    if (!input.trim()) {
      Alert.alert("Error", "Please enter text to translate.");
      setOutput("");
      setIsLoading(false);
      return;
    }
  
    try {
      setIsLoading(true);
      const trimmedInput = input.trim();
      const punctuationMatch = trimmedInput.match(/[!?.,;]+$/);
      const punctuation = punctuationMatch ? punctuationMatch[0] : '';
      const cleanedInput = trimmedInput.replace(/[!?.,;]+$/, '').trim();
  
      let translation = "";
      let usageTag = '';
  
      switch (punctuation) {
        case '?': usageTag = 'question'; break;
        case '!': usageTag = 'exclamation'; break;
        default: usageTag = 'statement'; break;
      }
  
      // Attempt an exact match first
      const exactMatches = datasets.filter(dataset =>
        dataset.input.toLowerCase() === cleanedInput.toLowerCase() &&
        dataset.usageTag === usageTag &&
        dataset.sourceLang === languageFrom &&
        dataset.targetLang === languageTo
      );
  
      if (exactMatches.length > 0) {
        translation = exactMatches[0].translated_text[languageTo];
      } else {
        // Use embeddings for fuzzy matching if no exact match
        const inputEmbedding = await getSentenceEmbedding(cleanedInput);
        let closestMatch = null;
        let highestSimilarity = -1;
  
        for (let dataset of datasets) {
          if (dataset.sourceLang === languageFrom && dataset.targetLang === languageTo) {
            const datasetEmbedding = await getSentenceEmbedding(dataset.input);
            const similarity = cosineSimilarity(inputEmbedding[0], datasetEmbedding[0]);
  
            if (similarity > highestSimilarity) {
              highestSimilarity = similarity;
              closestMatch = dataset;
            }
          }
        }
  
        if (closestMatch && highestSimilarity > 0.8) {
          translation = closestMatch.translated_text[languageTo];
        } else {
          translation = `Translation not found for "${cleanedInput}" with punctuation "${punctuation}"`;
        }
      }
  
      setOutput(translation);
  
      // Create the history item
      const historyItem = {
        id: uuid.v4(), // Generate a new UUID for the history entry
        input: cleanedInput,
        output: translation,
        dateTime: new Date().toISOString(), // Use current date and time in ISO format
      };
  
      console.log('History item dispatched:', historyItem); // Debug log
      dispatch(addHistoryItem(historyItem)); // Dispatch the action to add the item to the history
  
    } catch (error) {
      console.log("Error during translation:", error);
    } finally {
      setIsLoading(false);
    }
  }, [input, languageTo, languageFrom, dispatch]);
  

  // Utility function to compute cosine similarity
  function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
    const normA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (normA * normB);
  }

  const copyToClipboard = useCallback(async () => {
    await Clipboard.setStringAsync(output);

    // Show "Copied!" message with animation
    setShowCopiedMessage(true);
    Animated.timing(slideAnim, {
      toValue: 80,  // Slide in from the top
      duration: 500,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: -50,  // Slide back up
        duration: 500,
        useNativeDriver: true,
      }).start(() => setShowCopiedMessage(false));
    }, 1000);
  }, [output]);

  const textToSpeech = async (text) => {
    const { data, error } = await supabase.functions.invoke('text-to-speech', {
      body: JSON.stringify({ input: text }),
    });
    console.log(data);
    console.log(error);
  };

  return (
    <FlatList
      ListHeaderComponent={
        <>
          <View style={styles.topSection}></View>

          <View style={styles.content}>
            <Image source={icons.logo} />
            <Text style={styles.titleText}>Text Translate</Text>

            {/* Language Selection Modal 1 */}
            <TouchableOpacity
              onPress={() => props.navigation.navigate("languageSelect", { title: "Translate from", selected: languageFrom, mode: 'from', returnScreen: 'TextTranslate' })}
              style={styles.languageSelector1}
            >
              <Text style={styles.languageText}>{supportedLanguages[languageFrom]}</Text>
              <Image source={icons.dropDown} style={styles.dropdownIcon} />
            </TouchableOpacity>

            {/* Input Block 1 */}
            <View style={styles.translateBox}>
              <TextInput
                style={styles.textInput1}
                multiline
                value={input}
                onChangeText={(val) => setInput(val)}
                placeholder="Enter text"
                textAlignVertical="top"
              />
            </View>

            {/* Language Selection Modal 2 */}
            <TouchableOpacity
              onPress={() => props.navigation.navigate("languageSelect", { title: "Translate to", selected: languageTo, mode: 'to', returnScreen: 'TextTranslate' })}
              style={styles.languageSelector2}
            >
              <Text style={styles.languageText}>{supportedLanguages[languageTo]}</Text>
              <Image source={icons.dropDown} style={styles.dropdownIcon} />
            </TouchableOpacity>

            {/* Output Block - Read-Only */}
            <View style={styles.translateBox}>
              <TextInput
                style={styles.textInput2}
                multiline
                value={output}
                editable={false}
                placeholder="Translation will appear here"
                textAlignVertical="top"
              />
            </View>

            {/* Copied Message with Animation */}
            {showCopiedMessage && (
              <Animated.View style={[styles.copiedContainer, { transform: [{ translateY: slideAnim }] }]}>
                <Text style={styles.copiedText}>Copied!</Text>
              </Animated.View>
            )}

            {/* Icon Container */}
            <View style={styles.iconContainer}>
              <TouchableOpacity onPress={copyToClipboard} disabled={output === ""}>
                <Ionicons name="copy" size={24} color="black" style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => textToSpeech(output)}>
                <Image source={icons.audio} style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity>
                <Image source={icons.star} style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity>
                <Image source={icons.share} style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity>
                <Image source={icons.trash} style={styles.icon} />
              </TouchableOpacity>
            </View>

            {/* Translate Button */}
            <CustomButton
              title="Translate"
              onPress={onSubmit}
              isLoading={isLoading}
              containerStyles={styles.customButton}
            />
          </View>
        </>
      }
    />
  );
}

import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window'); // Get device width and height dynamically


const styles = StyleSheet.create({
  topSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
    backgroundColor: '#F8D9D2',
  },

  titleText: { 
    fontSize: 30, 
    fontFamily: 'CooperLtBT-Bold',
    color: '#5e67a7', 
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height * 0.1,
  },
  languageSelector1: {
    backgroundColor: 'black',
    borderRadius: 10,
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.03,
    width: '50%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.5, // 50% of screen width
    marginTop: 320,
    position: 'absolute',
    top: height * -0.07,
    left: 50,
    zIndex: 1,
  },
  languageSelector2: {
    backgroundColor: 'black',
    borderRadius: 10,
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.03,
    width: width * 0.5,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 320,
    position: 'absolute',
    top: 285,
    left: 50,
    zIndex: 1,
  },
  languageText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'CaveatBrush-Regular',
  },
  dropdownIcon: {
    width: 20,
    height: 20,
    marginLeft: 10,
  },
  translateBox: {
    backgroundColor: '#8695cf',
    borderRadius: 15,
    width: '80%',
    padding: 15,
    marginVertical: 2,
    alignSelf: 'center',
    height: 300,
    marginTop: 40,
  },

  textInput1: {
    fontSize: 19,
    fontFamily: 'CaveatBrush-Regular',
    color: 'white',
    paddingVertical: 2,
    paddingHorizontal: 7,
    marginTop: 45,
    marginBottom: 20,
    textAlignVertical: 'top',
    height: '80%',
  },

  textInput2: {
    fontSize: 19,
    fontFamily: 'CaveatBrush-Regular',
    color: 'white',
    paddingVertical: 2,
    paddingHorizontal: 7,
    width: 250,
    marginTop: 50,
    marginBottom: 30,
    textAlignVertical: 'top',
    height: '80%',

  },

  iconContainer: {
    flexDirection: 'column',
    marginLeft: 150,
    justifyContent: 'space-around',
    marginTop: -220,
    right: -40,
  },
  
  icon: {
    alignItems: 'center',
    width: 20,
    height: 20,
    marginBottom: 15,
    margin: 2,
  },

  copiedContainer: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    zIndex: 100,
  },
  copiedText: {
    color: 'black',
    fontSize: 16,
    fontFamily: 'CooperLtBt-Bold',
  },
}); 