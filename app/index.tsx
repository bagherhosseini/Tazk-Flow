import { useAuth } from '@clerk/clerk-expo';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { 
    Text, 
    View, 
    StyleSheet, 
    Pressable, 
    SafeAreaView, 
    Platform, 
    StatusBar as RNStatusBar,
    ActivityIndicator,
    Dimensions,
    Animated
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? RNStatusBar.currentHeight || 44 : RNStatusBar.currentHeight || 0;
const { width } = Dimensions.get('window');

export default function Page() {
    const router = useRouter();
    const { isSignedIn, isLoaded } = useAuth();
    // fix: Removed isAnimating state as it was causing issues with the loading state
    
    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    // Start entrance animations
    useEffect(() => {
        // fix: Reduced timeout and only animate if auth is loaded
        if (isLoaded) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [isLoaded]);

    // fix: Simplified navigation logic
    useFocusEffect(
        useCallback(() => {
            if (isLoaded && isSignedIn) {
                router.replace('/(tabs)/home');
            }
        }, [isLoaded, isSignedIn])
    );

    // fix: Only show loading when auth is not loaded
    if (!isLoaded) {
        return (
            <SafeAreaView style={[styles.container, styles.loadingContainer]}>
                <StatusBar style="light" />
                <ActivityIndicator size="large" color="#1E88E5" />
                <Text style={styles.loadingText}>Loading Tazk Flow...</Text>
            </SafeAreaView>
        );
    }

    // fix: Show the main UI if user is not signed in
    if (!isSignedIn) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar style="light" />

                <Animated.View 
                    style={[
                        styles.header,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <MaterialCommunityIcons
                        name="checkbox-marked-circle-outline"
                        size={40}
                        color="#FFFFFF"
                    />
                    <Text style={styles.title}>Tazk Flow</Text>
                </Animated.View>

                <Animated.View 
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <Text style={styles.welcomeText}>Welcome to</Text>
                    <Text style={styles.appName}>Tazk Flow</Text>
                    <Text style={styles.subtitle}>
                        Organize your tasks efficiently and boost your productivity
                    </Text>

                    <Pressable
                        style={({ pressed }) => [
                            styles.signInButton,
                            pressed && styles.signInButtonPressed
                        ]}
                        onPress={() => router.push('/(auth)/sign-in')}
                    >
                        <Text style={styles.signInText}>Sign In</Text>
                        <MaterialCommunityIcons
                            name="arrow-right"
                            size={20}
                            color="#FFFFFF"
                        />
                    </Pressable>

                    <Text style={styles.noAccountText}>
                        Don't have an account?{' '}
                        <Text
                            style={styles.registerLink}
                            onPress={() => router.push('/(auth)/sign-up')}
                        >
                            Register
                        </Text>
                    </Text>
                </Animated.View>

                <Animated.View 
                    style={[
                        styles.footer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <Text style={styles.footerText}>
                        Get started today and take control of your tasks
                    </Text>
                </Animated.View>
            </SafeAreaView>
        );
    }

    return null; // fix: Return null if signed in (will be redirected)
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    header: {
        paddingTop: STATUSBAR_HEIGHT + 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        // fix: Added font family for consistent typography
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    welcomeText: {
        fontSize: 24,
        color: '#B0B0B0',
        marginBottom: 8,
        // fix: Added font family for consistent typography
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    appName: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
        // fix: Added font family for consistent typography
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    subtitle: {
        fontSize: 16,
        color: '#B0B0B0',
        textAlign: 'center',
        marginBottom: 48,
        paddingHorizontal: 20,
        lineHeight: 24,  // fix: Added line height for better readability
    },
    signInButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E88E5',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 30,
        marginBottom: 24,
        gap: 8,
        // fix: Added elevation and shadow for better depth
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    signInButtonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    signInText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        // fix: Added font family for consistent typography
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    noAccountText: {
        color: '#B0B0B0',
        fontSize: 16,
    },
    registerLink: {
        color: '#1E88E5',
        fontWeight: '600',
    },
    footer: {
        padding: 20,
        alignItems: 'center',
    },
    footerText: {
        color: '#666666',
        textAlign: 'center',
        fontSize: 14,
        // fix: Added line height for better readability
        lineHeight: 20,
    },
});