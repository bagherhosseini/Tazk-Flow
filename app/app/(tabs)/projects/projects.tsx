import * as React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { userProjects, Project } from '../../../dumyData/data';

export default function ProjectsScreen() {
    const router = useRouter();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return '#22C55E';
            case 'on_hold':
                return '#EAB308';
            default:
                return '#9CA3AF';
        }
    };

    const handleProjectPress = (projectId: string) => {
        router.push(`/(tabs)/projects/${projectId}`);
    }

    const renderProjectCard = ({ item } : {item: Project}) => {
        return (
            <TouchableOpacity
                style={styles.projectCard}
                onPress={() => handleProjectPress(item.id)}
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
                        {item.taskStatuses.map((status: any, index: any) => (
                            <Text key={status} style={styles.statusChip}>
                                {status.replace('_', ' ')}
                            </Text>
                        ))}
                    </View>
                    <View style={styles.dateInfo}>
                        <Text style={styles.dateText}>
                            Created: {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                        {item.dueDate && (
                            <Text style={styles.dateText}>
                                Due: {new Date(item.dueDate).toLocaleDateString()}
                            </Text>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <Text style={styles.title}>My Projects</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => router.push('/projects/create')}
                >
                    <Text style={styles.addButtonText}>+ New Project</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={userProjects}
                renderItem={renderProjectCard}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.projectsList}
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
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    projectsList: {
        padding: 16,
    },
    projectCard: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
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
});