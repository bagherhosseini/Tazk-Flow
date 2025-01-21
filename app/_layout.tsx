import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, useColorScheme } from 'react-native';
import { useFonts } from 'expo-font';
import { Slot, SplashScreen } from 'expo-router';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { tokenCache } from '../cache';

SplashScreen.preventAutoHideAsync().catch(() => {
  console.warn('SplashScreen.preventAutoHideAsync encountered an error');
});

const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#121212',
    text: '#FFFFFF',
    border: '#2C2C2C',
    card: '#1E1E1E',
  },
};

const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FFFFFF',
    text: '#000000',
    border: '#E5E5E5',
    card: '#F5F5F5',
  },
};

// Separate loading component for better organization
const LoadingScreen = () => {
  const colorScheme = useColorScheme();
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: colorScheme === 'dark' ? '#121212' : '#FFFFFF' 
    }}>
      <ActivityIndicator 
        size="large" 
        color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'} 
      />
    </View>
  );
};

// Wrapped component to handle Clerk's initialization
const ClerkInitialized = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded } = useAuth();
  
  if (!isLoaded) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(console.error);
    }
  }, [loaded]);

  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
    }
  }, [error]);

  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw new Error(
      'Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY - Please add it to your .env file'
    );
  }

  if (!loaded) {
    return <LoadingScreen />;
  }

  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={publishableKey}
    >
      <ClerkInitialized>
        <ThemeProvider value={colorScheme === 'dark' ? darkTheme : lightTheme}>
          <View style={{ 
            flex: 1, 
            backgroundColor: colorScheme === 'dark' ? '#121212' : '#FFFFFF' 
          }}>
            <Slot />
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          </View>
        </ThemeProvider>
      </ClerkInitialized>
    </ClerkProvider>
  );
}