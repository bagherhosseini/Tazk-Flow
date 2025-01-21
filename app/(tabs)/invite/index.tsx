import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { format } from 'date-fns';
import ApiService, { ResponseInvite } from '@/services/api';
import { useAuth } from '@clerk/clerk-expo';

export default function PendingInvitesScreen() {
    const [invites, setInvites] = useState<Array<{ invite_id: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [loadingInvites, setLoadingInvites] = useState<{ [key: string]: { accept: boolean; decline: boolean } }>({});
    const { getToken } = useAuth();

    useEffect(() => {
        const fetchInvites = async () => {
            try {
                const token = await getToken();
                if (!token) return;
                const invites = await ApiService.getInvites(token);
                setInvites(invites.invites);
                setLoading(false);
            } catch (error) {
                console.error('Failed to update project:', error);
                setLoading(false);
            }
        };

        fetchInvites();
    }, []);

    const handleResponse = async (inviteId: string, response: "accepted" | "declined") => {
        try {
            // Set loading state for the specific button
            setLoadingInvites(prev => ({
                ...prev,
                [inviteId]: {
                    accept: response === 'accepted' ? true : false,
                    decline: response === 'declined' ? true : false
                }
            }));

            const token = await getToken();
            if (!token) return;

            const InviteResponse: ResponseInvite = {
                invite_id: inviteId,
                response,
            }

            const responseInvite = await ApiService.responseInvite(token, InviteResponse);
            console.log(responseInvite);

            // Remove the invite from the list after successful response
            setInvites(prevInvites => prevInvites.filter(invite => invite.invite_id !== inviteId));
        } catch (error) {
            console.error('Error responding to invite:', error);
        } finally {
            // Clear loading state
            setLoadingInvites(prev => ({
                ...prev,
                [inviteId]: { accept: false, decline: false }
            }));
        }
    };

    const renderInviteCard = ({ item }: {item: any}) => {
        const inviteLoading = loadingInvites[item.invite_id] || { accept: false, decline: false };

        return (
            <View style={styles.taskCard}>
                <View style={styles.titleContainer}>
                    <Text style={styles.taskTitle}>{item.project_name}</Text>
                    <View style={[styles.roleChip]}>
                        <Text style={styles.roleChipText}>{item.role}</Text>
                    </View>
                </View>

                <Text style={styles.taskDescription}>Team: {item.team_name}</Text>

                <View style={styles.taskMetadata}>
                    <Text style={styles.metadataText}>
                        Invited: {format(new Date(item.invited_at), 'MMM d, yyyy')}
                    </Text>
                </View>

                <View style={styles.taskFooter}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.acceptButton]}
                        onPress={() => handleResponse(item.invite_id, 'accepted')}
                        disabled={inviteLoading.accept || inviteLoading.decline}
                    >
                        {inviteLoading.accept ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.actionButtonText}>Accept</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.declineButton]}
                        onPress={() => handleResponse(item.invite_id, 'declined')}
                        disabled={inviteLoading.accept || inviteLoading.decline}
                    >
                        {inviteLoading.decline ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.actionButtonText}>Decline</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.projectInfo}>
                    <Text style={styles.projectName}>Project Invites</Text>
                    <Text style={styles.projectDescription}>
                        Manage your pending project invitations
                    </Text>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator color="#2563EB" size="large" />
            ) : invites.length > 0 ? (
                <FlatList
                    data={invites}
                    renderItem={renderInviteCard}
                    keyExtractor={item => item.invite_id}
                    contentContainerStyle={styles.taskList}
                />
            ) : (
                <Text style={styles.errorTextNotFound}>
                    No pending invites found
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 16,
    },
    projectInfo: {
        flex: 1,
    },
    projectName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    projectDescription: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    taskList: {
        padding: 16,
    },
    taskCard: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        flex: 1,
    },
    roleChip: {
        backgroundColor: '#374151',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    roleChipText: {
        color: '#FFFFFF',
        fontSize: 12,
        textTransform: 'capitalize',
    },
    taskDescription: {
        fontSize: 14,
        color: '#9CA3AF',
        marginBottom: 12,
    },
    taskMetadata: {
        marginBottom: 16,
    },
    metadataText: {
        color: '#9CA3AF',
        fontSize: 12,
    },
    taskFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    acceptButton: {
        backgroundColor: '#2563EB',
    },
    declineButton: {
        backgroundColor: '#374151',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    errorTextNotFound: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 24,
    },
});