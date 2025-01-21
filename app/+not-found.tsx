import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';

export default function NotFoundScreen() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate initial load
        setTimeout(() => setIsLoading(false), 1000);
    }, []);

    // fix: Added container View that was defined in styles but not used
    return (
        <View style={styles.container}>
            <Stack.Screen 
                options={{ 
                    title: 'Page Not Found',
                    headerStyle: {
                        backgroundColor: '#f5f5f5',
                    },
                    headerTintColor: '#333',
                }} 
            />
            
            {isLoading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <View style={styles.content}>
                    <Text style={styles.errorCode}>404</Text>
                    <Text style={styles.errorMessage}>
                        Oops! The page you're looking for doesn't exist.
                    </Text>
                    <Link href="/(tabs)/home" style={styles.link}>
                        <View style={styles.button}>
                            <Text style={styles.buttonText}>Return Home</Text>
                        </View>
                    </Link>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        padding: 20,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorCode: {
        fontSize: 72,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 10,
    },
    errorMessage: {
        fontSize: 18,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 30,
    },
    link: {
        textDecorationLine: 'none',
    },
    button: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});