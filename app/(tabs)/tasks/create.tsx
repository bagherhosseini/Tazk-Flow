import * as React from 'react';
import {
    Text,
    TextInput,
    TouchableOpacity,
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    Switch,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BasicProject, Task } from '@/services/api';
import { useAuth } from '@clerk/clerk-expo';
import ApiService from '@/services/api';
import { LinearGradient } from 'expo-linear-gradient';

// fix: Added loading states
interface LoadingStates {
    projects: boolean;
    createTask: boolean;
}

export default function CreateScreen() {
    const { getToken, userId } = useAuth();
    const router = useRouter();
    const [title, setTitle] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [isProjectTask, setIsProjectTask] = React.useState(false);
    const [selectedProject, setSelectedProject] = React.useState<BasicProject | null>(null);
    const [showProjectCreate, setShowProjectCreate] = React.useState(false);
    const [dueDate, setDueDate] = React.useState(new Date());
    const [showDatePicker, setShowDatePicker] = React.useState(false);
    const [showTimePicker, setShowTimePicker] = React.useState(false);
    const [priority, setPriority] = React.useState<Task['priority']>('medium');
    const [userProjects, setUserProjects] = React.useState<BasicProject[]>();
    const [status, setStatus] = React.useState('todo');
    const [assignedTo, setAssignedTo] = React.useState<string>('');
    const [visibleEmail, setVisibleEmail] = React.useState<string | null>(null);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    // fix: Added loading states initialization
    const [loading, setLoading] = React.useState<LoadingStates>({
        projects: true,
        createTask: false,
    });

    // fix: Added error handling for network failures
    const [networkError, setNetworkError] = React.useState<string | null>(null);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!title.trim()) {
            newErrors.title = 'Title is required';
        }
        if (!description.trim()) {
            newErrors.description = 'Description is required';
        }
        if (isProjectTask && !selectedProject) {
            newErrors.project = 'Project selection is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    async function fetchProjects() {
        try {
            setLoading(prev => ({ ...prev, projects: true }));
            setNetworkError(null);
            const token = await getToken();
            if (!token) return;
            const projects = await ApiService.getUserBasicProjects(token);
            setUserProjects(projects);
        } catch (error) {
            setNetworkError('Failed to load projects. Please try again.');
            console.error(error);
        } finally {
            setLoading(prev => ({ ...prev, projects: false }));
        }
    }

    React.useEffect(() => {
        fetchProjects();
    }, []);

    const handleProjectSelect = (project: BasicProject) => {
        setSelectedProject(project);
        if (project.task_statuses?.length > 0) {
            setStatus(project.task_statuses[0]);
        }
        if (project.due_date) {
            const projectDueDate = new Date(project.due_date);
            if (dueDate > projectDueDate) {
                setDueDate(projectDueDate);
                Alert.alert(
                    "Due Date Adjusted",
                    "Task due date has been set to match project due date.",
                    [{ text: "OK" }]
                );
            }
        }
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || dueDate;

        if (selectedProject?.due_date) {
            const projectDueDate = new Date(selectedProject.due_date);
            if (currentDate > projectDueDate) {
                Alert.alert(
                    "Invalid Date",
                    "Task due date cannot be later than project due date.",
                    [{ text: "OK" }]
                );
                return;
            }
        }

        setDueDate(currentDate);
        setShowDatePicker(false);
        setShowTimePicker(false);
    };

    const onCreatePress = async () => {
        try {
            if (!validateForm()) return;
            setLoading(prev => ({ ...prev, createTask: true }));

            if (selectedProject?.due_date && dueDate > new Date(selectedProject.due_date)) {
                Alert.alert(
                    "Invalid Due Date",
                    "Task due date cannot be later than project due date.",
                    [{ text: "OK" }]
                );
                return;
            }

            const newTask = {
                title,
                description,
                status: isProjectTask ? status : 'Todo',
                priority,
                due_date: dueDate.toISOString(),
                created_at: new Date().toISOString(),
                project: isProjectTask && selectedProject ? selectedProject.id : undefined,
                assigned_to: isProjectTask ? assignedTo : undefined,
                tags: [],
                attachments: [],
                comments: [],
            };
            const token = await getToken();
            if (!token) return;
            await ApiService.createTask(token, newTask);
            router.back();
        } catch (err) {
            Alert.alert(
                "Error",
                "Failed to create task. Please try again.",
                [{ text: "OK" }]
            );
            console.error(JSON.stringify(err, null, 2));
        } finally {
            setLoading(prev => ({ ...prev, createTask: false }));
        }
    };

    const PriorityButton = ({ value, label, color }: { value: Task['priority'], label: string, color: string }) => (
        <TouchableOpacity
            style={[
                styles.priorityButton,
                { backgroundColor: priority === value ? color : 'transparent' },
                { borderColor: color }
            ]}
            onPress={() => setPriority(value)}
        >
            <LinearGradient
                colors={priority === value ? [color, color + '99'] : ['transparent', 'transparent']}
                style={styles.priorityButtonGradient}
            >
                <Text style={[
                    styles.priorityButtonText,
                    { color: priority === value ? '#FFFFFF' : color }
                ]}>
                    {label}
                </Text>
            </LinearGradient>
        </TouchableOpacity>
    );

    const StatusButton = ({ value }: { value: string }) => (
        <TouchableOpacity
            style={[
                styles.statusButton,
                status === value && styles.statusButtonSelected
            ]}
            onPress={() => setStatus(value)}
        >
            <Text style={[
                styles.statusButtonText,
                status === value && styles.statusButtonTextSelected
            ]}>
                {value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
        </TouchableOpacity>
    );

    const MemberSelector = ({ members }: { members: Array<{ first_name: string; last_name: string; user_id: string; image_url: string; role: string; email: string }> }) => {
        return (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.memberChips}>
                    <TouchableOpacity
                        style={[
                            styles.memberChip,
                            assignedTo === userId && styles.memberChipSelected,
                        ]}
                        onPress={() => setAssignedTo(userId ?? '')}
                    >
                        <Text style={styles.memberChipText}>
                            Assign to me
                        </Text>
                    </TouchableOpacity>
                    {members
                        .filter(member => member.user_id !== userId)
                        .map((member) => (
                            <TouchableOpacity
                                key={member.user_id}
                                style={[
                                    styles.memberChipContainer,
                                    assignedTo === member.user_id && styles.memberChipSelected,
                                ]}
                            >
                                <TouchableOpacity
                                    style={styles.memberMainChip}
                                    onPress={() => setAssignedTo(member.user_id)}
                                >
                                    <Text style={styles.memberChipText}>
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
            </ScrollView>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView style={styles.content}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Create New Task</Text>
                    </View>

                    {networkError && (
                        <View style={styles.errorBanner}>
                            <Text style={styles.errorBannerText}>{networkError}</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setNetworkError(null);
                                    fetchProjects();
                                }}
                                style={styles.retryButton}
                            >
                                <Text style={styles.retryButtonText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.formContainer}>
                        <View style={styles.requiredLabel}>
                            <Text style={styles.sectionTitle}>Title</Text>
                            <Text style={styles.requiredField}>*</Text>
                        </View>
                        <TextInput
                            value={title}
                            onChangeText={(text) => {
                                setTitle(text);
                                if (errors.title) {
                                    setErrors(prev => ({ ...prev, title: '' }));
                                }
                            }}
                            placeholder="Enter task title"
                            placeholderTextColor="#666"
                            style={[
                                styles.input,
                                errors.title ? styles.inputError : null
                            ]}
                        />
                        {errors.title ? (
                            <Text style={styles.errorText}>{errors.title}</Text>
                        ) : null}

                        <View style={styles.requiredLabel}>
                            <Text style={styles.sectionTitle}>Description</Text>
                            <Text style={styles.requiredField}>*</Text>
                        </View>
                        <TextInput
                            value={description}
                            onChangeText={(text) => {
                                setDescription(text);
                                if (errors.description) {
                                    setErrors(prev => ({ ...prev, description: '' }));
                                }
                            }}
                            placeholder="Enter task description"
                            placeholderTextColor="#666"
                            style={[
                                styles.input,
                                styles.textArea,
                                errors.description ? styles.inputError : null
                            ]}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                        {errors.description ? (
                            <Text style={styles.errorText}>{errors.description}</Text>
                        ) : null}

                        <View style={styles.prioritySection}>
                            <Text style={styles.sectionTitle}>Priority</Text>
                            <View style={styles.priorityButtons}>
                                <PriorityButton value="low" label="Low" color="#22C55E" />
                                <PriorityButton value="medium" label="Medium" color="#F59E0B" />
                                <PriorityButton value="high" label="High" color="#EF4444" />
                            </View>
                        </View>

                        <View style={styles.dateSection}>
                            <Text style={styles.sectionTitle}>Due Date & Time</Text>
                            <View style={styles.dateTimeContainer}>
                                <TouchableOpacity
                                    style={[styles.dateInput, styles.dateInputHalf]}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <MaterialCommunityIcons name="calendar" size={20} color="#666" />
                                    <Text style={styles.dateInputText}>
                                        {dueDate.toLocaleDateString()}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.dateInput, styles.dateInputHalf]}
                                    onPress={() => setShowTimePicker(true)}
                                >
                                    <MaterialCommunityIcons name="clock-outline" size={20} color="#666" />
                                    <Text style={styles.dateInputText}>
                                        {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {(showDatePicker || showTimePicker) && (
                            <DateTimePicker
                                value={dueDate}
                                mode={showDatePicker ? 'date' : 'time'}
                                is24Hour={true}
                                onChange={handleDateChange}
                                maximumDate={selectedProject?.due_date ? new Date(selectedProject.due_date) : undefined}
                            />
                        )}

                        <View style={styles.switchContainer}>
                            <Text style={styles.switchLabel}>Project Task</Text>
                            <Switch
                                value={isProjectTask}
                                onValueChange={setIsProjectTask}
                                trackColor={{ false: '#1E1E1E', true: '#2563EB' }}
                                thumbColor={isProjectTask ? '#FFFFFF' : '#666666'}
                            />
                        </View>

                        {isProjectTask && (
                            <View style={styles.projectSection}>
                                <View style={styles.projectHeader}>
                                    <Text style={styles.sectionTitle}>Select Project</Text>
                                    <TouchableOpacity
                                        onPress={() => setShowProjectCreate(true)}
                                        style={styles.addProjectButton}
                                    >
                                        <Text style={styles.addProjectButtonText}>+ New Project</Text>
                                    </TouchableOpacity>
                                </View>

                                {loading.projects ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator color="#2563EB" />
                                        <Text style={styles.loadingText}>Loading projects...</Text>
                                    </View>
                                ) : (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectList}>
                                        {userProjects && userProjects.length > 0 ? (
                                            userProjects.map((project) => (
                                                <TouchableOpacity
                                                    key={project.id}
                                                    style={[
                                                        styles.projectChip,
                                                        selectedProject?.id === project.id && styles.projectChipSelected,
                                                    ]}
                                                    onPress={() => handleProjectSelect(project)}
                                                >
                                                    <Text style={styles.projectChipText}>{project.name}</Text>
                                                </TouchableOpacity>
                                            ))
                                        ) : (
                                            <Text style={styles.noProjectsText}>No projects available</Text>
                                        )}
                                    </ScrollView>
                                )}

                                {selectedProject && selectedProject.task_statuses && (
                                    <View style={styles.statusSection}>
                                        <Text style={styles.sectionTitle}>Status</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            <View style={styles.statusButtons}>
                                                {selectedProject.task_statuses.map((statusValue) => (
                                                    <StatusButton key={statusValue} value={statusValue} />
                                                ))}
                                            </View>
                                        </ScrollView>

                                        {isProjectTask && selectedProject?.members && (
                                            <View style={styles.memberSection}>
                                                <Text style={styles.sectionTitle}>Assign To</Text>
                                                <MemberSelector members={selectedProject.members} />
                                            </View>
                                        )}
                                    </View>
                                )}
                            </View>
                        )}

                        <TouchableOpacity
                            onPress={onCreatePress}
                            style={[
                                styles.button,
                                (!title.trim() || !description.trim() || loading.createTask) && styles.disabledButton
                            ]}
                            disabled={!title.trim() || !description.trim() || loading.createTask}
                        >
                            {loading.createTask ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.buttonText}>Create Task</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 32,
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    formContainer: {
        flex: 1,
        gap: 20,
    },
    input: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 16,
        color: '#FFFFFF',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },
    textArea: {
        minHeight: 120,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1E1E1E',
        padding: 16,
        borderRadius: 12,
    },
    switchLabel: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    projectSection: {
        gap: 12,
    },
    projectHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    addProjectButton: {
        padding: 8,
        backgroundColor: '#1E1E1E',
        borderRadius: 8,
    },
    addProjectButtonText: {
        color: '#2563EB',
        fontSize: 14,
        fontWeight: '600',
    },
    projectList: {
        paddingVertical: 8,
    },
    projectChip: {
        backgroundColor: '#1E1E1E',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },
    projectChipSelected: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB',
    },
    projectChipText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    dateSection: {
        gap: 8,
    },
    dateTimeContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    dateInput: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 16,
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },
    dateInputHalf: {
        flex: 1,
        gap: 8,
    },
    dateInputText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        marginBottom: 32,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    priorityButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    priorityButton: {
        flex: 1,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    priorityButtonGradient: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    priorityButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    prioritySection: {
        gap: 12,
    },
    statusSection: {
        marginTop: 16,
        gap: 12,
    },
    statusButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    statusButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
    },
    statusButtonTextSelected: {
        fontWeight: '600',
    },
    statusButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#1E1E1E',
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },
    statusButtonSelected: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB',
    },
    memberSection: {
        marginTop: 16,
        gap: 12,
    },
    memberChips: {
        flexDirection: 'row',
        gap: 12,
        paddingBottom: 35,
    },
    memberChip: {
        backgroundColor: '#1E1E1E',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },
    memberChipSelected: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB',
    },
    memberChipText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    memberChipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        paddingLeft: 16,
        paddingRight: 10,
        paddingVertical: 2,
        overflow: 'visible',
        backgroundColor: '#1E1E1E',
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },
    memberMainChip: {
        paddingVertical: 8,
        paddingRight: 8,
    },
    emailIcon: {
        paddingLeft: 8,
        paddingVertical: 8,
        borderLeftWidth: 1,
        borderLeftColor: '#2A2A2A',
    },
    emailTooltip: {
        position: 'absolute',
        bottom: -35,
        left: 0,
        right: 0,
        backgroundColor: '#333',
        padding: 8,
        borderRadius: 8,
        zIndex: 1,
        alignItems: 'center',
    },
    emailTooltipText: {
        color: '#FFFFFF',
        fontSize: 12,
    },
    requiredLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    requiredField: {
        color: '#FF4444',
        fontSize: 14,
    },
    inputError: {
        borderColor: '#FF4444',
    },
    errorText: {
        color: '#FF4444',
        fontSize: 12,
        marginTop: 4,
    },
    disabledButton: {
        opacity: 0.5,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
        gap: 8,
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 14,
    },
    errorBanner: {
        backgroundColor: '#FF444420',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    errorBannerText: {
        color: '#FF4444',
        fontSize: 14,
        flex: 1,
    },
    retryButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#FF444420',
        borderRadius: 6,
    },
    retryButtonText: {
        color: '#FF4444',
        fontSize: 14,
        fontWeight: '500',
    },
    noProjectsText: {
        color: '#666',
        fontSize: 14,
        padding: 8,
    },
});