import * as React from 'react';
import { Text, TextInput, TouchableOpacity, View, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useSignIn, useOAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

// Warm up browser helper
export const useWarmUpBrowser = () => {
    React.useEffect(() => {
        void WebBrowser.warmUpAsync();
        return () => {
            void WebBrowser.coolDownAsync();
        };
    }, []);
};

// Initialize WebBrowser
WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
    const { signIn, setActive, isLoaded } = useSignIn();
    const router = useRouter();
    const [emailAddress, setEmailAddress] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);

    // Warm up the browser
    useWarmUpBrowser();

    // Set up Google OAuth
    const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

    const onSignInPress = React.useCallback(async () => {
        if (!isLoaded) return;
        try {
            const signInAttempt = await signIn.create({
                identifier: emailAddress,
                password,
            });

            if (signInAttempt.status === 'complete') {
                await setActive({ session: signInAttempt.createdSessionId });
                router.replace('/home');
            } else {
                console.error(JSON.stringify(signInAttempt, null, 2));
            }
        } catch (err) {
            console.error(JSON.stringify(err, null, 2));
        }
    }, [isLoaded, emailAddress, password]);

    const onGoogleSignInPress = React.useCallback(async () => {
        try {
            const { createdSessionId, signIn, signUp } = await startOAuthFlow({
                redirectUrl: Linking.createURL('/home', { scheme: 'Home' }),
            });

            if (createdSessionId) {
                await setActive!({ session: createdSessionId });
                router.replace('/home');
            }
        } catch (err) {
            console.error(JSON.stringify(err, null, 2));
        }
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to continue</Text>

                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="email-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                        value={emailAddress}
                        onChangeText={setEmailAddress}
                        placeholder="Email"
                        placeholderTextColor="#666"
                        style={styles.input}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="lock-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Password"
                        placeholderTextColor="#666"
                        style={styles.input}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.passwordIcon}>
                        <MaterialCommunityIcons
                            name={showPassword ? "eye-off" : "eye"}
                            size={20}
                            color="#666"
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={onSignInPress} style={styles.button}>
                    <Text style={styles.buttonText}>Sign In</Text>
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.divider} />
                </View>

                <TouchableOpacity onPress={onGoogleSignInPress} style={styles.googleButton}>
                    <MaterialCommunityIcons name="google" size={20} color="#666" style={styles.googleIcon} />
                    <Text style={styles.googleButtonText}>Sign in with Google</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/sign-up')} style={styles.linkButton}>
                    <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 32,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 8,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    passwordIcon: {
        padding: 4,
    },
    input: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#2563EB',
        borderRadius: 8,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#333',
    },
    dividerText: {
        color: '#666',
        paddingHorizontal: 16,
    },
    googleButton: {
        flexDirection: 'row',
        backgroundColor: '#1E1E1E',
        borderRadius: 8,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    googleIcon: {
        marginRight: 12,
    },
    googleButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    linkButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    linkText: {
        color: '#2563EB',
        fontSize: 14,
    },
});