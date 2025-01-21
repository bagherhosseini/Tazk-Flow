import { Text, View, ActivityIndicator, Pressable, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState, useCallback, useMemo } from 'react';
import ApiService, { Task, TasksResponse } from '../../../services/api';

interface LoadingStates {
  initial: boolean;
  refresh: boolean;
}

export default function Index() {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [tasksData, setTasksData] = useState<TasksResponse>();
  const [loading, setLoading] = useState<LoadingStates>({
    initial: true,
    refresh: false
  });
  const [error, setError] = useState<string | null>(null);

  const getRandomGradient = useMemo(() => () => {
    const gradients = [
      ['#FF6B6B', '#4ECDC4'],
      ['#A8E6CF', '#DCEDC1'],
      ['#FFD93D', '#FF6B6B'],
      ['#6C5CE7', '#A8E6CF'],
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  }, []);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      setError(null);
      const token = await getToken();
      if (!token) {
        setError('Authentication token not found');
        return;
      }
      const response = await ApiService.getAllVisibleTasks(token);
      setTasksData(response);
    } catch (error) {
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(prev => ({
        ...prev,
        [isRefresh ? 'refresh' : 'initial']: false
      }));
    }
  }, [getToken]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (mounted) {
        await fetchData();
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const handleTaskPress = useCallback((taskId: string) => {
    router.push(`/tasks/${taskId}`);
  }, [router]);

  const onRefresh = useCallback(() => {
    setLoading(prev => ({ ...prev, refresh: true }));
    fetchData(true);
  }, [fetchData]);

  const renderTaskCard = useCallback((task: Task) => (
    <TouchableOpacity
      key={task.id}
      style={styles.taskLink}
      onPress={() => handleTaskPress(task.id)}
      activeOpacity={0.7}
    >
      <View style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle} numberOfLines={1}>
            {task.title}
          </Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: task.status === 'completed' ? '#4CAF50' : '#FF9800' }
          ]}>
            <Text style={styles.statusText}>{task.status || 'pending'}</Text>
          </View>
        </View>
        <Text numberOfLines={2} style={styles.taskDescription}>
          {task.description}
        </Text>
        <View style={styles.taskFooter}>
          <Text style={styles.dueDate}>
            Due: {new Date(task.due_date).toLocaleDateString()}
          </Text>
          {task.priority && (
            <View style={[
              styles.priorityBadge,
              {
                backgroundColor:
                  task.priority === 'high' ? '#FF5252' :
                  task.priority === 'medium' ? '#FFC107' : '#4CAF50'
              }
            ]}>
              <Text style={styles.priorityText}>{task.priority}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  ), [handleTaskPress]);

  if (loading.initial) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.loadingText}>Loading your tasks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#FF5252" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchData()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={loading.refresh}
          onRefresh={onRefresh}
          tintColor="#4ECDC4"
          colors={['#4ECDC4']}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.firstName || 'User'}</Text>
      </View>

      <Pressable style={styles.sectionContainer}>
        <View style={styles.sectionHeaderContainer}>
          <MaterialCommunityIcons name="bag-personal" size={24} color="#FFFFFF" />
          <Text style={styles.sectionHeader}>Personal Tasks</Text>
        </View>

        {!tasksData?.personal_tasks?.length ? (
          <View style={styles.emptyStateContainer}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#808080" />
            <Text style={styles.noTasks}>No personal tasks available</Text>
            <Text style={styles.emptyStateSubtext}>
              Your personal tasks will appear here
            </Text>
          </View>
        ) : (
          tasksData.personal_tasks.map(renderTaskCard)
        )}
      </Pressable>

      <Pressable style={styles.sectionContainer}>
        <View style={styles.sectionHeaderContainer}>
          <MaterialCommunityIcons name="folder-multiple" size={24} color="#FFFFFF" />
          <Text style={styles.sectionHeader}>Project Tasks</Text>
        </View>
        
        {!tasksData?.project_tasks?.length ? (
          <View style={styles.emptyStateContainer}>
            <MaterialCommunityIcons name="folder-outline" size={48} color="#808080" />
            <Text style={styles.noTasks}>No project tasks available</Text>
            <Text style={styles.emptyStateSubtext}>
              Tasks from your projects will appear here
            </Text>
          </View>
        ) : (
          tasksData.project_tasks.map((project) => (
            <View key={project.id} style={styles.projectContainer}>
              <View style={styles.projectHeaderContainer}>
                <View style={[styles.projectIcon, { backgroundColor: getRandomGradient()[0] }]}>
                  <Text style={styles.projectIconText}>
                    {project.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.projectHeader}>{project.name}</Text>
              </View>
              {project.tasks.map(renderTaskCard)}
            </View>
          ))
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 24,
    paddingTop: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#B0B0B0',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF5252',
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionContainer: {
    gap: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  projectContainer: {
    marginBottom: 24,
    gap: 16,
  },
  projectHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  projectIconText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  projectHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  taskLink: {
    width: '100%',
    borderBottomColor: '#333',
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  taskCard: {
    borderRadius: 12,
    marginBottom: 8,
    width: '100%',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
  },
  taskDescription: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 12,
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dueDate: {
    fontSize: 12,
    color: '#808080',
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: 32,
  },
  noTasks: {
    color: '#808080',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    color: '#606060',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});