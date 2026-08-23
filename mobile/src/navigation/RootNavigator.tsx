import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LandingScreen from '../screens/auth/LandingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import MainTabNavigator from './MainTabNavigator';
import AnalysisResultsScreen from '../screens/assessment/AnalysisResultsScreen';
import InjuryRiskScreen from '../screens/assessment/InjuryRiskScreen';
import ProgressScreen from '../screens/progress/ProgressScreen';
import CoachProfileScreen from '../screens/marketplace/CoachProfileScreen';
import { Colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background }
        }}
      >
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="AnalysisResults" component={AnalysisResultsScreen} />
        <Stack.Screen name="InjuryRisk" component={InjuryRiskScreen} />
        <Stack.Screen name="Progress" component={ProgressScreen} />
        <Stack.Screen name="CoachProfile" component={CoachProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
