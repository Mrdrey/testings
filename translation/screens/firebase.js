import { initializeApp } from "firebase/app";
import { getAuth , initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
// Import other Firebase services if needed (e.g., Firestore, Storage, etc.)
import AsyncStorage from '@react-native-async-storage/async-storage';
// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDh9BpTvRfcMQDwH24LK7BVQlD2owpZmF0",
  authDomain: "mynewproject-44b0c.firebaseapp.com",
  projectId: "mynewproject-44b0c",
  storageBucket: "mynewproject-44b0c.firebasestorage.app",
  messagingSenderId: "198951690484",
  appId: "1:198951690484:web:0ad491f5971d6b62153ea1",
  measurementId: "G-C1S6QK3M6Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage), // Use AsyncStorage for persistence
});
const database = getDatabase(app);
// Export the authentication service to use in other parts of the app
export { auth, database };

