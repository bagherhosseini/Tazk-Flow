import * as React from 'react';
import { Text, TextInput, TouchableOpacity, View, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SignUpScreen() {
    const { isLoaded, signUp, setActive } = useSignUp();
    const router = useRouter();
    const [emailAddress, setEmailAddress] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [pendingVerification, setPendingVerification] = React.useState(false);
    const [code, setCode] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);

    const onSignUpPress = async () => {
        if (!isLoaded) return;
        try {
            await signUp.create({
                emailAddress,
                password,
            });
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setPendingVerification(true);
        } catch (err) {
            console.error(JSON.stringify(err, null, 2));
        }
    };

    const onVerifyPress = async () => {
        if (!isLoaded) return;
        try {
            const signUpAttempt = await signUp.attemptEmailAddressVerification({
                code,
            });
            if (signUpAttempt.status === 'complete') {
                await setActive({ session: signUpAttempt.createdSessionId });
                router.replace('/');
            } else {
                console.error(JSON.stringify(signUpAttempt, null, 2));
            }
        } catch (err) {
            console.error(JSON.stringify(err, null, 2));
        }
    };

    const VerificationForm = () => (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <Text style={styles.title}>Verify your email</Text>
                <Text style={styles.subtitle}>Enter the code we sent to your email</Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        value={code}
                        onChangeText={setCode}
                        placeholder="Verification code"
                        placeholderTextColor="#666"
                        style={styles.input}
                        keyboardType="number-pad"
                        autoCapitalize="none"
                    />
                </View>

                <TouchableOpacity onPress={onVerifyPress} style={styles.button}>
                    <Text style={styles.buttonText}>Verify Email</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );

    if (pendingVerification) {
        return <VerificationForm />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Sign up to get started</Text>

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

                <TouchableOpacity onPress={onSignUpPress} style={styles.button}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/sign-in')} style={styles.linkButton}>
                    <Text style={styles.linkText}>Already have an account? Sign In</Text>
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
    linkButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    linkText: {
        color: '#2563EB',
        fontSize: 14,
    },
});