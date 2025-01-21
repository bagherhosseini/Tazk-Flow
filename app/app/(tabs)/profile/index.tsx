import * as React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Image,
    ScrollView,
    ActivityIndicator,
    Platform,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser, useClerk } from "@clerk/clerk-expo";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import UploadProgressModal from '../../components/UploadProgressModal';
import { Ionicons } from '@expo/vector-icons'; // fix: Added missing import for icons

export default function ProfileScreen() {
    const { user, isLoaded: userLoaded } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();
    const [uploadStatus, setUploadStatus] = React.useState<'uploading' | 'success' | 'error' | null>(null);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [statusMessage, setStatusMessage] = React.useState('');
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    // fix: Added loading state for sign out
    const [isSigningOut, setIsSigningOut] = React.useState(false);

    const handleSignOut = async () => {
        try {
            setIsSigningOut(true);
            await signOut();
            router.replace('/(auth)/sign-in');  // fix: Updated route to match file structure
        } catch (error) {
            console.error("Error signing out:", error);
        } finally {
            setIsSigningOut(false);
        }
    };

    const handleRefresh = React.useCallback(async () => {
        setIsRefreshing(true);
        try {
            await user?.reload();
        } catch (error) {
            console.error("Error refreshing user data:", error);
        } finally {
            setIsRefreshing(false);
        }
    }, [user]);

    const handleImagePick = async () => {
        if (Platform.OS !== 'web') {
            try {
                const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

                if (!permissionResult.granted) {
                    setStatusMessage('Permission to access photos is required');
                    setUploadStatus('error');
                    setModalVisible(true);
                    return;
                }

                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.5,
                });

                if (!result.canceled) {
                    try {
                        setStatusMessage('Uploading your profile picture...');
                        setUploadStatus('uploading');
                        setModalVisible(true);

                        const imageUri = result.assets[0].uri;
                        const base64 = await FileSystem.readAsStringAsync(imageUri, {
                            encoding: FileSystem.EncodingType.Base64,
                        });
                        const formattedBase64 = `data:image/jpeg;base64,${base64}`;

                        await user?.setProfileImage({
                            file: formattedBase64,
                        });

                        setStatusMessage('Profile picture updated successfully!');
                        setUploadStatus('success');
                        setTimeout(() => {
                            setModalVisible(false);
                            setUploadStatus(null);
                        }, 2000);
                    } catch (uploadError) {
                        console.error('Error uploading to Clerk:', uploadError);
                        setStatusMessage('Failed to update profile picture. Please try again.');
                        setUploadStatus('error');
                    }
                }
            } catch (error) {
                console.error('Error picking image:', error);
                setStatusMessage('Failed to select image. Please try again.');
                setUploadStatus('error');
                setModalVisible(true);
            }
        }
    };

    const ProfileSection = ({ title, value, loading = false }: { title: string, value: string, loading?: boolean }) => (
        <View style={styles.profileSection}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {loading ? (
                <ActivityIndicator size="small" color="#4F46E5" />
            ) : (
                <Text style={styles.sectionValue}>{value}</Text>
            )}
        </View>
    );

    const ActionButton = ({ 
        title, 
        onPress, 
        variant = 'default',
        loading = false,
        icon
    }: { 
        title: string, 
        onPress: () => void, 
        variant?: 'default' | 'danger', 
        loading?: boolean,
        icon?: string
    }) => (
        <TouchableOpacity
            style={[
                styles.actionButton,
                variant === 'danger' && styles.dangerButton,
                loading && styles.disabledButton
            ]}
            onPress={onPress}
            disabled={loading}
        >
            {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
                <View style={styles.buttonContent}>
                    {icon && <Ionicons name={icon as any} size={20} color="#FFFFFF" style={styles.buttonIcon} />}
                    <Text style={[
                        styles.actionButtonText,
                        variant === 'danger' && styles.dangerButtonText
                    ]}>
                        {title}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );

    if (!userLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={styles.header}>
                <Text style={styles.title}>Profile</Text>
                <TouchableOpacity 
                    style={styles.refreshButton}
                    onPress={handleRefresh}
                    disabled={isRefreshing}
                >
                    <Ionicons 
                        name="refresh" 
                        size={24} 
                        color="#FFFFFF" 
                        style={[
                            styles.refreshIcon,
                            isRefreshing && styles.refreshingIcon
                        ]} 
                    />
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor="#4F46E5"
                    />
                }
            >
                <View style={styles.profileHeader}>
                    <TouchableOpacity 
                        onPress={handleImagePick}
                        style={styles.imageContainer}
                    >
                        <Image
                            source={{ uri: user?.imageUrl || 'https://via.placeholder.com/100' }}
                            style={styles.profileImage}
                        />
                        <View style={styles.imageOverlay}>
                            <Ionicons name="camera" size={16} color="#FFFFFF" />
                            <Text style={styles.changePhotoText}>Change Photo</Text>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.profileName}>
                        {user?.firstName} {user?.lastName}
                    </Text>
                    <Text style={styles.profileEmail}>{user?.emailAddresses[0].emailAddress}</Text>
                </View>

                <View style={styles.profileInfo}>
                    <ProfileSection 
                        title="Member Since"
                        value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        loading={!userLoaded}
                    />
                    <ProfileSection 
                        title="Last Updated"
                        value={user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                        loading={!userLoaded}
                    />
                </View>

                <View style={styles.actions}>
                    <ActionButton
                        title="Edit Profile"
                        onPress={() => {/* TODO: Implement edit profile */}}
                        icon="pencil"
                    />
                    <ActionButton
                        title="Settings"
                        onPress={() => {/* TODO: Implement settings */}}
                        icon="settings-sharp"
                    />
                    <ActionButton
                        title="Sign Out"
                        variant="danger"
                        onPress={handleSignOut}
                        loading={isSigningOut}
                        icon="log-out"
                    />
                </View>
            </ScrollView>
            <UploadProgressModal
                visible={modalVisible}
                status={uploadStatus || 'uploading'}
                message={statusMessage}
                onClose={() => {
                    setModalVisible(false);
                    setUploadStatus(null);
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212',
    },
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        paddingBottom: 16,
    },
    refreshButton: {
        padding: 8,
    },
    refreshIcon: {
        opacity: 0.8,
    },
    refreshingIcon: {
        opacity: 0.5,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    imageContainer: {
        position: 'relative',
        marginBottom: 16,
        borderRadius: 60,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#2563EB',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 8,
        alignItems: 'center',
        borderBottomLeftRadius: 60,
        borderBottomRightRadius: 60,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 4,
    },
    changePhotoText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 16,
        color: '#9CA3AF',
    },
    profileInfo: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        gap: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    profileSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    sectionValue: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    actions: {
        gap: 12,
    },
    actionButton: {
        backgroundColor: '#4F46E5',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonIcon: {
        marginRight: 8,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    dangerButton: {
        backgroundColor: '#DC2626',
    },
    dangerButtonText: {
        color: '#FFFFFF',
    },
    disabledButton: {
        opacity: 0.7,
    },
});