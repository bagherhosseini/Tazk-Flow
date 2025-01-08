import * as React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { allProjectTasks, projects, Task } from '../../../dumyData/data';

export default function ProjectDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const project = projects.find(p => p.id === id);
    const projectTasks = allProjectTasks.filter(task => task.project?.id === id);

    const [selectedStatus, setSelectedStatus] = React.useState('all');
    const [sortBy, setSortBy] = React.useState('dueDate'); // 'dueDate', 'priority', 'createdAt'

    const filteredTasks = React.useMemo(() => {
        let tasks = [...projectTasks];

        // Apply status filter
        if (selectedStatus !== 'all') {
            tasks = tasks.filter(task => task.status === selectedStatus);
        }

        // Apply sorting
        tasks.sort((a, b) => {
            switch (sortBy) {
                case 'dueDate':
                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                case 'priority': {
                    const priorityWeight = { high: 3, medium: 2, low: 1 };
                    return priorityWeight[b.priority] - priorityWeight[a.priority];
                }
                case 'createdAt':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                default:
                    return 0;
            }
        });

        return tasks;
    }, [projectTasks, selectedStatus, sortBy]);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return '#EF4444';
            case 'medium':
                return '#F59E0B';
            case 'low':
                return '#10B981';
            default:
                return '#6B7280';
        }
    };

    const renderTask = ({ item } : {item : Task}) => (
        <TouchableOpacity
            style={styles.taskCard}
            onPress={() => router.push(`/tasks/${item.id}`)}
        >
            <View style={styles.taskHeader}>
                <View style={styles.titleContainer}>
                    <Text style={styles.taskTitle}>{item.title}</Text>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
                        <Text style={styles.priorityText}>{item.priority}</Text>
                    </View>
                </View>
                <Text style={styles.taskDescription}>{item.description}</Text>
            </View>

            <View style={styles.taskMetadata}>
                <View style={styles.tagContainer}>
                    {item.tags.map(tag => (
                        <View key={tag} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View>
                <Text style={styles.dateText}>Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
            </View>

            <View style={styles.taskFooter}>
                <View style={styles.statusChip}>
                    <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
                </View>
                <Text style={styles.commentCount}>
                    {item.comments.length} comments
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (!project) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>Project not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {/* <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity> */}
                <View style={styles.projectInfo}>
                    <Text style={styles.projectName}>{project.name}</Text>
                    <Text style={styles.projectDescription}>{project.description}</Text>
                </View>
            </View>

            <View style={styles.filters}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.statusFilter}
                >
                    <TouchableOpacity
                        style={[
                            styles.filterChip,
                            selectedStatus === 'all' && styles.filterChipSelected
                        ]}
                        onPress={() => setSelectedStatus('all')}
                    >
                        <Text style={styles.filterChipText}>All</Text>
                    </TouchableOpacity>
                    {project.taskStatuses.map(status => (
                        <TouchableOpacity
                            key={status}
                            style={[
                                styles.filterChip,
                                selectedStatus === status && styles.filterChipSelected
                            ]}
                            onPress={() => setSelectedStatus(status)}
                        >
                            <Text style={styles.filterChipText}>
                                {status.replace('_', ' ')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.sortContainer}>
                    <Text style={styles.sortLabel}>Sort by:</Text>
                    <TouchableOpacity
                        style={styles.sortButton}
                        onPress={() => {
                            const options = ['dueDate', 'priority', 'createdAt'];
                            const currentIndex = options.indexOf(sortBy);
                            setSortBy(options[(currentIndex + 1) % options.length]);
                        }}
                    >
                        <Text style={styles.sortButtonText}>
                            {sortBy.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={filteredTasks}
                renderItem={renderTask}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.taskList}
                showsVerticalScrollIndicator={false}
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
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 16,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 24,
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
    filters: {
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    statusFilter: {
        marginBottom: 16,
    },
    filterChip: {
        backgroundColor: '#374151',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    filterChipSelected: {
        backgroundColor: '#2563EB',
    },
    filterChipText: {
        color: '#FFFFFF',
        fontSize: 14,
        textTransform: 'capitalize',
    },
    sortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sortLabel: {
        color: '#9CA3AF',
        marginRight: 8,
    },
    sortButton: {
        backgroundColor: '#374151',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    sortButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        textTransform: 'capitalize',
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
    taskHeader: {
        marginBottom: 12,
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
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    priorityText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    taskDescription: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    taskMetadata: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        backgroundColor: '#374151',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    tagText: {
        color: '#FFFFFF',
        fontSize: 12,
    },
    dateText: {
        color: '#9CA3AF',
        fontSize: 12,
    },
    taskFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusChip: {
        backgroundColor: '#374151',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 12,
        textTransform: 'capitalize',
    },
    commentCount: {
        color: '#9CA3AF',
        fontSize: 12,
    },
    errorText: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 24,
    },
});