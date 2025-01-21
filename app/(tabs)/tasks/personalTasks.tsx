import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { styles } from './styles';
import { StyleSheet } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import ApiService, { Task } from '@/services/api';

// fix: Added loading states and refresh functionality
export default function PersonalTasks() {
    const router = useRouter();
    const { getToken } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high':
                return '#FF4444';
            case 'medium':
                return '#FFA000';
            case 'low':
                return '#4CAF50';
            default:
                return '#757575';
        }
    };

    // fix: Added error handling and loading state management
    const fetchTasks = async () => {
        try {
            const token = await getToken();
            if (!token) {
                router.replace('/sign-in');
                return;
            }
            const fetchedTasks = await ApiService.getPersonalTasks(token);
            setTasks(fetchedTasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    // fix: Added pull-to-refresh functionality
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchTasks();
    }, []);

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleTaskPress = (taskId: string) => {
        router.push(`/tasks/${taskId}`);
    }

    if (isLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Loading personal tasks...</Text>
            </View>
        );
    }

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#4CAF50"
                />
            }
        >
            <View style={styles.header}>
                <Text style={styles.welcomeText}>Your Tasks</Text>
                <Text style={styles.headerTitle}>Personal Tasks</Text>
            </View>

            <View style={styles.content}>
                {tasks && tasks.length > 0 ? (
                    <View style={styles.tasksContainer}>
                        {tasks.map((task) => (
                            <TouchableOpacity 
                                key={task.id} 
                                style={[styles.taskCard, styles.taskCardEnhanced]} 
                                onPress={() => handleTaskPress(task.id)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.taskHeader}>
                                    <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                                    <View style={[
                                        styles.priorityBadge,
                                        { backgroundColor: getPriorityColor(task.priority) }
                                    ]}>
                                        <Text style={styles.priorityText}>{task.priority}</Text>
                                    </View>
                                </View>
                                <Text
                                    numberOfLines={2}
                                    style={styles.taskDescription}
                                >
                                    {task.description}
                                </Text>
                                <View style={styles.taskFooter}>
                                    <View style={styles.dateContainer}>
                                        <MaterialCommunityIcons name="calendar" size={14} color="#808080" />
                                        <Text style={styles.taskDate}>
                                            {new Date(task.due_date).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <View style={[
                                        styles.statusBadge,
                                        {
                                            backgroundColor: task.status === 'completed'
                                                ? '#4CAF50'
                                                : task.status === 'in_progress'
                                                    ? '#FF9800'
                                                    : '#757575'
                                        }
                                    ]}>
                                        <Text style={styles.statusText}>{task.status?.replace('_', ' ')}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#808080" />
                        <Text style={styles.emptyText}>No personal tasks available</Text>
                        <TouchableOpacity 
                            style={styles.createTaskButton}
                            onPress={() => router.push('/tasks/create')}
                        >
                            <Text style={styles.createTaskButtonText}>Create New Task</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

// fix: Enhanced styles for better UI
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 24,
        paddingTop: 20,
    },
    welcomeText: {
        fontSize: 16,
        color: '#B0B0B0',
        marginBottom: 4,
        fontWeight: '500',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    content: {
        padding: 16,
    },
    tasksContainer: {
        gap: 16,
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        padding: 16,
    },
    taskCard: {
        borderBottomColor: '#333',
        borderBottomWidth: 1,
        paddingBottom: 16,
        paddingTop: 8,
        paddingHorizontal: 12,
    },
    taskCardEnhanced: {
        backgroundColor: '#252525',
        borderRadius: 12,
        borderBottomWidth: 0,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    taskTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        flex: 1,
        marginRight: 12,
    },
    taskDescription: {
        fontSize: 14,
        color: '#B0B0B0',
        marginBottom: 12,
        lineHeight: 20,
    },
    taskFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    taskDate: {
        fontSize: 12,
        color: '#808080',
    },
    priorityBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    priorityText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    emptyState: {
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        marginTop: 20,
    },
    emptyText: {
        color: '#808080',
        fontSize: 16,
        marginTop: 12,
        marginBottom: 24,
        textAlign: 'center',
    },
    createTaskButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    createTaskButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    loadingText: {
        color: '#FFFFFF',
        marginTop: 12,
        fontSize: 16,
    },
});