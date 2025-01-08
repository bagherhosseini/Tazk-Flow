import { Text, View, ScrollView, Pressable, TouchableOpacity } from 'react-native'
import React from 'react'
import { userProjects, userVisibleTasks } from '@/dumyData/data'
import { Link, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './styles';

export default function ProjectsTasks() {
    const router = useRouter();

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

    const handleTaskPress = (taskId: string) => {
        router.push(`/tasks/${taskId}`);
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcomeText}>Your Projects</Text>
                <Text style={styles.headerTitle}>Project Tasks</Text>
            </View>

            <View style={styles.content}>
                {userProjects.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="folder-outline" size={48} color="#808080" />
                        <Text style={styles.emptyText}>No project tasks available</Text>
                    </View>
                ) : (
                    userProjects.map((project) => (
                        <View key={project.id} style={styles.projectContainer}>
                            <View style={styles.projectHeaderContainer}>
                                <View style={styles.projectIcon}>
                                    <Text style={styles.projectIconText}>
                                        {project.name.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <Text style={styles.projectTitle}>{project.name}</Text>
                            </View>

                            {userVisibleTasks
                                .filter((task) => task.project?.id === project.id)
                                .map((task) => (
                                    <TouchableOpacity key={task.id} style={styles.taskCard} onPress={() => handleTaskPress(task.id)}>
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
                                                Due: {new Date(task.dueDate).toLocaleDateString()}
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
                                ))}
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}