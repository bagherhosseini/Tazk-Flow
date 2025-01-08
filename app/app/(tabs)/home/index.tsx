import { Text, View, Button, Pressable, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useClerk, useUser } from '@clerk/clerk-expo';
import { userVisibleTasks, userProjects } from '@/data/data';
import { Link, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './styles';

export default function Index() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk()

  const getRandomGradient = () => {
    const gradients = [
      ['#FF6B6B', '#4ECDC4'],
      ['#A8E6CF', '#DCEDC1'],
      ['#FFD93D', '#FF6B6B'],
      ['#6C5CE7', '#A8E6CF'],
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  const handleTaskPress = (taskId: string) => {
    router.push(`/tasks/${taskId}`);
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.firstName || 'User'}</Text>
      </View>

      <Pressable
        style={styles.sectionContainer}
      // onPress={() => router.replace('/(tabs)/tasks/personalTasks')}
      >
        <View style={styles.sectionHeaderContainer}>
          <MaterialCommunityIcons name="bag-personal" size={24} color="#FFFFFF" />
          <Text style={styles.sectionHeader}>Personal Tasks</Text>
        </View>

        {userVisibleTasks.filter((task) => !task.project).length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#808080" />
            <Text style={styles.noTasks}>No personal tasks available</Text>
          </View>
        ) : (
          userVisibleTasks
            .filter((task) => !task.project)
            .map((task) => (
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
                      <Text style={styles.statusText}>{task.status}</Text>
                    </View>
                  </View>
                  <Text numberOfLines={2} style={styles.taskDescription}>
                    {task.description}
                  </Text>
                  <View style={styles.taskFooter}>
                    <Text style={styles.dueDate}>Due: {new Date(task.dueDate).toLocaleDateString()}</Text>
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
            ))
        )}
      </Pressable>

      <Pressable
        style={styles.sectionContainer}
      // onPress={() => router.replace('/(tabs)/tasks/projectsTasks')}
      >
        {userProjects.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <MaterialCommunityIcons name="folder-outline" size={48} color="#808080" />
            <Text style={styles.noTasks}>No project tasks available</Text>
          </View>
        ) : (
          userProjects.map((project) => (
            <View key={project.id} style={styles.projectContainer}>
              <View style={styles.projectHeaderContainer}>
                <View style={[styles.projectIcon, { backgroundColor: getRandomGradient()[0] }]}>
                  <Text style={styles.projectIconText}>
                    {project.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.projectHeader}>{project.name}</Text>
              </View>

              {userVisibleTasks
                .filter((task) => task.project?.id === project.id)
                .map((task) => (
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
                          <Text style={styles.statusText}>{task.status}</Text>
                        </View>
                      </View>
                      <Text numberOfLines={2} style={styles.taskDescription}>
                        {task.description}
                      </Text>
                      <View style={styles.taskFooter}>
                        <Text style={styles.dueDate}>Due: {new Date(task.dueDate).toLocaleDateString()}</Text>
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
                ))}
            </View>
          ))
        )}
      </Pressable>
    </ScrollView>
  );
}