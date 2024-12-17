import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";

const translateWithHF = async (text) => {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/dreyyyy/EN-FR",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer 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`, // Replace with your Hugging Face API token
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return data[0].translation_text;
  } catch (error) {
    console.error("Error fetching translation:", error);
    throw error;
  }
};

export default function App() {
  const [inputText, setInputText] = useState("");
  const [translation, setTranslation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      Toast.show({ type: "error", text1: "Input Required", text2: "Please enter some text to translate." });
      return;
    }
    setLoading(true);
    setTranslation(""); // Clear the previous translation
    try {
      const result = await translateWithHF(inputText);
      setTranslation(result);
    } catch (error) {
      Toast.show({ type: "error", text1: "Translation Failed", text2: error.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Translation App</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter text to translate"
        value={inputText}
        onChangeText={setInputText}
      />
      <TouchableOpacity style={styles.button} onPress={handleTranslate}>
        <Text style={styles.buttonText}>{loading ? "Translating..." : "Translate"}</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" color="#6200ee" />}
      {translation ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Translation:</Text>
          <Text style={styles.resultText}>{translation}</Text>
        </View>
      ) : null}
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    height: 50,
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#6200ee",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resultContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    width: "100%",
  },
  resultTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 5,
  },
  resultText: {
    fontSize: 16,
    color: "#333",
  },
});
