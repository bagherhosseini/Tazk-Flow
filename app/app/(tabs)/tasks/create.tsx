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
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Project, Task, userProjects } from '../../../data/data'; // Import userProjects

export default function CreateScreen() {
    const router = useRouter();
    const [title, setTitle] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [isProjectTask, setIsProjectTask] = React.useState(false);
    const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
    const [showProjectCreate, setShowProjectCreate] = React.useState(false);
    const [dueDate, setDueDate] = React.useState(new Date());
    const [showDatePicker, setShowDatePicker] = React.useState(false);
    const [showTimePicker, setShowTimePicker] = React.useState(false);
    const [priority, setPriority] = React.useState<Task['priority']>('medium');

    const onCreatePress = async () => {
        try {
            const newTask: Partial<Task> = {
                title,
                description,
                priority,
                dueDate: dueDate.toISOString(),
                createdAt: new Date().toISOString(),
                status: 'todo',
                project: isProjectTask && selectedProject ? {
                    id: selectedProject.id,
                    name: selectedProject.name,
                } : undefined,
                tags: [],
                attachments: [],
                comments: [],
            };

            console.log('Creating new task:', newTask);
            router.back();
        } catch (err) {
            console.error(JSON.stringify(err, null, 2));
        }
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
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Title"
                            placeholderTextColor="#666"
                            style={styles.input}
                        />

                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Description"
                            placeholderTextColor="#666"
                            style={[styles.input, styles.textArea]}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />

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
                                    {userProjects.map((project) => (
                                        <TouchableOpacity
                                            key={project.id}
                                            style={[
                                                styles.projectChip,
                                                selectedProject?.id === project.id && styles.projectChipSelected,
                                            ]}
                                            onPress={() => setSelectedProject(project)}
                                        >
                                            <Text style={styles.projectChipText}>{project.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

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
                                onChange={(event, selectedDate) => {
                                    if (selectedDate) {
                                        setDueDate(selectedDate);
                                    }
                                    setShowDatePicker(false);
                                    setShowTimePicker(false);
                                }}
                            />
                        )}

                        <TouchableOpacity onPress={onCreatePress} style={styles.button}>
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
        padding: 24,
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
        paddingHorizontal: 8,
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
});