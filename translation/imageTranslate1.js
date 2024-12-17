import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, Image } from 'react-native';
import CustomButton from '../../components/CustomButton'; 
import { icons } from '../../constants'; 
import FormField from '../../components/FormField';

const LANGUAGES = ['Tagalog', 'English', 'Spanish', 'French', 'Chinese'];

export const ImageTranslate = () => {
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [extractedText, setExtractedText] = useState("");  //text1
  const [translatedText, setTranslatedText] = useState(""); //text2
  const [isModalVisible1, setIsModalVisible1] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);

  const changeModalVisibility1 = (bool) => setIsModalVisible1(bool);
  const changeModalVisibility2 = (bool) => setIsModalVisible2(bool);
  
  const setLanguage1 = (language) => setSelectedLanguage1(language);
  const setLanguage2 = (language) => setSelectedLanguage2(language);

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
        setTranslatedText(""); // Clear translation when a new image is uploaded
        extractTextFromImage(imageUri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image: " + error.message);
    }
  };

  const extractTextFromImage = async (imageUri) => {
    setIsLoading(true);

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
        setExtractedText(response.data.extracted_text);
      } else {
        Alert.alert("Error", "Text extraction failed. Please try again.");
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

  const translateText = async () => {
    if (!extractedText) {
      Alert.alert("Error", "No text to translate. Please upload an image first.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://192.168.100.153:5000/translate",
        {
          text: extractedText,
          source_lang: sourceLang,
          target_lang: targetLang,
        }
      );

      if (response.status === 200) {
        setTranslatedText(response.data.translated_text);
      } else {
        Alert.alert("Error", "Translation failed. Please try again.");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        `Failed to translate text: ${error.response ? error.response.data.error : error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearData = () => {
    setSelectedImage(null);
    setExtractedText("");
    setTranslatedText("");
  };

  const renderLanguageOptions = (changeModalVisibility, setLanguage) => {
    return LANGUAGES.map((item, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => {
          setLanguage(item);
          changeModalVisibility(false);
        }}
      >
        <Text style={styles.modalText}>{item}</Text>
      </TouchableOpacity>
    ));
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.topSection}></View>


        <View style={styles.content}>
          <Image source={icons.logo} className="-mt-3" />
          <Text className="text-logoColor font-ButtonFont text-3xl">Image Translate</Text>
          
          <FormField 
            enableArrowFunctionality={true} 
            style={styles.languageContainer} 
            editable={false}
          />

          <FormField 
            enableCameraFunctionality={true}
            style={styles.cameraContainer} 
            editable={false} // Ensure this does not block functionality
          />
          
          {/* Language Selection Modal 1 */}
          <TouchableOpacity 
            onPress={() => changeModalVisibility1(true)} 
            style={styles.languageSelector1}
            >
            <Text style={styles.languageText}>{selectedLanguage1}</Text>
            <Image source={icons.dropDown} style={styles.dropdownIcon} />
          </TouchableOpacity>

          {/* Modal for Language 1 */}
          <Modal transparent={true} animationType="fade" visible={isModalVisible1} onRequestClose={() => changeModalVisibility1(false)}>
            <TouchableOpacity onPress={() => changeModalVisibility1(false)} style={styles.modalContainer}>
              <View style={styles.modalView}>
                <ScrollView>
                  {renderLanguageOptions(changeModalVisibility1, setLanguage1)}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Input Block 1 */}
          <ScrollView style={styles.translateBox1}>
            <View>
              <TextInput
                style={styles.textInput1}
                multiline
                value={extractedText}
                editable={false}
              
                placeholder='Scanned text will appear here.'
              />
            </View>
          </ScrollView>

          {/* Language Selection Modal 2 */}
          <TouchableOpacity 
            onPress={() => changeModalVisibility2(true)} 
            style={styles.languageSelector2}
          >
            <Text style={styles.languageText}>{selectedLanguage2}</Text>
            <Image source={icons.dropDown} style={styles.dropdownIcon} />
          </TouchableOpacity>

          {/* Modal for Language 2 */}
          <Modal transparent={true} animationType="fade" visible={isModalVisible2} onRequestClose={() => changeModalVisibility2(false)}>
            <TouchableOpacity onPress={() => changeModalVisibility2(false)} style={styles.modalContainer}>
              <View style={styles.modalView}>
                <ScrollView>
                  {renderLanguageOptions(changeModalVisibility2, setLanguage2)}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>

          <CustomButton title="Translate" containerStyles={styles.translateButton} onPress={translateText}/>

          {/* Input Block 2 - Read-Only */}
          <View style={styles.translateBox2}>
            <TextInput
              style={styles.textInput2}
              multiline
              value={translatedText}
              editable={false}
              placeholder="Translation will appear here"
            />
            <View style={styles.iconContainer}>
              <TouchableOpacity>
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
          </View>
          <Button
            title="Clear"
            onPress={clearData}
            color="#d9534f"
            style={styles.clearbtn}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'white'
  },

  topSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: '#F8D9D2',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },

  cameraContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    right: -105,
    width: '80%',
    height: '150%',
    backgroundColor: '#cbd5e1',
    borderRadius: 10,
    bottom: -15,
  },

  languageContainer: {
    position: 'absolute',
    alignItems: 'center',
    right: -160,
    bottom: -10,
    width: '100%',
    height: '140%',
    backgroundColor: '#8695cf',
    borderRadius: 10,
  },

  languageSelector1: {
    backgroundColor: 'black',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    width: '35%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 290, // Move it above the translateBox
    position: 'absolute',  // Absolute positioning to control placement
    top: -40,  // Position it relative to the container
    left: 30,
    zIndex: 1,  // Ensure it appears above other elements
  },

  languageSelector2: {
    backgroundColor: 'black',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    width: '35%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 320, // Move it above the translateBox
    position: 'absolute',  // Absolute positioning to control placement
    top: -70,  // Position it relative to the container
    left: 225,
    zIndex: 1,  // Ensure it appears above other elements
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

  modalContainer: {
    flex: 1,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
    height: '100%',
  },

  modalView: {
    backgroundColor: '#A9B3E4',
    borderRadius: 10,
    padding: 20,
    width: '75%',
    maxHeight: '50%',
  },

  modalText: {
    fontSize: 20,
    fontFamily: 'CooperLtBt-Regular',
    color: 'white',
    marginVertical: 10,
    textAlign: 'center',
  },

  translateBox1: {
    backgroundColor: '#8695cf',
    borderRadius: 15,
    width: '80%',
    padding: 15,
    marginVertical: 2,  // Adjust vertical margin
    alignSelf: 'center',
    minHeight: 190, // Use minHeight instead of fixed height
    marginTop: -25, 
    marginBottom: 80,
    zIndex: -1,
  },

  translateBox2: {
    backgroundColor: '#8695cf',
    borderRadius: 15,
    width: '80%',
    padding: 15,
    marginVertical: 2,  // Adjust vertical margin
    alignSelf: 'center',
    minHeight: 190, // Use minHeight instead of fixed height
    marginTop: 75, 
    marginBottom: 10,
     
  },

  textInput1: {
    position: 'absolute',
    fontSize: 19,
    fontFamily: 'CaveatBrush-Regular',
    color: 'white',
    paddingVertical: 2,
    paddingHorizontal: 7,
    marginTop: 30,
    marginBottom: 20,
    textAlignVertical: 'top',  // Ensures multiline input aligns at the top
  },

  textInput2: {
    position: 'absolute',
    fontSize: 19,
    fontFamily: 'CaveatBrush-Regular',
    color: 'white',
    paddingVertical: 2,
    paddingHorizontal: 18,
    marginTop: 30,
    marginBottom: 20,
    textAlignVertical: 'top',  // Ensures multiline input aligns at the top
  },
  
  translateButton: {
    position: 'absolute',
    backgroundColor: '#646db2',
    width: '85%',
    paddingVertical: 15,
    borderRadius: 10,
    top: 530,
  },
  
  iconContainer: {
    flexDirection: 'column',
    marginLeft: 250,
    justifyContent: 'space-around',
    marginTop: 10,
  },
  icon: {
    alignItems: 'center',
    width: 20,
    height: 20,
    marginBottom: 15,
    margin: 2,
  },
  
});

export default ImageTranslate;