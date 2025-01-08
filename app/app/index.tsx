import { useAuth } from '@clerk/clerk-expo';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { Text, View, StyleSheet, Pressable, SafeAreaView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : RNStatusBar.currentHeight || 0;

export default function Page() {
    const router = useRouter();
    const { isSignedIn } = useAuth();

    useFocusEffect(() => {
        if (isSignedIn) {
            router.replace('/(tabs)/home');
        }
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            {/* Header Section */}
            <View style={styles.header}>
                <MaterialCommunityIcons
                    name="checkbox-marked-circle-outline"
                    size={40}
                    color="#FFFFFF"
                />
                <Text style={styles.title}>TaskMaster</Text>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
                <Text style={styles.welcomeText}>Welcome to</Text>
                <Text style={styles.appName}>TaskMaster</Text>
                <Text style={styles.subtitle}>
                    Organize your tasks efficiently and boost your productivity
                </Text>

                {/* Sign In Button */}
                <Pressable
                    style={styles.signInButton}
                    onPress={() => router.push('/(auth)/sign-in')}
                >
                    <Text style={styles.signInText}>Sign In</Text>
                    <MaterialCommunityIcons
                        name="arrow-right"
                        size={20}
                        color="#FFFFFF"
                    />
                </Pressable>

                {/* Additional Info */}
                <Text style={styles.noAccountText}>
                    Don't have an account?{' '}
                    <Text
                        style={styles.registerLink}
                        onPress={() => router.push('/(auth)/sign-up')}
                    >
                        Register
                    </Text>
                </Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Get started today and take control of your tasks
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
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
    },
    appName: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        color: '#B0B0B0',
        textAlign: 'center',
        marginBottom: 48,
        paddingHorizontal: 20,
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
    },
    signInText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
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
    },
});