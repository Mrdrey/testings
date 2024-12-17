import { useNavigation } from '@react-navigation/native';
import { signOut } from "firebase/auth";
import { onValue, push, ref } from "firebase/database";
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { auth, database } from "./firebase";
import Entypo from '@expo/vector-icons/Entypo';
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { languageProfiles, detectLanguageUsingNGrams } from './ngram';
import { StatusBar } from 'expo-status-bar';

const languageEndpoints = {
    "en-fr": "https://dnrhqdf7rxq5x9dv.us-east-1.aws.endpoints.huggingface.cloud",  // English to French
    "en-es": "https://sbyu0cluqvifebsa.us-east4.gcp.endpoints.huggingface.cloud",  // English to Spanish
    "fr-en": "https://mtqndaowbnvvo1yo.us-east-1.aws.endpoints.huggingface.cloud",  // French to English
    "es-en": "https://q5vkvbrjwt9stg31.us-east-1.aws.endpoints.huggingface.cloud",  // Spanish to English
    "fr-es": "https://lqzyycky258tic7q.us-east-1.aws.endpoints.huggingface.cloud",  // French to Spanish
    "es-fr": "https://uipytrqr02bnx75g.us-east-1.aws.endpoints.huggingface.cloud",  // Spanish to French
    "en-de": "https://u5lea2yhe85qoxse.us-east-1.aws.endpoints.huggingface.cloud",  // Spanish to French
    "de-en": "https://ubd034a3gk1uc3j1.us-east-1.aws.endpoints.huggingface.cloud",  // Spanish to French
    "de-es": "https://hvdm18l09qmoa9mn.us-east-1.aws.endpoints.huggingface.cloud",  // Spanish to French
    "es-de": "https://pan12wu6kngamkf7.us-east4.gcp.endpoints.huggingface.cloud",  // Spanish to French
      // Spanish to French
  };
  
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

