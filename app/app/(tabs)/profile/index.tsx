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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser, useClerk } from "@clerk/clerk-expo";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import UploadProgressModal from '../../components/UploadProgressModal';

export default function ProfileScreen() {
    const { user } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();
    const [uploadStatus, setUploadStatus] = React.useState<'uploading' | 'success' | 'error' | null>(null);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [statusMessage, setStatusMessage] = React.useState('');

    const handleSignOut = async () => {
        try {
            await signOut();
            router.replace('../auth/sign-in');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleImagePick = async () => {
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
    };

    // Rest of the component remains the same...
    const ProfileSection = ({ title, value }: { title: string, value: string }) => (
        <View>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionValue}>{value}</Text>
        </View>
    );

    const ActionButton = ({ title, onPress, variant = 'default' }: { title: string, onPress: () => void, variant?: string }) => (
        <TouchableOpacity
            style={[
                styles.actionButton,
                variant === 'danger' && styles.dangerButton
            ]}
            onPress={onPress}
        >
            <Text style={[
                styles.actionButtonText,
                variant === 'danger' && styles.dangerButtonText
            ]}>
                {title}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={styles.header}>
                <Text style={styles.title}>Profile</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.profileHeader}>
                    <TouchableOpacity onPress={handleImagePick}>
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: user?.imageUrl || 'https://via.placeholder.com/100' }}
                                style={styles.profileImage}
                            />
                            <View style={styles.imageOverlay}>
                                <Text style={styles.changePhotoText}>Change Photo</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.profileName}>
                        {user?.firstName} {user?.lastName}
                    </Text>
                    <Text style={styles.profileEmail}>{user?.emailAddresses[0].emailAddress}</Text>
                </View>

                <View style={styles.profileInfo}>
                    <ProfileSection title="Member Since"
                        value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    />
                    <ProfileSection title="Last Updated"
                        value={user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                    />
                </View>

                <View style={styles.actions}>
                    <ActionButton
                        title="Sign Out"
                        variant="danger"
                        onPress={handleSignOut}
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
    },
    sectionTitle: {
        fontSize: 14,
        color: '#9CA3AF',
        marginBottom: 4,
    },
    sectionValue: {
        fontSize: 16,
        color: '#FFFFFF',
    },
    actions: {
        gap: 12,
    },
    actionButton: {
        backgroundColor: '#1E1E1E',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    dangerButton: {
        backgroundColor: '#DC2626',
    },
    dangerButtonText: {
        color: '#FFFFFF',
    },
});