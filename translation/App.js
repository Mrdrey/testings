import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import ChatbotScreen from './screens/ChatbotScreen';
import { auth } from './screens/firebase';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import BottomTabNavigator from './navigation/BottomTabNavigator';
const Stack = createStackNavigator();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true); // User is logged in
      } else {
        setIsLoggedIn(false); // User is not logged in
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isLoggedIn ? 'ChatbotScreen' : 'Login'}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerLeft: () => null, headerShown: false }} // Hide the back button
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerLeft: () => null, headerShown: false }} // Hide the back button
        />
        <Stack.Screen
          name="ChatbotScreen"
          component={BottomTabNavigator}
          options={{ headerShown: false }} // Hide the header for the drawer
        />
       
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