const ChatbotScreen = () => {
    const navigation = useNavigation();
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [conversationHistory, setConversationHistory] = useState([]);
    const [savedConversations, setSavedConversations] = useState([]);
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const [introSent, setIntroSent] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [showIntro, setShowIntro] = useState(true);
    

    // ocr 
  const [targetLang, setTargetLang] = useState("es");
  const [extractedText, setExtractedText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoadingOCR, setIsLoadingOCR] = useState(false);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [selectedTargetLang, setSelectedTargetLang] = useState("fr");

  
  const languages = [
    { code: "fr", name: "French" },
    { code: "es", name: "Spanish" },
    { code: "en", name: "English" },
    { code: "de", name: "German" },
    
  ];


  
    // pick an image for ocr to extract
    const pickImage = async () => {
      try {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
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
          setExtractedText(""); // Clear extracted text when a new image is selected
          setTranslatedText(""); // Clear previous translation
          processImage(imageUri); // Process image instantly
        }
      } catch (error) {
        Alert.alert("Error", "Failed to pick image: " + error.message);
      }
    };

      // process the image hikhok
     
      const processImage = async (imageUri) => {
        setIsLoadingOCR(true);
        setLoadingMessage("Extracting text...");
        
        const formData = new FormData();
        formData.append("image", {
          uri: imageUri,
          name: "image.jpg",
          type: "image/jpeg",
        });
        
        try {
          const response = await axios.post(
            "https://js-server-tkk5.onrender.com/upload",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          
          if (response.status === 200) {
            const { text } = response.data;
            
            // Detect language of extracted text
            const detectedLanguage = detectLanguageUsingNGrams(text);
            
            // Map language codes to full names
            const languageNames = {
              'en': 'English',
              'es': 'Spanish',
              'de': 'German',
              'fr': 'French'
            };
      
            // Prepare messages for the chat
            const extractedTextMessage = { 
              sender: 'user', 
              text: `Extracted Text: "${text}"` 
            };
      
            const languageDetectionMessage = {
              sender: 'bot',  
              text: `Detected Language: ${languageNames[detectedLanguage] || detectedLanguage}`
            };
            
            // Update messages state with both messages
            setMessages((prevMessages) => [
              ...prevMessages, 
              extractedTextMessage,
              languageDetectionMessage
            ]);
            
            setExtractedText(text);
            setShowTranslationModal(true); // Show language selection modal
          } else {
            Alert.alert("Error", "Failed to extract text. Please try again.");
          }
        } catch (error) {
          const errorMsg = error.response
            ? error.response.data.error
            : error.message;
          Alert.alert("Error", `Failed to process image: ${errorMsg}`);
        } finally {
          setIsLoadingOCR(false);
        }
      };
      
      const handleLanguageSelection = async (targetLang) => {
        setShowTranslationModal(false); // Close modal
        setIsLoadingTranslation(true);
        setLoadingMessage("Translating text...");
      
        try {
          const data = { inputs: extractedText };
          const endpointKey = `en-${targetLang}`;
          const endpoint = languageEndpoints[endpointKey];
          if (!endpoint) throw new Error("Translation endpoint not found");
      
          const result = await query(data, endpoint);
          const translation = result.translation || result[0]?.translation_text || 'Translation failed';
      
          setTranslatedText(translation);
      
          const newBotMessage = { 
            sender: 'bot', 
            text: `Translated to ${languages.find(l => l.code === targetLang)?.name}: "${translation}"` 
          };
          setMessages((prevMessages) => [...prevMessages, newBotMessage]);
        } catch (error) {
          Alert.alert("Error", `Translation failed: ${error.message}`);
        } finally {
          setIsLoadingTranslation(false);
        }
      };

      
    useEffect(() => {
        const fetchChatHistory = async () => {
          try {
            const user = auth.currentUser;
            if (user) {
              const userId = user.uid;
              const chatRef = ref(database, `chatHistory/${userId}`);
      
              // Listen for changes in the chat history
              onValue(chatRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                  const conversations = Object.keys(data).map((key) => ({
                    id: key,
                    messages: data[key]
                  }));
                  setSavedConversations(conversations);
                } else {
                  setSavedConversations([]);
                }
              });
            }
          } catch (error) {
            console.error("Error fetching chat history:", error.message);
          }
        };
      
        fetchChatHistory();
      }, [auth.currentUser]); // Run when auth.currentUser changes

  useEffect(() => {
    if (conversationHistory.length > 0 && !introSent) {
      setIntroSent(true);
    }
  }, [conversationHistory]);

  const saveChatHistory = async (messages) => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

        const userId = user.uid;
        const chatRef = ref(database, `chatHistory/${userId}`);

        // Push new messages to the user's chat history
        await push(chatRef, messages);
        console.log("Chat history saved successfully");
    } catch (error) {
        console.error("Error saving chat history:", error.message);
    }
};

