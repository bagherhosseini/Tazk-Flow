import * as React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    ActivityIndicator,
    Animated,
    Dimensions,
} from 'react-native';

interface UploadProgressModalProps {
    visible: boolean;
    status: 'uploading' | 'success' | 'error';
    message: string;
    onClose?: () => void;
}

const UploadProgressModal: React.FC<UploadProgressModalProps> = ({
    visible,
    status,
    message,
    onClose
}) => {
    const [fadeAnim] = React.useState(new Animated.Value(0));

    React.useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <Animated.View
                    style={[
                        styles.modalContent,
                        { opacity: fadeAnim }
                    ]}
                >
                    {status === 'uploading' && (
                        <ActivityIndicator size="large" color="#2563EB" style={styles.icon} />
                    )}
                    {status === 'success' && (
                        <View style={[styles.icon, styles.successIcon]}>
                            <Text style={styles.iconText}>✓</Text>
                        </View>
                    )}
                    {status === 'error' && (
                        <View style={[styles.icon, styles.errorIcon]}>
                            <Text style={styles.iconText}>×</Text>
                        </View>
                    )}
                    <Text style={styles.message}>{message}</Text>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContent: {
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        width: Dimensions.get('window').width - 48,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    icon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    successIcon: {
        backgroundColor: '#059669',
    },
    errorIcon: {
        backgroundColor: '#DC2626',
    },
    iconText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    message: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
});

export default UploadProgressModal;