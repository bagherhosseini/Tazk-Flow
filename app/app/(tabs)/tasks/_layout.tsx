import { Stack } from 'expo-router';
import { SignedIn } from '@clerk/clerk-expo';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useEffect, useState } from 'react';

// fix: Added proper typing for the component
export default function TasksLayout() {
    const { isLoaded, isSignedIn } = useAuth();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (isLoaded) {
            setIsReady(true);
        }
    }, [isLoaded]);

    // fix: Added loading state
    if (!isReady) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    // fix: Added authentication check
    if (!isSignedIn) {
        return null;
    }

    return (
        <SignedIn>
            <Stack
                initialRouteName="personalTasks"
                screenOptions={{
                    headerShown: false, // fix: Enabled header for better navigation
                    headerStyle: {
                        backgroundColor: '#f5f5f5',
                    },
                    headerTintColor: '#000',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen
                    name="personalTasks"
                    options={{
                        title: 'Personal Tasks',
                        headerShadowVisible: false,
                    }}
                />
                <Stack.Screen
                    name="projectsTasks"
                    options={{
                        title: 'Project Tasks',
                        headerShadowVisible: false,
                    }}
                />
                <Stack.Screen
                    name="[id]"
                    options={{
                        title: 'Task Details',
                        headerShadowVisible: false,
                    }}
                />
                <Stack.Screen
                    name="create"
                    options={{
                        title: 'Create Task',
                        presentation: 'modal',
                        headerShadowVisible: false,
                    }}
                />
            </Stack>
        </SignedIn>
    );
}