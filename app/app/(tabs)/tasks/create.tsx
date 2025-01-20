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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BasicProject, Task } from '@/services/api';
import { useAuth } from '@clerk/clerk-expo';
import ApiService from '@/services/api';

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

    React.useEffect(() => {
        async function fetchTasks() {
            try {
                const token = await getToken();
                if (!token) return;
                const tasks = await ApiService.getUserBasicProjects(token);
                setUserProjects(tasks);
            } catch (error) {
                console.error(error);
            }
        };

        fetchTasks();
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
            const createdTask = await ApiService.createTask(token, newTask);
            router.back();
        } catch (err) {
            console.error(JSON.stringify(err, null, 2));
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
            <Text style={[
                styles.priorityButtonText,
                { color: priority === value ? '#FFFFFF' : color }
            ]}>
                {label}
            </Text>
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
                    <Text style={styles.title}>Create New Task</Text>

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
                            placeholder="Title"
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
                            placeholder="Description"
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

                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={styles.dateInputText}>
                                {dueDate.toLocaleDateString()}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => setShowTimePicker(true)}
                        >
                            <Text style={styles.dateInputText}>
                                {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </TouchableOpacity>

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

                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectList}>
                                    {userProjects ?
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
                                        : <Text>No project</Text>
                                    }
                                </ScrollView>

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
                                (!title.trim() || !description.trim()) && styles.disabledButton
                            ]}
                            disabled={!title.trim() || !description.trim()}
                        >
                            <Text style={styles.buttonText}>Create Task</Text>
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
        // padding: 24,
        paddingHorizontal: 24,
        marginVertical: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 32,
    },
    formContainer: {
        flex: 1,
        gap: 16,
    },
    input: {
        backgroundColor: '#1E1E1E',
        borderRadius: 8,
        padding: 16,
        color: '#FFFFFF',
        fontSize: 16,
    },
    textArea: {
        minHeight: 100,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    switchLabel: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    projectSection: {
        gap: 8,
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
        paddingVertical: 8,
        borderRadius: 16,
        marginRight: 8,
    },
    projectChipSelected: {
        backgroundColor: '#2563EB',
    },
    projectChipText: {
        color: '#FFFFFF',
        fontSize: 14,
    },
    dateInput: {
        backgroundColor: '#1E1E1E',
        borderRadius: 8,
        padding: 16,
        height: 56,
        justifyContent: 'center',
    },
    dateInputText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#2563EB',
        borderRadius: 8,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    priorityButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    priorityButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    priorityButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    prioritySection: {
        gap: 8,
    },
    statusSection: {
        marginTop: 16,
        gap: 8,
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
        fontWeight: '500',
    },
    statusButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: '#1A1A1A',
        marginRight: 8,
    },
    statusButtonSelected: {
        backgroundColor: '#2563EB',
    },
    memberSection: {
        marginTop: 16,
        gap: 8,
    },
    memberChips: {
        flexDirection: 'row',
        gap: 10,
        paddingBottom: 35,
    },
    memberChip: {
        backgroundColor: '#1E1E1E',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
    },
    memberChipSelected: {
        backgroundColor: '#2563EB',
    },
    memberChipText: {
        color: '#FFFFFF',
        fontSize: 14,
    },
    memberChipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingRight: 10,
        paddingVertical: 1.2,
        overflow: 'visible',
        backgroundColor: '#1E1E1E',
    },
    memberMainChip: {
        paddingRight: 8,
    },
    emailIcon: {
        paddingLeft: 8,
        paddingVertical: 8,
        borderLeftWidth: 1,
        borderLeftColor: '#333',
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