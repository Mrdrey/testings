import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Profile from '../screens/Profile';
import Settings from '../screens/Settings';
import ChatbotScreen from '../screens/ChatbotScreen';
import FontAwesome from '@expo/vector-icons/FontAwesome'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Fontisto from '@expo/vector-icons/Fontisto';
import Feather from '@expo/vector-icons/Feather';
import MatchingGames from '../screens/games';
const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'black',
        tabBarStyle: { backgroundColor: 'white', height: 60 },
        headerTitleAlign:'center',
        headerTintColor: 'white',
        tabBarActiveBackgroundColor:'#0A3981',
        headerStyle:{ backgroundColor:"#0A3981", height:80}
        
      }}
    >
      <Tab.Screen name="ChatbotScreen" component={ChatbotScreen}
      options={{
        title:'Chat Bot',
        tabBarIcon: ({ color, focused }) => (
          <Fontisto name="hipchat" size={24} color={focused ? 'white' : 'black'} />
        ),
      }}
      />
      <Tab.Screen name="Games" component={MatchingGames}   options={{
        title:'Games',
        tabBarIcon: ({ color, focused }) => (
          <FontAwesome name="language" size={24} color={focused ? 'white' : 'black'} />
        ),
      
        
      }}/>
      <Tab.Screen name="Profile" component={Profile}  options={{
        title:'Profile',
        tabBarIcon: ({ color, focused }) => (
          <Feather name="user" size={24} color={focused ? 'white' : 'black'} />
        ),
       
      }} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