const handleUserInput = async () => {
  if (!inputText.trim()) return;

  if (showIntro) setShowIntro(false); // Hide intro on first message

  const newUserMessage = { sender: 'user', text: inputText };
  setMessages((prevMessages) => [...prevMessages, newUserMessage]);
  setIsLoading(true);

  // Define intents and their patterns
  const intents = [
    // Greeting Intent
    {
        name: 'greeting',
        pattern: /^(hello|hi|hey|greetings|good morning|good evening|good afternoon)/i,
        handler: () => 'Hello! How can I assist you today?',
    },
    // Help Intent
    {
        name: 'help',
        pattern: /^(help|what can you do|commands|features)/i,
        handler: () => 'I can assist with translations. Try typing: "Translate \'apple\' to French". Supported languages: English, French, Spanish, and German.',
    },
    // Language Support Inquiry
    {
        name: 'language_support',
        pattern: /^(what languages do you support|supported languages|languages available|languages)/i,
        handler: () => 'I support the following languages: English, French, Spanish, and German. Let me know if you’d like to translate something!',
    },
    // Translation Intent
    {
      name: 'translate',
      pattern: /translate\s*['"]([^'"]+)['"] to (\w+)/i,
      handler: async (match) => {
        const wordToTranslate = match[1];
        const targetLanguage = match[2].toLowerCase();

        let endpoint = null;
        const languagePairs = {
          'en-fr': ['english', 'french', 'en', 'fr'],
          'en-es': ['english', 'spanish', 'en', 'es'],
          'en-de': ['english', 'german', 'en', 'de'],
          'fr-en': ['french', 'english', 'fr', 'en'],
          'es-en': ['spanish', 'english', 'es', 'en'],
          'de-en': ['german', 'english', 'de', 'en'],
        };

        // Find the appropriate language pair
        let sourceLang = 'en'; // Default to English as source
        for (const [pair, validLanguages] of Object.entries(languagePairs)) {
          if (validLanguages.includes(targetLanguage)) {
            endpoint = pair;
            break;
          }
        }

        if (!endpoint) {
          return 'Sorry, I currently do not support that language pair. Supported languages: English, French, Spanish, and German.';
        }

        try {
          // Ensure you have the correct query and languageEndpoints
          const response = await query(
            { 
              inputs: wordToTranslate,
              source_lang: sourceLang,
              target_lang: endpoint.split('-')[1]
            }, 
            languageEndpoints[endpoint]
          );

          // Extract translation from response
          const translation = 
            response.translation || 
            response[0]?.translation_text || 
            'Translation failed';

          return `Translation of "${wordToTranslate}" to ${targetLanguage}: ${translation}`;
        } catch (error) {
          return `Translation error: ${error.message}`;
        }
      },
    },
    // Goodbye Intent
    {
        name: 'goodbye',
        pattern: /^(goodbye|bye|see you|later|take care|farewell)/i,
        handler: () => 'Goodbye! Have a great day!',
    },
];


  // Match inputText with intents
  let botResponse = 'I did not understand your request.';
  for (const intent of intents) {
    const match = inputText.match(intent.pattern);
    if (match) {
      botResponse = await intent.handler(match);
      break;
    }
  }

  const newBotMessage = { sender: 'bot', text: botResponse };
  setMessages((prevMessages) => [...prevMessages, newBotMessage]);
  setIsLoading(false);
  setInputText('');

  // Update conversation history state
  const updatedHistory = [...conversationHistory, newUserMessage, newBotMessage];
  setConversationHistory(updatedHistory);
};


  const startNewConversation = async () => {
    // Save the current conversation before resetting
    if (conversationHistory.length > 0) {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;
        const chatRef = ref(database, `chatHistory/${userId}`);
        
        // Push new conversation to the user's chat history
        try {
          await push(chatRef, conversationHistory);
          console.log("Chat history saved successfully");
        } catch (error) {
          console.error("Error saving chat history:", error.message);
        }
      } else {
        console.error("User not authenticated");
      }
    }
  
    // Reset state for a new conversation
    setMessages([]);
    setConversationHistory([]);
    setSelectedConversation(null); // Deselect any selected conversation
    setShowIntro(true); // Show intro
    setIsSidebarVisible(false); // Close the sidebar if it's open
  };
  
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // No need to clear saved conversations, so remove the following line if present:
      // setSavedConversations([]); 
      navigation.navigate('Login'); // Navigate to the Login screen
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to log out. Please try again.");
    }
  };
  
  
  const handleSelectConversation = (savedConvo) => {
    setSelectedConversation(savedConvo);
    setIsSidebarVisible(false); // Close the sidebar
  };
  
 
  const renderSavedConversation = (savedConvo) => {
    const firstMessage = savedConvo.messages[savedConvo.messages.length - 1]?.text || '';
    const lastMessage = savedConvo.messages[0]?.text || 'Empty conversation';
  
    return (
      <TouchableOpacity
        key={savedConvo.id}
        style={styles.savedConversationContainer}
        onPress={() => {
          setSelectedConversation(savedConvo); // Set the selected conversation
          setIsSidebarVisible(false); // Close the sidebar
          setShowIntro(false); // Remove intro
        }}
      >
        <Text style={styles.savedConversationHeader}>
          {new Date(savedConvo.id).toLocaleString()}
        </Text>
        <Text style={styles.savedConversationPreview} numberOfLines={2}>
          {lastMessage}
        </Text>
        {firstMessage && (
          <Text style={styles.savedConversationFirstMessage} numberOfLines={1}>
            ...{firstMessage}
          </Text>
        )}
      </TouchableOpacity>
    );
  };
  

  return (
    <View style={styles.container}>
       <Modal
  transparent={true}
  animationType="fade"
  visible={showTranslationModal}
  onRequestClose={() => setShowTranslationModal(false)}
>
  <View style={styles.modalBackground}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalHeader}>Select Target Language</Text>
      <View style={styles.languageList}>
        {languages.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={styles.languageButton}
            onPress={() => handleLanguageSelection(language.code)}
          >
            <Text style={styles.languageText}>{language.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setShowTranslationModal(false)}
      >
        <Text style={styles.closeButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
<Modal
        transparent={true}
        animationType="fade"
        visible={isLoadingOCR || isLoadingTranslation}
        onRequestClose={() => {}}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.modalText}>{loadingMessage}</Text>
          </View>
        </View>
      </Modal>

      {/* Sidebar */}
      {isSidebarVisible && (
        <View style={styles.sidebar}>
          <TouchableOpacity
            onPress={() => setIsSidebarVisible(false)}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          
          {/* Start New Conversation Button */}
          <TouchableOpacity
            onPress={startNewConversation}
            style={styles.startConversationButton}
          >
            <Text style={styles.startConversationText}>Start New Conversation</Text>
          </TouchableOpacity>


          <Text style={styles.sidebarTitle}>Chat History</Text>
          <View style={styles.divider} />
          
          <ScrollView
           showsHorizontalScrollIndicator={false}
           showsVerticalScrollIndicator={false}
           contentContainerStyle={styles.scrollContent}
          >
            {savedConversations.length === 0 ? (
              <Text style={styles.noHistoryText}>No saved conversations.</Text>
            ) : (
                savedConversations
                .slice() // Create a shallow copy of the array to avoid mutating the state
                .sort((a, b) => b.id - a.id) // Sort by descending order of IDs (timestamps)
                .map(renderSavedConversation)
            )}
          </ScrollView>
           {/* Logout Button at the bottom */}
    
        </View>
      )}

      {/* Main Chat Content */}
      <View style={[
        styles.mainContent, 
        isSidebarVisible && styles.shiftedMainContent
      ]}>
        <TouchableOpacity
          onPress={() => setIsSidebarVisible(true)}
          style={styles.openButton}
        >
          {!isSidebarVisible && <Text style={styles.openButtonText}>☰</Text>}
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.chatContainer} keyboardShouldPersistTaps="handled">
  {selectedConversation ? (
    <>
      <Text style={styles.selectedConversationHeader}>
      </Text>
      {selectedConversation.messages.map((message, index) => (
        <View
          key={index}
          style={[
            styles.message,
            message.sender === 'user' ? styles.userMessage : styles.botMessage,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              message.sender === 'user' && styles.userMessageText,
            ]}
          >
            {message.text}
          </Text>
        </View>
      ))}
    </>
  ) : showIntro ? (
    <View style={styles.introContainer}>
      <Text style={styles.welcomeMessage}>LingoBot</Text>
      <Text style={styles.instructionText}>To use this app, type a message in the format:</Text>
      <Text style={styles.exampleText}>"Translate 'apple' to French"</Text>
      <Text style={styles.languageInfo}>
        Supported languages: English (en), French (fr), Spanish (es)
      </Text>
      <Text style={styles.instructionText}>
        Start typing and hit "Send" to receive a translation.
      </Text>
    </View>
  ) : (
    messages.map((message, index) => (
      <View
        key={index}
        style={[
          styles.message,
          message.sender === 'user' ? styles.userMessage : styles.botMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            message.sender === 'user' && styles.userMessageText,
          ]}
        >
          {message.text}
        </Text>
      </View>
    ))
  )}
