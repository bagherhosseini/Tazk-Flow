import { Text, View, Button, Pressable, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './styles';
import { useEffect, useState } from 'react';
import ApiService, { Task, TasksResponse } from '../../../services/api';

export default function Index() {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [tasksData, setTasksData] = useState<TasksResponse>();
  const [loading, setLoading] = useState(true);

  const getRandomGradient = () => {
    const gradients = [
      ['#FF6B6B', '#4ECDC4'],
      ['#A8E6CF', '#DCEDC1'],
      ['#FFD93D', '#FF6B6B'],
      ['#6C5CE7', '#A8E6CF'],
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const token = await getToken();
        if (!token) return;
        const response = await ApiService.getAllVisibleTasks(token);
        setTasksData(response);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleTaskPress = (taskId: string) => {
    router.push(`/tasks/${taskId}`);
  }

  const renderTaskCard = (task: Task) => (
    <TouchableOpacity
      key={task.id}
      style={styles.taskLink}
      onPress={() => handleTaskPress(task.id)}
    >
      <View style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <View style={[styles.statusBadge,
          { backgroundColor: task.status === 'completed' ? '#4CAF50' : '#FF9800' }]}>
            <Text style={styles.statusText}>{task.status || 'pending'}</Text>
          </View>
        </View>
        <Text numberOfLines={2} style={styles.taskDescription}>
          {task.description}
        </Text>
        <View style={styles.taskFooter}>
          <Text style={styles.dueDate}>Due: {new Date(task.due_date).toLocaleDateString()}</Text>
          {task.priority && (
            <View style={[styles.priorityBadge,
            {
              backgroundColor:
                task.priority === 'high' ? '#FF5252' :
                  task.priority === 'medium' ? '#FFC107' : '#4CAF50'
            }]}>
              <Text style={styles.priorityText}>{task.priority}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.emptyStateContainer}>
        <MaterialCommunityIcons name="folder-outline" size={48} color="#808080" />
        <Text style={styles.noTasks}>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.firstName || 'User'}</Text>
      </View>

      {/* Personal Tasks Section */}
      <Pressable style={styles.sectionContainer}>
        <View style={styles.sectionHeaderContainer}>
          <MaterialCommunityIcons name="bag-personal" size={24} color="#FFFFFF" />
          <Text style={styles.sectionHeader}>Personal Tasks</Text>
        </View>

        {!tasksData?.personal_tasks?.length ? (
          <View style={styles.emptyStateContainer}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#808080" />
            <Text style={styles.noTasks}>No personal tasks available</Text>
          </View>
        ) : (
          tasksData.personal_tasks.map(renderTaskCard)
        )}
      </Pressable>

      {/* Project Tasks Section */}
      <Pressable style={styles.sectionContainer}>
        {!tasksData?.project_tasks?.length ? (
          <View style={styles.emptyStateContainer}>
            <MaterialCommunityIcons name="folder-outline" size={48} color="#808080" />
            <Text style={styles.noTasks}>No project tasks available</Text>
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