import { Text, View, ScrollView, Pressable, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './styles';
import { useAuth } from '@clerk/clerk-expo';
import ApiService, { Project } from '@/services/api';

export default function ProjectsTasks() {
    const router = useRouter();
    const { getToken } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
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

    useEffect(() => {
        async function fetchData() {
            try {
                const token = await getToken();
                if (!token) return;
                const userProjects = await ApiService.getUserProjects(token);
                setProjects(userProjects);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const handleTaskPress = (taskId: string) => {
        router.push(`/tasks/${taskId}`);
    }

    if (loading) {
        return (
            <View style={styles.emptyState}>
                <MaterialCommunityIcons name="folder-outline" size={48} color="#808080" />
                <Text style={styles.emptyText}>Loading projects...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcomeText}>Your Projects</Text>
                <Text style={styles.headerTitle}>Project Tasks</Text>
            </View>

            <View style={styles.content}>
                {projects.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="folder-outline" size={48} color="#808080" />
                        <Text style={styles.emptyText}>No project tasks available</Text>
                    </View>
                ) : (
                    projects.map((project) => (
                        <View key={project.id} style={styles.projectContainer}>
                            <View style={styles.projectHeaderContainer}>
                                <View style={styles.projectIcon}>
                                    <Text style={styles.projectIconText}>
                                        {project.name.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <Text style={styles.projectTitle}>{project.name}</Text>
                            </View>

                            {project.tasks && project.tasks.length > 0 ? (
                                project.tasks.map((task) => (
                                    <TouchableOpacity 
                                        key={task.id} 
                                        style={styles.taskCard} 
                                        onPress={() => handleTaskPress(task.id)}
                                    >
                                        <View style={styles.taskHeader}>
                                            <Text style={styles.taskTitle}>{task.title}</Text>
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
                                                        : '#FF9800'
                                                }
                                            ]}>
                                                <Text style={styles.statusText}>{task.status}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text style={styles.noTasksText}>No tasks in this project</Text>
                            )}
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}