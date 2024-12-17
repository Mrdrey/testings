import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { auth } from './firebase'; // Ensure the path to your firebase.js is correct
import { signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const Profile = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigation.navigate('Login'); // Navigate back to login screen after logout
      })
      .catch((error) => {
        console.error('Error signing out:', error);
      });
  };

  // Get the first letter of the email
  const firstLetter = user ? user.email.charAt(0).toUpperCase() : '';

  return (
    <View style={styles.container}>
      {user ? (
        <View style={styles.content}>
          <View style={styles.userInfo}>
            {/* User Image: Display the first letter of the email */}
            <View style={styles.profileImage}>
              <Text style={styles.profileImageText}>{firstLetter}</Text>
            </View>

            <Text style={styles.header}>Welcome, {user.displayName || 'User'}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.loadingText}>Loading...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between', // Aligns content at top and bottom
  },
  content: {
    flex: 1,
    justifyContent: 'space-between', // Ensure content is spaced between
    alignItems: 'center', // Align children (profile info) to the center horizontally
    paddingBottom: 30, // To provide space for the button at the bottom
  },
  userInfo: {
    alignItems: 'center', // Align user info vertically centered
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0A3981', // Blue background
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#0A3981',
  },
  email: {
    fontSize: 18,
    marginBottom: 20,
    color: '#555',
  },
  button: {
    backgroundColor: '#0A3981',
    padding: 12,
    borderRadius: 8,
    width: '80%', // Adjust width to make it look better
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#555',
  },
});

export default Profile;
