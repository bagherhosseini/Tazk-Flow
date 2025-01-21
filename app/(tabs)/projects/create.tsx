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
    ActivityIndicator,
    Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import ApiService from '@/services/api';
import { useAuth } from '@clerk/clerk-expo';
import { MaterialIcons } from '@expo/vector-icons';

// fix: Added proper type for project status
type ProjectStatus = 'active' | 'completed' | 'on_hold';

type ErrorModalProps = {
    visible: boolean;
    message: string;
    onClose: () => void;
};

const ErrorModal = ({ visible, message, onClose }: ErrorModalProps) => (
    <Modal
        transparent
        visible={visible}
        onRequestClose={onClose}
        animationType="fade"
    >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <MaterialIcons name="error" size={32} color="#EF4444" />
                <Text style={styles.modalText}>{message}</Text>
                <TouchableOpacity style={styles.modalButton} onPress={onClose}>
                    <Text style={styles.modalButtonText}>Close</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
);

const SuccessModal = ({ visible, onClose }: Omit<ErrorModalProps, 'message'>) => (
    <Modal
        transparent
        visible={visible}
        onRequestClose={onClose}
        animationType="fade"
    >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <MaterialIcons name="check-circle" size={32} color="#10B981" />
                <Text style={styles.modalText}>Project created successfully!</Text>
                <TouchableOpacity 
                    style={[styles.modalButton, styles.successButton]} 
                    onPress={onClose}
                >
                    <Text style={styles.modalButtonText}>Continue</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
);

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
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [showSuccess, setShowSuccess] = React.useState(false);

    const handleCreate = async () => {
        if (!name.trim()) {
            setError('Project name is required');
            return;
        }

        try {
            setIsLoading(true);
            const status: ProjectStatus = 'active';
            const newProjectData = {
                name: name.trim(),
                description: description.trim(),
                status,
                task_statuses: useCustomStatuses
                    ? customStatuses.split(',')
                          .map(s => s.trim().toLowerCase().replace(/\s+/g, '_'))
                          .filter(Boolean)
                    : DEFAULT_TASK_STATUSES,
                due_date: hasDueDate ? dueDate.toISOString() : undefined,
                created_at: new Date().toISOString(),
            };
            
            const token = await getToken();
            if (!token) {
                setError('Authentication required');
                return;
            }

            await ApiService.createProject(token, newProjectData);
            setShowSuccess(true);
        } catch (error) {
            setError('Failed to create project. Please try again.');
            console.error('Error creating project:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuccessClose = () => {
        setShowSuccess(false);
        router.back();
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Create Project</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Project Name *</Text>
                            <TextInput
                                style={[styles.input, !name.trim() && styles.inputError]}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter project name"
                                placeholderTextColor="#666666"
                                maxLength={50}
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
                                maxLength={500}
                            />
                        </View>

                        <View style={styles.card}>
                            <View style={styles.switchContainer}>
                                <Text style={styles.label}>Set Due Date</Text>
                                <Switch
                                    value={hasDueDate}
                                    onValueChange={setHasDueDate}
                                    trackColor={{ false: '#1E1E1E', true: '#2563EB' }}
                                    thumbColor={hasDueDate ? '#FFFFFF' : '#888888'}
                                />
                            </View>

                            {hasDueDate && (
                                <TouchableOpacity
                                    style={styles.dateInput}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <MaterialIcons name="calendar-today" size={20} color="#666666" />
                                    <Text style={styles.dateText}>
                                        {dueDate.toLocaleDateString()}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {showDatePicker && (
                            <DateTimePicker
                                value={dueDate}
                                mode="date"
                                minimumDate={new Date()}
                                onChange={(event, selectedDate) => {
                                    setShowDatePicker(false);
                                    if (selectedDate) {
                                        setDueDate(selectedDate);
                                    }
                                }}
                            />
                        )}

                        <View style={styles.card}>
                            <View style={styles.switchContainer}>
                                <Text style={styles.label}>Custom Task Statuses</Text>
                                <Switch
                                    value={useCustomStatuses}
                                    onValueChange={setUseCustomStatuses}
                                    trackColor={{ false: '#1E1E1E', true: '#2563EB' }}
                                    thumbColor={useCustomStatuses ? '#FFFFFF' : '#888888'}
                                />
                            </View>

                            {useCustomStatuses && (
                                <View style={styles.inputGroup}>
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
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                (!name.trim() || isLoading) && styles.buttonDisabled
                            ]}
                            onPress={handleCreate}
                            disabled={!name.trim() || isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.buttonText}>Create Project</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <ErrorModal
                visible={!!error}
                message={error}
                onClose={() => setError('')}
            />

            <SuccessModal
                visible={showSuccess}
                onClose={handleSuccessClose}
            />
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
    backButton: {
        marginRight: 16,
        padding: 4,
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
    card: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 16,
        gap: 16,
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
        borderRadius: 12,
        padding: 16,
        color: '#FFFFFF',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#2D2D2D',
    },
    inputError: {
        borderColor: '#EF4444',
    },
    textArea: {
        minHeight: 120,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#262626',
        borderRadius: 8,
        padding: 12,
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
        borderRadius: 12,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        gap: 16,
    },
    modalText: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 8,
    },
    modalButton: {
        backgroundColor: '#EF4444',
        borderRadius: 8,
        padding: 12,
        width: '100%',
        alignItems: 'center',
        marginTop: 8,
    },
    successButton: {
        backgroundColor: '#10B981',
    },
    modalButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});