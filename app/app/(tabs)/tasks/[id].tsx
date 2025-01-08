import { StyleSheet, Text, View, ScrollView } from 'react-native';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { tasks } from '@/dumyData/data';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';

export default function Task() {
    const { id } = useLocalSearchParams();
    const task = tasks.find((task) => task.id === id);

    if (!task) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Task not found</Text>
            </View>
        );
    }

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

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleSection}>
                    <Text style={styles.title}>{task.title}</Text>
                    <View style={styles.badges}>
                        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
                            <Text style={styles.badgeText}>{task.priority}</Text>
                        </View>
                        <View style={[styles.statusBadge,
                        { backgroundColor: task.status === 'completed' ? '#4CAF50' : '#FF9800' }]}>
                            <Text style={styles.badgeText}>{task.status}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.content}>
                {task.project && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="folder" size={20} color="#FFFFFF" />
                            <Text style={styles.sectionTitle}>Project</Text>
                        </View>
                        <Text style={styles.projectName}>{task.project.name}</Text>
                    </View>
                )}

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="text" size={20} color="#FFFFFF" />
                        <Text style={styles.sectionTitle}>Description</Text>
                    </View>
                    <Text style={styles.description}>{task.description}</Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="clock-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.sectionTitle}>Timeline</Text>
                    </View>
                    <View style={styles.timelineContainer}>
                        <View style={styles.timelineItem}>
                            <Text style={styles.timelineLabel}>Due Date</Text>
                            <Text style={styles.timelineValue}>
                                {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                            </Text>
                        </View>
                        <View style={styles.timelineItem}>
                            <Text style={styles.timelineLabel}>Created</Text>
                            <Text style={styles.timelineValue}>
                                {format(new Date(task.createdAt), 'MMM dd, yyyy')}
                            </Text>
                        </View>
                    </View>
                </View>

                {task.tags && task.tags.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="tag-multiple" size={20} color="#FFFFFF" />
                            <Text style={styles.sectionTitle}>Tags</Text>
                        </View>
                        <View style={styles.tagsContainer}>
                            {task.tags.map((tag, index) => (
                                <View key={index} style={styles.tag}>
                                    <Text style={styles.tagText}>{tag}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {task.comments && task.comments.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="comment-multiple" size={20} color="#FFFFFF" />
                            <Text style={styles.sectionTitle}>Comments</Text>
                        </View>
                        {task.comments.map((comment, index) => (
                            <View key={index} style={styles.commentCard}>
                                <Text style={styles.commentAuthor}>{comment.createdBy}</Text>
                                <Text style={styles.commentText}>{comment.content}</Text>
                                <Text style={styles.commentDate}>
                                    {format(new Date(comment.createdAt), 'MMM dd, yyyy')}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        backgroundColor: '#1E1E1E',
        padding: 20,
        paddingTop: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#2D2D2D',
    },
    titleSection: {
        gap: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    badges: {
        flexDirection: 'row',
        gap: 8,
    },
    priorityBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    content: {
        padding: 16,
        gap: 20,
    },
    section: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    projectName: {
        fontSize: 16,
        color: '#E0E0E0',
    },
    description: {
        fontSize: 16,
        color: '#E0E0E0',
        lineHeight: 24,
    },
    timelineContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        gap: 16,
    },
    timelineItem: {
        alignItems: 'center',
        flex: 1,
    },
    timelineLabel: {
        fontSize: 14,
        color: '#9E9E9E',
        marginBottom: 4,
    },
    timelineValue: {
        fontSize: 16,
        color: '#E0E0E0',
        fontWeight: '500',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        backgroundColor: '#2D2D2D',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    tagText: {
        color: '#E0E0E0',
        fontSize: 14,
    },
    commentCard: {
        backgroundColor: '#2D2D2D',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        gap: 4,
    },
    commentAuthor: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    commentText: {
        fontSize: 14,
        color: '#E0E0E0',
        lineHeight: 20,
    },
    commentDate: {
        fontSize: 12,
        color: '#9E9E9E',
        marginTop: 4,
    },
    errorText: {
        color: '#E0E0E0',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
});