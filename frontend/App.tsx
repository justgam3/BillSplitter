import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import theme from './src/theme/theme';
import { tokenService } from './src/services/api/tokenService';
import { AuthStackParamList, AppModalParamList } from './src/navigation/types';

// Auth Screens
import WelcomeScreen from './src/screens/auth/WelcomeScreen';
import SignUpScreen from './src/screens/auth/SignUpScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import EmailVerificationScreen from './src/screens/auth/EmailVerificationScreen';

// App Screens & Navigation
import MainTabNavigator from './src/navigation/MainTabNavigator';
import AddExpenseScreen from './src/screens/main/AddExpenseScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppModalStack = createNativeStackNavigator<AppModalParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#212121' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <AuthStack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{ title: 'Sign Up' }}
      />
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Log In' }}
      />
      <AuthStack.Screen
        name="EmailVerification"
        component={EmailVerificationScreen}
        options={{ title: 'Verify Email' }}
      />
    </AuthStack.Navigator>
  );
}

function AppNavigator({ onLogout }: { onLogout: () => void }) {
  return (
    <AppModalStack.Navigator screenOptions={{ headerShown: false }}>
      <AppModalStack.Screen name="MainTabs">
        {() => <MainTabNavigator onLogout={onLogout} />}
      </AppModalStack.Screen>
      <AppModalStack.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{ presentation: 'modal' }}
      />
    </AppModalStack.Navigator>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await tokenService.getToken();
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Listen for auth changes
  useEffect(() => {
    const interval = setInterval(async () => {
      const token = await tokenService.getToken();
      setIsAuthenticated(!!token);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          {isAuthenticated ? (
            <AppNavigator onLogout={handleLogout} />
          ) : (
            <AuthNavigator />
          )}
        </NavigationContainer>
        <StatusBar style="auto" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
