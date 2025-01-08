import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { Platform } from 'react-native';

export default function AuthRoutesLayout() {
    const { isSignedIn } = useAuth();

    if (isSignedIn) {
        return <Redirect href={'/(tabs)/home'} />;
    }

    // Platform-specific routes
    if (Platform.OS === 'web') {
        // Render Web-specific sign-in and sign-up screens
        return (
            <Stack>
                <Stack.Screen name="sign-in" />
                <Stack.Screen name="sign-up" />
            </Stack>
        );
    }

    // Render App-specific sign-in and sign-up screens for mobile
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="sign-in" />
            <Stack.Screen name="sign-up" />
        </Stack>
    );
}
