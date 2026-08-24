import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
import { loadSessionToken, clearSession } from '../services/session';
import { setAuthToken, getProfile } from '../services/api';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [booting, setBooting] = useState(true);
  const [initialRoute, setInitialRoute] = useState<'Landing' | 'MainTabs'>('Landing');

  useEffect(() => {
    (async () => {
      try {
        const token = await loadSessionToken();
        if (token) {
          setAuthToken(token);
          await getProfile();
          setInitialRoute('MainTabs');
        }
      } catch {
        await clearSession();
        setAuthToken(null);
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  if (booting) {
    return (
      <View style={styles.loader}>
        <Text style={styles.loaderText}>TalentScope AI</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        key={initialRoute}
        initialRouteName={initialRoute}
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

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: '#f7f9fb',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loaderText: {
    fontFamily: 'Geist_700Bold',
    fontSize: 24,
    fontWeight: '700',
    color: '#000000'
  }
});
