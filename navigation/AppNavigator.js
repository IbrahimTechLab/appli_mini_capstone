import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import PredictionScreen from '../screens/PredictionScreen';
import ResultScreen from '../screens/ResultScreen';
import WeatherScreen from '../screens/WeatherScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#FFA500' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Accueil' }} />
        <Stack.Screen name="Prediction" component={PredictionScreen} options={{ title: 'Prédiction' }} />
        <Stack.Screen name="ResultScreen" component={ResultScreen} options={{ title: 'Résultats' }} />        
        <Stack.Screen name="Weather" component={WeatherScreen} options={{ title: 'Météo' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
