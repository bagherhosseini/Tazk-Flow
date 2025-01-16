import * as React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Switch,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import ApiService from '@/services/api';
import { useAuth } from '@clerk/clerk-expo';

const DEFAULT_TASK_STATUSES = ['todo', 'in_progress', 'completed'];

export default function CreateProjectScreen() {
    const { getToken } = useAuth();
    const router = useRouter();
    const [name, setName] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [hasDueDate, setHasDueDate] = React.useState(false);
    const [dueDate, setDueDate] = React.useState(new Date());
    const [showDatePicker, setShowDatePicker] = React.useState(false);
    const [customStatuses, setCustomStatuses] = React.useState('');
    const [useCustomStatuses, setUseCustomStatuses] = React.useState(false);

    const handleCreate = async () => {
        try {
            const status : 'active' | 'completed' | 'on_hold' = 'active';
            const newProjectData = {
                name,
                description,
                status,
                task_statuses: useCustomStatuses
                    ? customStatuses.split(',').map(s => s.trim().toLowerCase().replace(/\s+/g, '_'))
                    : DEFAULT_TASK_STATUSES,
                due_date: hasDueDate ? dueDate.toISOString() : undefined,
            };
    
            console.log('Creating project:', newProjectData);
            
            const token = await getToken();
            if (!token) return;
            const createdProject = await ApiService.createProject(token, newProjectData);
            
            console.log('Project created successfully:', createdProject);
    
            router.back();
        } catch (error) {
            console.error('Error creating project:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Create Project</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Project Name</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter project name"
                                placeholderTextColor="#666666"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Enter project description"
                                placeholderTextColor="#666666"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.switchContainer}>
                            <Text style={styles.label}>Set Due Date</Text>
                            <Switch
                                value={hasDueDate}
                                onValueChange={setHasDueDate}
                                trackColor={{ false: '#1E1E1E', true: '#2563EB' }}
                            />
                        </View>

                        {hasDueDate && (
                            <TouchableOpacity
                                style={styles.dateInput}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text style={styles.dateText}>
                                    {dueDate.toLocaleDateString()}
                                </Text>
                            </TouchableOpacity>
                        )}

                        {showDatePicker && (
                            <DateTimePicker
                                value={dueDate}
                                mode="date"
                                onChange={(event, selectedDate) => {
                                    setShowDatePicker(false);
                                    if (selectedDate) {
                                        setDueDate(selectedDate);
                                    }
                                }}
                            />
                        )}

                        <View style={styles.switchContainer}>
                            <Text style={styles.label}>Custom Task Statuses</Text>
                            <Switch
                                value={useCustomStatuses}
                                onValueChange={setUseCustomStatuses}
                                trackColor={{ false: '#1E1E1E', true: '#2563EB' }}
                            />
                        </View>

                        {useCustomStatuses && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Status List (comma-separated)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={customStatuses}
                                    onChangeText={setCustomStatuses}
                                    placeholder="e.g., Backlog, In Design, In Development, Done"
                                    placeholderTextColor="#666666"
                                />
                                <Text style={styles.helper}>
                                    Enter status names separated by commas
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[
                                styles.button,
                                !name && styles.buttonDisabled
                            ]}
                            onPress={handleCreate}
                            disabled={!name}
                        >
                            <Text style={styles.buttonText}>Create Project</Text>
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
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        paddingBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    form: {
        padding: 24,
        gap: 24,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
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
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateInput: {
        backgroundColor: '#1E1E1E',
        borderRadius: 8,
        padding: 16,
        height: 56,
        justifyContent: 'center',
    },
    dateText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    helper: {
        color: '#666666',
        fontSize: 12,
        marginTop: 4,
    },
    button: {
        backgroundColor: '#2563EB',
        borderRadius: 8,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        backgroundColor: '#1E293B',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});