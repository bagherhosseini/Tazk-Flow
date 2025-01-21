import * as React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import ApiService, { Project } from '@/services/api';
// fix: Added proper imports for error handling and empty state
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProjectsScreen() {
    const router = useRouter();
    const { getToken } = useAuth();
    const [userProjects, setUserProjects] = React.useState<Project[]>([]);
    // fix: Added loading and error states
    const [isLoading, setIsLoading] = React.useState(true);
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return '#22C55E';
            case 'on_hold':
                return '#EAB308';
            case 'completed':
                return '#3B82F6';
            case 'cancelled':
                return '#EF4444';
            default:
                return '#9CA3AF';
        }
    };

    const fetchProjects = React.useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) {
                setError('Authentication required');
                return;
            }
            const projects = await ApiService.getUserProjects(token);
            setUserProjects(projects);
            setError(null);
        } catch (error) {
            setError('Failed to load projects');
            Alert.alert('Error', 'Failed to load projects. Please try again.');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [getToken]);

    React.useEffect(() => {
        let mounted = true;

        const init = async () => {
            if (mounted) {
                await fetchProjects();
            }
        };

        init();

        return () => {
            mounted = false;
        };

    }, []);

    const handleRefresh = React.useCallback(() => {
        setIsRefreshing(true);
        fetchProjects();
    }, [fetchProjects]);

    const handleProjectPress = (projectId: string) => {
        router.push(`/(tabs)/projects/${projectId}`);
    };

    // fix: Added error component
    const renderError = () => (
        <View style={styles.centerContainer}>
            <MaterialCommunityIcons name="alert-circle" size={48} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchProjects}>
                <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
        </View>
    );

    // fix: Added empty state component
    const renderEmpty = () => (
        <View style={styles.centerContainer}>
            <MaterialCommunityIcons name="folder-open" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No projects found</Text>
            <Text style={styles.emptySubtext}>Create a new project to get started</Text>
        </View>
    );

    const renderProjectCard = ({ item }: { item: Project }) => (
        <TouchableOpacity
            style={[styles.projectCard, styles.elevation]}
            onPress={() => handleProjectPress(item.id)}
            activeOpacity={0.7}
        >
            <View style={styles.projectHeader}>
                <View style={styles.projectTitleContainer}>
                    <Text style={styles.projectName}>{item.name}</Text>
                    <Text style={styles.projectDescription}>{item.description}</Text>
                </View>
                <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.status) }
                ]}>
                    <Text style={styles.statusText}>
                        {item.status.replace('_', ' ')}
                    </Text>
                </View>
            </View>

            <View style={styles.projectFooter}>
                <View style={styles.statusList}>
                    {item.task_statuses.map((status: string, index: number) => (
                        <Text key={`${status}-${index}`} style={styles.statusChip}>
                            {status.replace('_', ' ')}
                        </Text>
                    ))}
                </View>
                <View style={styles.dateInfo}>
                    <Text style={styles.dateText}>
                        Created: {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                    {item.due_date && (
                        <Text style={[
                            styles.dateText,
                            new Date(item.due_date) < new Date() && styles.overdueDateText
                        ]}>
                            Due: {new Date(item.due_date).toLocaleDateString()}
                        </Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text style={styles.loadingText}>Loading projects...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <Text style={styles.title}>My Projects</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => router.push('/projects/create')}
                >
                    <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
                    <Text style={styles.addButtonText}>New Project</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={userProjects}
                renderItem={renderProjectCard}
                keyExtractor={item => item.id}
                contentContainerStyle={[
                    styles.projectsList,
                    !userProjects.length && styles.emptyList
                ]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor="#2563EB"
                        colors={['#2563EB']}
                    />
                }
                ListEmptyComponent={error ? renderError() : renderEmpty()}
            />
        </SafeAreaView>
    );
}

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#FFFFFF',
        marginTop: 12,
        fontSize: 16,
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
    addButton: {
        backgroundColor: '#2563EB',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    projectsList: {
        padding: 16,
    },
    emptyList: {
        flex: 1,
    },
    projectCard: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    elevation: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    projectHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    projectTitleContainer: {
        flex: 1,
        marginRight: 12,
    },
    projectName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    projectDescription: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#FFFFFF',
        textTransform: 'capitalize',
    },
    projectFooter: {
        gap: 12,
    },
    statusList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusChip: {
        fontSize: 12,
        color: '#FFFFFF',
        backgroundColor: '#374151',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        textTransform: 'capitalize',
    },
    dateInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    overdueDateText: {
        color: '#EF4444',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 16,
        marginTop: 12,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 16,
        backgroundColor: '#2563EB',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 12,
    },
    emptySubtext: {
        color: '#9CA3AF',
        fontSize: 14,
        marginTop: 4,
        textAlign: 'center',
    },
});