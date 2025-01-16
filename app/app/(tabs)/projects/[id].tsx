import * as React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    FlatList,
    TextInput,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import ApiService, { Project, Task } from '@/services/api';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ProjectDetailScreen() {
    const { id } = useLocalSearchParams();
    const projectId = Array.isArray(id) ? id[0] : id;
    const { getToken } = useAuth();
    const [project, setProject] = React.useState<Project>();
    const [isEditing, setIsEditing] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [editedProject, setEditedProject] = React.useState<Partial<Project>>({});
    const [showDatePicker, setShowDatePicker] = React.useState(false);
    const [showInviteModal, setShowInviteModal] = React.useState(false);
    const [inviteEmail, setInviteEmail] = React.useState('');
    const [isAddingStatus, setIsAddingStatus] = React.useState(false);
    const [newStatus, setNewStatus] = React.useState('');
    const router = useRouter();

    const [selectedStatus, setSelectedStatus] = React.useState('all');
    const [sortBy, setSortBy] = React.useState('dueDate');

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

    React.useEffect(() => {
        async function fetchData() {
            try {
                const token = await getToken();
                if (!token) return;
                const project = await ApiService.getProject(token, projectId);
                setProject(project);
                setEditedProject({
                    name: project.name,
                    description: project.description,
                });
            } catch (error) {
                console.error(error);
            }
        }

        fetchData();
    }, [projectId]);

    const filteredTasks = React.useMemo(() => {
        if (!project || !project.tasks) return null;
        let tasks = [...project.tasks];

        if (selectedStatus !== 'all') {
            tasks = tasks.filter(task => task.status === selectedStatus);
        }

        tasks.sort((a, b) => {
            switch (sortBy) {
                case 'dueDate':
                    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
                case 'priority': {
                    const priorityWeight = { high: 3, medium: 2, low: 1 };
                    return priorityWeight[b.priority] - priorityWeight[a.priority];
                }
                case 'createdAt':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                default:
                    return 0;
            }
        });

        return tasks;
    }, [project, selectedStatus, sortBy]);

    const handleSave = async () => {
        if (!project) return;
        
        try {
            setIsSaving(true);
            const token = await getToken();
            if (!token) return;

            const updatedProject = await ApiService.updateProject(token, projectId, editedProject);
            setProject(updatedProject);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update project:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddStatus = () => {
        if (newStatus.trim() && editedProject.task_statuses) {
            setEditedProject(prev => ({
                ...prev,
                task_statuses: [...(prev.task_statuses || []), newStatus.trim()]
            }));
            setNewStatus('');
            setIsAddingStatus(false);
        }
    };

    const handleRemoveStatus = (statusToRemove: string) => {
        setEditedProject(prev => ({
            ...prev,
            task_statuses: prev.task_statuses?.filter(status => status !== statusToRemove)
        }));
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setEditedProject(prev => ({
                ...prev,
                due_date: selectedDate.toISOString()
            }));
        }
    };

    const renderInviteModal = () => (
        <Modal
            visible={showInviteModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowInviteModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Invite People</Text>
                    <TextInput
                        style={styles.input}
                        value={inviteEmail}
                        onChangeText={setInviteEmail}
                        placeholder="Enter email address"
                        placeholderTextColor="#6B7280"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={[styles.editButton, styles.cancelButton]}
                            onPress={() => setShowInviteModal(false)}
                        >
                            <Text style={styles.editButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.editButton, styles.saveButton]}
                            onPress={() => {
                                // Placeholder for invite functionality
                                setShowInviteModal(false);
                                setInviteEmail('');
                            }}
                        >
                            <Text style={styles.editButtonText}>Send Invite</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    const renderProjectHeader = () => (
        <View style={styles.header}>
            <View style={styles.projectInfo}>
                {isEditing ? (
                    <View style={styles.editContainer}>
                        <TextInput
                            style={styles.input}
                            value={editedProject.name}
                            onChangeText={(text) => setEditedProject(prev => ({ ...prev, name: text }))}
                            placeholder="Project Name"
                            placeholderTextColor="#6B7280"
                        />
                        <TextInput
                            style={[styles.input, styles.descriptionInput]}
                            value={editedProject.description}
                            onChangeText={(text) => setEditedProject(prev => ({ ...prev, description: text }))}
                            placeholder="Project Description"
                            placeholderTextColor="#6B7280"
                            multiline
                        />
                        
                        <Text style={styles.sectionTitle}>Project Status</Text>
                        <View style={styles.statusChipsContainer}>
                            {(['active', 'completed', 'on_hold'] as const).map(statusOption => (
                                <TouchableOpacity
                                    key={statusOption}
                                    style={[
                                        styles.statusOptionChip,
                                        editedProject.status === statusOption && styles.statusOptionSelected
                                    ]}
                                    onPress={() => setEditedProject(prev => ({ ...prev, status: statusOption }))}
                                >
                                    <Text 
                                        style={[
                                            styles.statusOptionText,
                                            editedProject.status === statusOption && styles.statusOptionTextSelected
                                        ]}
                                    >
                                        {statusOption.replace('_', ' ')}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.sectionTitle}>Due Date</Text>
                        <TouchableOpacity
                            style={styles.input}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={styles.dateText}>
                                {editedProject.due_date 
                                    ? new Date(editedProject.due_date).toLocaleDateString()
                                    : 'Select due date'}
                            </Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={new Date(editedProject.due_date || Date.now())}
                                mode="date"
                                onChange={handleDateChange}
                            />
                        )}

                        <Text style={styles.sectionTitle}>Task Statuses</Text>
                        <View style={styles.statusContainer}>
                            {editedProject.task_statuses?.map(status => (
                                <View key={status} style={styles.statusChip}>
                                    <Text style={styles.statusText}>{status}</Text>
                                    <TouchableOpacity
                                        onPress={() => handleRemoveStatus(status)}
                                        style={styles.removeButton}
                                    >
                                        <Text style={styles.removeButtonText}>×</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                            {isAddingStatus ? (
                                <View style={styles.addStatusContainer}>
                                    <TextInput
                                        style={styles.statusInput}
                                        value={newStatus}
                                        onChangeText={setNewStatus}
                                        placeholder="New status"
                                        placeholderTextColor="#6B7280"
                                        autoFocus
                                        onSubmitEditing={handleAddStatus}
                                    />
                                    <TouchableOpacity
                                        style={styles.addButton}
                                        onPress={handleAddStatus}
                                    >
                                        <Text style={styles.addButtonText}>Add</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={styles.addStatusButton}
                                    onPress={() => setIsAddingStatus(true)}
                                >
                                    <Text style={styles.addStatusButtonText}>+ Add Status</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.inviteButton}
                            onPress={() => setShowInviteModal(true)}
                        >
                            <Text style={styles.inviteButtonText}>+ Invite People</Text>
                        </TouchableOpacity>

                        <View style={styles.editActions}>
                            <TouchableOpacity
                                style={[styles.editButton, styles.cancelButton]}
                                onPress={() => {
                                    setIsEditing(false);
                                    setEditedProject({
                                        name: project?.name,
                                        description: project?.description,
                                        status: project?.status,
                                        task_statuses: project?.task_statuses,
                                        due_date: project?.due_date,
                                    });
                                }}
                            >
                                <Text style={styles.editButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.editButton, styles.saveButton]}
                                onPress={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <Text style={styles.editButtonText}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <>
                        <View style={styles.projectHeaderRow}>
                            <Text style={styles.projectName}>{project?.name}</Text>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => {
                                    setIsEditing(true);
                                    setEditedProject({
                                        name: project?.name,
                                        description: project?.description,
                                        status: project?.status,
                                        task_statuses: project?.task_statuses,
                                        due_date: project?.due_date,
                                    });
                                }}
                            >
                                <Text style={styles.editButtonText}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.projectDescription}>{project?.description}</Text>
                        <View style={styles.projectMetadata}>
                            <Text style={styles.metadataText}>Status: {project?.status}</Text>
                            <Text style={styles.metadataText}>
                                Due: {project?.due_date ? new Date(project.due_date).toLocaleDateString() : 'Not set'}
                            </Text>
                        </View>
                    </>
                )}
            </View>
        </View>
    );

    const renderTask = ({ item }: { item: Task }) => (
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
                <Text style={styles.dateText}>Due: {new Date(item.due_date).toLocaleDateString()}</Text>
            </View>

            <View style={styles.taskFooter}>
                {/* <View style={styles.statusChip}>
                    <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
                </View> */}
                {/* <Text style={styles.commentCount}>
                    {item.comments.length} comments
                </Text> */}
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
            {renderProjectHeader()}
            {renderInviteModal()}

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
                    {project.task_statuses.map(status => (
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

            {project.tasks ? (
                <FlatList
                    data={filteredTasks}
                    renderItem={renderTask}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.taskList}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <Text style={styles.errorText}>No tasks found</Text>
            )}
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
    taskFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    projectHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    editContainer: {
        width: '100%',
    },
    input: {
        backgroundColor: '#2D2D2D',
        borderRadius: 8,
        padding: 12,
        color: '#FFFFFF',
        fontSize: 16,
        marginBottom: 8,
    },
    descriptionInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    editActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        marginTop: 8,
    },
    editButton: {
        backgroundColor: '#2563EB',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    cancelButton: {
        backgroundColor: '#374151',
    },
    saveButton: {
        backgroundColor: '#2563EB',
    },
    editButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    statusContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusChip: {
        backgroundColor: '#374151',
        borderRadius: 16,
        paddingVertical: 4,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    removeButton: {
        marginLeft: 8,
        padding: 2,
    },
    removeButtonText: {
        color: '#9CA3AF',
        fontSize: 16,
    },
    addStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusInput: {
        flex: 1,
        backgroundColor: '#2D2D2D',
        borderRadius: 8,
        padding: 8,
        color: '#FFFFFF',
        fontSize: 14,
    },
    addButton: {
        backgroundColor: '#2563EB',
        borderRadius: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
    },
    addStatusButton: {
        borderWidth: 1,
        borderColor: '#4B5563',
        borderStyle: 'dashed',
        borderRadius: 16,
        paddingVertical: 4,
        paddingHorizontal: 12,
    },
    addStatusButtonText: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    inviteButton: {
        backgroundColor: '#374151',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginTop: 16,
        alignItems: 'center',
    },
    inviteButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    modalContent: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 16,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        marginTop: 16,
    },
    projectMetadata: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    metadataText: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    dateText: {
        color: '#FFFFFF',
    },
    statusChipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    statusOptionChip: {
        backgroundColor: '#2D2D2D',
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#374151',
    },
    statusOptionSelected: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB',
    },
    statusOptionText: {
        color: '#9CA3AF',
        fontSize: 14,
        textTransform: 'capitalize',
    },
    statusOptionTextSelected: {
        color: '#FFFFFF',
    },
});