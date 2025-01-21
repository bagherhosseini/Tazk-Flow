import { Text, View, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { Link, useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { StyleSheet } from 'react-native'
import { useAuth } from '@clerk/clerk-expo'
import ApiService, { Project, Task } from '@/services/api'
import { StatusBar } from 'expo-status-bar'

export default function ProjectsTasks() {
    const router = useRouter()
    const { getToken } = useAuth()
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    // fix: Added error state handling
    const [error, setError] = useState<string | null>(null)

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high':
                return '#FF4444'
            case 'medium':
                return '#FFA000'
            case 'low':
                return '#4CAF50'
            default:
                return '#757575'
        }
    }

    const fetchProjects = async () => {
        try {
            setError(null)
            const token = await getToken()
            if (!token) {
                setError('Authentication token not found')
                return
            }
            const userProjects = await ApiService.getUserProjects(token)
            setProjects(userProjects)
        } catch (error) {
            console.error(error)
            setError('Failed to load projects')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchProjects()
    }, [])

    // fix: Added refresh control functionality
    const onRefresh = useCallback(() => {
        setRefreshing(true)
        fetchProjects()
    }, [])

    const handleTaskPress = (taskId: string) => {
        router.push(`/tasks/${taskId}`)
    }

    const renderTaskCard = (task: Task) => (
        <TouchableOpacity
            key={task.id}
            style={[styles.taskCard, { transform: [{ scale: 1 }] }]}
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
                <Text style={styles.taskDate}>
                    Due: {new Date(task.due_date).toLocaleDateString()}
                </Text>
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
    )

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={[styles.emptyText, { marginTop: 16 }]}>Loading projects...</Text>
                <StatusBar style="light" />
            </View>
        )
    }

    if (error) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#FF4444" />
                <Text style={[styles.emptyText, { color: '#FF4444' }]}>{error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={fetchProjects}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
                <StatusBar style="light" />
            </View>
        )
    }

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#4CAF50"
                    colors={['#4CAF50']}
                />
            }
        >
            <StatusBar style="light" />
            <View style={styles.header}>
                <Text style={styles.welcomeText}>Your Projects</Text>
                <Text style={styles.headerTitle}>Project Tasks</Text>
            </View>

            <View style={styles.content}>
                {projects.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="folder-outline" size={48} color="#808080" />
                        <Text style={styles.emptyText}>No project tasks available</Text>
                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={() => router.push('/projects/create')}
                        >
                            <Text style={styles.createButtonText}>Create Project</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    projects.map((project) => (
                        <View key={project.id} style={styles.projectContainer}>
                            <TouchableOpacity 
                                style={styles.projectHeaderContainer}
                                onPress={() => router.push(`/projects/${project.id}`)}
                            >
                                <View style={[styles.projectIcon, { backgroundColor: getPriorityColor('medium') }]}>
                                    <Text style={styles.projectIconText}>
                                        {project.name.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <Text style={styles.projectTitle}>{project.name}</Text>
                                <MaterialCommunityIcons 
                                    name="chevron-right" 
                                    size={24} 
                                    color="#FFFFFF" 
                                    style={styles.projectArrow}
                                />
                            </TouchableOpacity>

                            {project.tasks && project.tasks.length > 0 ? (
                                project.tasks.map(renderTaskCard)
                            ) : (
                                <View style={styles.noTasksContainer}>
                                    <Text style={styles.noTasksText}>No tasks in this project</Text>
                                    <TouchableOpacity
                                        style={styles.addTaskButton}
                                        onPress={() => router.push(`/tasks/create?projectId=${project.id}`)}
                                    >
                                        <Text style={styles.addTaskButtonText}>Add Task</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    header: {
        padding: 24,
        paddingTop: 20,
    },
    welcomeText: {
        fontSize: 16,
        color: '#B0B0B0',
        marginBottom: 4,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    content: {
        padding: 16,
    },
    projectContainer: {
        backgroundColor: '#1E1E1E',
        gap: 18,
        borderRadius: 16,
        marginBottom: 20,
        paddingVertical: 20,
        paddingHorizontal: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    projectHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    projectIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    projectIconText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    projectTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
        flex: 1,
    },
    projectArrow: {
        marginLeft: 8,
    },
    taskCard: {
        backgroundColor: '#282828',
        borderRadius: 12,
        padding: 12,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    taskTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#FFFFFF',
        flex: 1,
        marginRight: 8,
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
    taskDate: {
        fontSize: 12,
        color: '#808080',
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    priorityText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '500',
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
        textAlign: 'center',
    },
    noTasksContainer: {
        alignItems: 'center',
        padding: 16,
    },
    noTasksText: {
        color: '#808080',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 12,
    },
    createButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 16,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    addTaskButton: {
        backgroundColor: '#333333',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        marginTop: 8,
    },
    addTaskButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    retryButton: {
        backgroundColor: '#FF4444',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 16,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
})