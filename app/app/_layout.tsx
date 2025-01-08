import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

import { tokenCache } from '../cache';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

  if (!publishableKey) {
    throw new Error('Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env')
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <Slot />
        <StatusBar style="light" />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
