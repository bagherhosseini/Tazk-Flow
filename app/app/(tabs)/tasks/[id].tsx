import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import React, { useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useAuth } from '@clerk/clerk-expo';
import DateTimePicker from '@react-native-community/datetimepicker';
import ApiService, { Task as TaskType } from '@/services/api';

export default function Task() {
    const { id } = useLocalSearchParams();
    const taskId = Array.isArray(id) ? id[0] : id;
    const { getToken, userId } = useAuth();
    const [task, setTask] = React.useState<TaskType>();
    const [isEditing, setIsEditing] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [editedTask, setEditedTask] = React.useState<Partial<TaskType>>({});
    const [showDatePicker, setShowDatePicker] = React.useState(false);
    const [datePickerMode, setDatePickerMode] = React.useState<'date' | 'time'>('date');
    const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
    const [visibleEmail, setVisibleEmail] = React.useState<string | null>(null);
    const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

    const validateEditForm = () => {
        const newErrors: Record<string, string> = {};

        if (!editedTask.title?.trim()) {
            newErrors.title = 'Title is required';
        }
        if (!editedTask.description?.trim()) {
            newErrors.description = 'Description is required';
        }
        if (!editedTask.status) {
            newErrors.status = 'Status is required';
        }
        if (!editedTask.priority) {
            newErrors.priority = 'Priority is required';
        }

        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Function to check if task has been modified
    const hasTaskBeenModified = () => {
        if (!task) return false;

        return (
            editedTask.title !== task.title ||
            editedTask.description !== task.description ||
            editedTask.status !== task.status ||
            editedTask.priority !== task.priority ||
            editedTask.due_date !== task.due_date ||
            editedTask.assigned_to !== task.assigned_to
        );
    };

    // Function to get member display name with additional info
    const getMemberDisplayName = (member: { first_name: string; last_name: string; role: string; email: string }) => {
        return `${member.first_name} ${member.last_name} (${member.role}) - ${member.email}`;
    };

    useEffect(() => {
        async function fetchData() {
            try {
                const token = await getToken();
                if (!token) return;
                const task = await ApiService.getTask(token, taskId);
                setTask(task);
                setEditedTask({
                    title: task.title,
                    description: task.description,
                    status: task.status,
                    priority: task.priority,
                    due_date: task.due_date,
                    assigned_to: task.assigned_to,
                });
                setSelectedDate(new Date(task.due_date));
            } catch (error) {
                console.error(error);
            }
        }

        fetchData();
    }, [taskId]);

    const handleSave = async () => {
        if (!validateEditForm()) {
            return;
        }

        if (!task) return;

        // Check if any changes were made
        if (!hasTaskBeenModified()) {
            setIsEditing(false);
            return;
        }

        try {
            setIsSaving(true);
            const token = await getToken();
            if (!token) return;
            const updatedTask = await ApiService.updateTask(token, taskId, editedTask);
            setTask(updatedTask);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update task:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            if (datePickerMode === 'date') {
                // Keep the existing time, update the date
                const currentDate = new Date(editedTask.due_date || task?.due_date || new Date());
                selectedDate.setHours(currentDate.getHours(), currentDate.getMinutes());
                setSelectedDate(selectedDate);
                setDatePickerMode('time');
                setShowDatePicker(true);
            } else {
                // Update the time
                const finalDate = new Date(selectedDate);
                setSelectedDate(finalDate);
                setEditedTask(prev => ({
                    ...prev,
                    due_date: finalDate.toISOString(),
                }));
                setDatePickerMode('date');
            }
        }
    };

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

    const renderEditableContent = () => (
        <View style={styles.editContainer}>
            <View style={styles.requiredLabel}>
                <Text style={styles.sectionTitle}>Title</Text>
                <Text style={styles.requiredField}>*</Text>
            </View>
            <TextInput
                style={[
                    styles.input,
                    formErrors.title ? styles.inputError : null
                ]}
                value={editedTask.title}
                onChangeText={(text) => {
                    setEditedTask(prev => ({ ...prev, title: text }));
                    if (formErrors.title) {
                        setFormErrors(prev => ({ ...prev, title: '' }));
                    }
                }}
                placeholder="Task Title"
                placeholderTextColor="#6B7280"
            />
            {formErrors.title ? (
                <Text style={styles.errorText}>{formErrors.title}</Text>
            ) : null}

            <View style={styles.requiredLabel}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.requiredField}>*</Text>
            </View>
            <TextInput
                style={[
                    styles.input,
                    styles.descriptionInput,
                    formErrors.description ? styles.inputError : null
                ]}
                value={editedTask.description}
                onChangeText={(text) => {
                    setEditedTask(prev => ({ ...prev, description: text }));
                    if (formErrors.description) {
                        setFormErrors(prev => ({ ...prev, description: '' }));
                    }
                }}
                placeholder="Description"
                placeholderTextColor="#6B7280"
                multiline
            />
            {formErrors.description ? (
                <Text style={styles.errorText}>{formErrors.description}</Text>
            ) : null}

            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.chipContainer}>
                {(task?.project
                    ? task.project.task_statuses
                    : ['todo', 'done', 'expired']
                ).map(statusOption => (
                    <TouchableOpacity
                        key={statusOption}
                        style={[
                            styles.chip,
                            editedTask.status === statusOption && styles.chipSelected
                        ]}
                        onPress={() => setEditedTask(prev => ({ ...prev, status: statusOption }))}
                    >
                        <Text style={[
                            styles.chipText,
                            editedTask.status === statusOption && styles.chipTextSelected
                        ]}>
                            {statusOption.replace('_', ' ')}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.sectionTitle}>Priority</Text>
            <View style={styles.chipContainer}>
                {(['low', 'medium', 'high'] as const).map(priorityOption => (
                    <TouchableOpacity
                        key={priorityOption}
                        style={[
                            styles.chip,
                            editedTask.priority === priorityOption && styles.chipSelected
                        ]}
                        onPress={() => setEditedTask(prev => ({ ...prev, priority: priorityOption }))}
                    >
                        <Text style={[
                            styles.chipText,
                            editedTask.priority === priorityOption && styles.chipTextSelected
                        ]}>
                            {priorityOption}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.sectionTitle}>Due Date</Text>
            <TouchableOpacity
                style={styles.input}
                onPress={() => {
                    setDatePickerMode('date');
                    setShowDatePicker(true);
                }}
            >
                <Text style={styles.dateText}>
                    {format(selectedDate, 'MMM dd, yyyy HH:mm')}
                </Text>
            </TouchableOpacity>

            {task?.project?.members && (
                <>
                    <Text style={styles.sectionTitle}>Assigned To</Text>
                    <View style={styles.chipContainer}>
                        <TouchableOpacity
                            style={[
                                styles.chip,
                                editedTask.assigned_to === userId && styles.chipSelected
                            ]}
                            onPress={() => setEditedTask(prev => ({
                                ...prev,
                                assigned_to: userId || undefined
                            }))}
                        >
                            <Text style={[
                                styles.chipText,
                                editedTask.assigned_to === userId && styles.chipTextSelected
                            ]}>
                                Assign to me
                            </Text>
                        </TouchableOpacity>
                        {task.project.members
                            .filter(member => member.user_id !== userId)
                            .map((member) => (
                                <TouchableOpacity
                                    key={member.user_id}
                                    style={[
                                        styles.memberChipContainer,
                                        editedTask.assigned_to === member.user_id && styles.chipSelected
                                    ]}
                                >
                                    <TouchableOpacity
                                        style={styles.memberMainChip}
                                        onPress={() => setEditedTask(prev => ({ ...prev, assigned_to: member.user_id }))}
                                    >
                                        <Text style={[
                                            styles.chipText,
                                            editedTask.assigned_to === member.user_id && styles.chipTextSelected
                                        ]}>
                                            {`${member.first_name} ${member.last_name} (${member.role})`}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.emailIcon}
                                        onPress={() => setVisibleEmail(visibleEmail === member.user_id ? null : member.user_id)}
                                    >
                                        <MaterialCommunityIcons
                                            name="information"
                                            size={16}
                                            color="#FFFFFF"
                                        />
                                    </TouchableOpacity>
                                    {visibleEmail === member.user_id && (
                                        <View style={styles.emailTooltip}>
                                            <Text style={styles.emailTooltipText}>{member.email}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))
                        }
                    </View>
                </>
            )}

            <View style={styles.editActions}>
                <TouchableOpacity
                    style={[styles.editButton, styles.cancelButton]}
                    onPress={() => {
                        setIsEditing(false);
                        setFormErrors({});
                        setEditedTask({
                            title: task?.title,
                            description: task?.description,
                            status: task?.status,
                            priority: task?.priority,
                            due_date: task?.due_date,
                            assigned_to: task?.assigned_to,
                        });
                    }}
                >
                    <Text style={styles.editButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.editButton,
                        styles.saveButton,
                        (!editedTask.title?.trim() || !editedTask.description?.trim()) && styles.disabledButton
                    ]}
                    onPress={handleSave}
                    disabled={isSaving || !editedTask.title?.trim() || !editedTask.description?.trim()}
                >
                    {isSaving ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <Text style={styles.editButtonText}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

    if (!task) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorTextNotFound}>Task not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                {isEditing ? (
                    renderEditableContent()
                ) : (
                    <View style={styles.titleSection}>
                        <View style={styles.titleRow}>
                            <Text style={styles.title}>{task.title}</Text>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => setIsEditing(true)}
                            >
                                <Text style={styles.editButtonText}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.badges}>
                            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
                                <Text style={styles.badgeText}>{task.priority}</Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: task.status === 'completed' ? '#4CAF50' : '#FF9800' }]}>
                                <Text style={styles.badgeText}>{task.status}</Text>
                            </View>
                        </View>
                    </View>
                )}
            </View>

            {!isEditing && (
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
                                    {format(new Date(task.due_date), 'MMM dd, yyyy')}
                                </Text>
                            </View>
                            <View style={styles.timelineItem}>
                                <Text style={styles.timelineLabel}>Created</Text>
                                <Text style={styles.timelineValue}>
                                    {format(new Date(task.created_at), 'MMM dd, yyyy')}
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

                    {task.project?.members && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialCommunityIcons name="account" size={20} color="#FFFFFF" />
                                <Text style={styles.sectionTitle}>Assigned To</Text>
                            </View>
                            <Text style={styles.description}>
                                {task.assigned_to === userId
                                    ? 'Assigned to me'
                                    : task.project.members.find(m => m.user_id === task.assigned_to)
                                        ? getMemberDisplayName(task.project.members.find(m => m.user_id === task.assigned_to)!)
                                        : 'Unassigned'
                                }
                            </Text>
                        </View>
                    )}

                    {/* {task.comments && task.comments.length > 0 && (
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
                )} */}
                </View>
            )}

            {showDatePicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode={datePickerMode}
                    onChange={handleDateChange}
                />
            )}
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
    errorTextNotFound: {
        color: '#E0E0E0',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    editContainer: {
        gap: 16,
    },
    input: {
        backgroundColor: '#2D2D2D',
        borderRadius: 8,
        padding: 12,
        color: '#FFFFFF',
        fontSize: 16,
    },
    descriptionInput: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginTop: 8,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        backgroundColor: '#2D2D2D',
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#374151',
    },
    chipSelected: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB',
    },
    chipText: {
        color: '#9CA3AF',
        fontSize: 14,
        textTransform: 'capitalize',
    },
    chipTextSelected: {
        color: '#FFFFFF',
    },
    editActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        marginTop: 16,
    },
    editButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        backgroundColor: '#2563EB',
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
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateText: {
        color: '#FFFFFF',
    },
    memberChipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        marginRight: 8,
        overflow: 'visible',
        backgroundColor: '#2D2D2D',
        borderWidth: 1,
        borderColor: '#374151',
    },
    memberMainChip: {
        paddingVertical: 6,
        paddingLeft: 12,
        paddingRight: 4,
    },
    emailIcon: {
        padding: 8,
        borderLeftWidth: 1,
        borderLeftColor: '#333',
    },
    emailTooltip: {
        position: 'absolute',
        bottom: -40,
        left: 0,
        right: 0,
        backgroundColor: '#333',
        padding: 8,
        borderRadius: 8,
        zIndex: 1,
    },
    emailTooltipText: {
        color: '#FFFFFF',
        fontSize: 12,
    },
    requiredLabel: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        gap: 4,
    },
    requiredField: {
        color: '#FF4444',
        fontSize: 14,
    },
    inputError: {
        borderWidth: 1,
        borderColor: '#FF4444',
    },
    errorText: {
        color: '#FF4444',
        fontSize: 12,
        marginTop: 4,
    },
    disabledButton: {
        opacity: 0.5,
    }
});