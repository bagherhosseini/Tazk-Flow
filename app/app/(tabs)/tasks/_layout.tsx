import { Stack } from 'expo-router';
import { SignedIn } from '@clerk/clerk-expo';

export default function TasksLayout() {
    return (
        <SignedIn>
            <Stack
                initialRouteName="personalTasks"
                screenOptions={{
                    headerShown: false,
                    title: '',
                }}
            >
                {/* <Stack.Screen
                    name="personalTasks"
                />
                <Stack.Screen
                    name="projectsTasks"
                />
                <Stack.Screen
                    name="[id]"
                /> */}
            </Stack>
        </SignedIn>
    );
}
