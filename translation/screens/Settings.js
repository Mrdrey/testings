import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const lessons = [
  { id: '1', title: 'Lesson 1: Alphabet and Pronunciation' },
  { id: '2', title: 'Lesson 2: Greetings and Introductions' },
  { id: '3', title: 'Lesson 3: Numbers and Time' },
  { id: '4', title: 'Lesson 4: Basic Grammar' },
  { id: '5', title: 'Lesson 5: Vocabulary Building' },

];

const Settings = ({ navigation }) => {

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Lessons</Text>
      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.lessonItem}
            onPress={() => handleLessonPress(item.id)}
          >
            <Ionicons name="book-outline" size={30} color="#007AFF" style={styles.icon} />
            <Text style={styles.lessonText}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#007AFF" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  icon: {
    marginRight: 10,
  },
  lessonText: {
    flex: 1,
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
});

export default Settings;