</ScrollView>



        {/* Input Container */}
        {!selectedConversation && (
  <View style={styles.inputContainer}>
    <TextInput
      style={styles.input}
      placeholder="Type a message..."
      value={inputText}
      onChangeText={setInputText}
    />
    <TouchableOpacity style={styles.pickImage} onPress={pickImage}>
    <Entypo name="images" size={24} color="black" />
    </TouchableOpacity>


    <TouchableOpacity onPress={handleUserInput} style={styles.sendButton}>
      <Text style={styles.sendButtonText}>Send</Text>
    </TouchableOpacity>
  </View>
)}
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
        flex: 1,
        padding: 0,
        justifyContent: 'flex-end',
        backgroundColor: '#fff',
    },
    sidebar: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: "75%",
      backgroundColor: "rgba(255, 255, 255, 0.95)", // More opaque for floating effect
      shadowColor: "gray",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 10, // Increased elevation for floating effect
      padding: 20,
      zIndex: 100, // High z-index to ensure it floats above main content
    },
    closeButton: {
      alignSelf: "flex-end",
      marginBottom:10,
      
    },
    closeButtonText: {
      fontSize: 16,
      color: "#6c757d",
    },
    startConversationButton: {
      backgroundColor: "#0A3981",
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 5,
      marginTop:10,
      marginBottom: 20,
      alignItems: "center",
    },
    imageToTextButton: {
      backgroundColor: "#007bff",
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 5,
      marginBottom: 20,
      alignItems: "center",
    },
    imageToTextButtonText:{
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "600",
    },
    startConversationText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "600",
    },
    sidebarTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: "#343a40",
      marginBottom: 10,
    },
    divider: {
      height: 1,
      backgroundColor: "#dee2e6",
      marginVertical: 10,
    },
    noHistoryText: {
      color: "#6c757d",
      fontStyle: "italic",
    },
    savedConversationContainer: {
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#e9ecef",
    },
    savedConversationHeader: {
      fontSize: 14,
      color: "#495057",
      marginBottom: 5,
    },
    savedConversationPreview: {
      fontSize: 16,
      color: "#212529",
    },
    savedConversationLastMessage: {
      fontSize: 14,
      color: "#868e96",
    },
    mainContent: {
      flex: 1,
      padding: 20,
      backgroundColor: "#f8f9fa",
      zIndex: 1,
      // When sidebar is visible, add a slight overlay effect
      opacity: 1,
      transition: 'opacity 0.3s ease-in-out',
    },
    shiftedMainContent: {
      // When sidebar is active, slightly dim and scale down the main content
      transform: [{ scale: 0.9 }],
      borderRadius: 20,
      overflow: 'hidden',
      opacity: 0.7,
    },
    openButton: {
      position: "absolute",
      
      left: 20,
      zIndex: 3, // Ensure it's above both the sidebar and main content
    },
    openButtonText: {
      fontSize: 24,
      color: "#0A3981",
    },
    chatContainer: {
      flexGrow: 1,
      paddingBottom: 20,
    },
    introContainer: {
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      padding: 20,
    },
    welcomeMessage: {
      fontSize: 24,
      fontWeight: "700",
      color: "#343a40",
      marginBottom: 10,
    },
    instructionText: {
      fontSize: 16,
      color: "#495057",
      marginVertical: 5,
      textAlign: "center",
    },
    exampleText: {
      fontSize: 16,
      fontStyle: "italic",
      color: "#007bff",
      marginVertical: 10,
    },
    languageInfo: {
      fontSize: 14,
      color: "#6c757d",
      marginVertical: 5,
    },
    message: {
      marginVertical: 5,
      padding: 10,
      borderRadius: 8,
      marginTop: 10,
    },
    userMessage: {
      alignSelf: "flex-end",
      backgroundColor: "#0A3981",
      marginTop: 50,
    },
    userMessageText: {
      color: "#ffffff",
    },
    botMessage: {
      alignSelf: "flex-start",
      backgroundColor: "#e9ecef",
    },
    messageText: {
      fontSize: 16,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderTopColor: "#dee2e6",
      
     
    },
    input: {
      flex: 1,
      height: 40,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: "#0A3981",
      borderRadius: 20,
      backgroundColor: "#ffffff",
      marginRight: 10,
    },
    sendButton: {
      backgroundColor: "#0A3981",
      borderRadius: 20,
      paddingVertical: 10,
      paddingHorizontal: 15,
    },
    sendButtonText: {
      color: "#ffffff",
      fontSize: 16,
    },
    selectedConversationHeader: {
      fontSize: 16,
      fontWeight: "600",
      color: "#495057",
      marginBottom: 10,
      marginTop: 70,
    },
    logoutButton: {
        backgroundColor: "#dc3545", // Bootstrap-like danger color
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginTop: 10,
        alignItems: "center",
      },
      logoutButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
      },
      modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
      },
      modalContainer: {
        width: '80%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      },
      modalHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
      },
      languageList: {
        width: '100%',
        marginBottom: 15,
      },
      languageButton: {
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
      },
      languageText: {
        fontSize: 16,
        color: '#333',
      },
      closeButton: {
        backgroundColor: '#ff5c5c',
        padding: 10,
        borderRadius: 8,
        width: '50%',
        alignItems: 'center',
      },
      closeButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
      },
  pickImage:{
   paddingHorizontal:10
  },
  scrollContent: {
    padding: 20,
  },
});
export default ChatbotScreen;