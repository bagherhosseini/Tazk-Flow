import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Platform, StatusBar as RNStatusBar, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, Stack, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@clerk/clerk-expo';

const DRAWER_WIDTH = 280;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : RNStatusBar.currentHeight || 0;

interface DrawerItemProps {
  label: string;
  icon: string;
  route: string;
  onPress: () => void;
  isActive: boolean;
  currentPath: string;
}

type AppRoutes =
  | '/home'
  | '/tasks/personalTasks'
  | '/tasks/projectsTasks'
  | '/projects/projects'
  | '/invite'
  | '/profile'
  | '/tasks/create'
  | '/projects/create';

interface CustomHeaderProps {
  onMenuPress: () => void;
  onAddPress: () => void;
  onBackPress: () => void;
  isBackButtonShown: boolean;
}


const LoadingSpinner = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#FFFFFF" />
  </View>
);

const DrawerItem = ({ label, icon, route, onPress, isActive, currentPath }: DrawerItemProps) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.drawerItem,
      isActive && styles.drawerItemActive,
      pressed && styles.drawerItemPressed
    ]}
    disabled={currentPath === route}
  >
    <MaterialCommunityIcons
      name={icon as any}
      size={24}
      color={isActive ? '#FFFFFF' : '#B0B0B0'}
    />
    <Text style={[
      styles.drawerLabel,
      isActive && styles.drawerLabelActive
    ]}>
      {label}
    </Text>
  </Pressable>
);

const CustomHeader = ({ onMenuPress, onAddPress, onBackPress, isBackButtonShown } : CustomHeaderProps) => (
  <View style={styles.headerContainer}>
    {isBackButtonShown ? (
      <Pressable
        onPress={onBackPress}
        style={({ pressed }) => [styles.menuButton, pressed && styles.buttonPressed]}
      >
        <MaterialCommunityIcons
          name="arrow-left"
          size={30}
          color="#FFFFFF"
        />
      </Pressable>
    ) : (
      <Pressable
        onPress={onMenuPress}
        style={({ pressed }) => [styles.menuButton, pressed && styles.buttonPressed]}
      >
        <MaterialCommunityIcons
          name="menu"
          size={30}
          color="#FFFFFF"
        />
      </Pressable>
    )}
    <Text style={styles.headerTitle}>Task Manager</Text>
    <Pressable
      onPress={onAddPress}
      style={({ pressed }) => [styles.menuButton, pressed && styles.buttonPressed]}
    >
      <MaterialCommunityIcons
        name="plus"
        size={30}
        color="#FFFFFF"
      />
    </Pressable>
  </View>
);

export default function RootLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState('/home');
  const [isBackButtonShown, setIsBackButtonShown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const currentPath = usePathname();
  const translateX = useState(new Animated.Value(-DRAWER_WIDTH))[0];
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('../');
    }
    setIsLoading(false);
  }, [isSignedIn, isLoaded]);

  useEffect(() => {
    setActiveRoute(currentPath);
  }, [currentPath]);

  const toggleDrawer = () => {
    const toValue = isDrawerOpen ? -DRAWER_WIDTH : 0;
    Animated.timing(translateX, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsDrawerOpen(!isDrawerOpen);
  };

  const addTask = () => {
    router.push('/tasks/create');
  };

  const goBack = () => {
    router.back();
  };

  // fix: Restored original navigation logic
  const navigateTo = (route: AppRoutes) => {
    if (currentPath !== route) {
      setActiveRoute(route);
      router.push(route as any);
      toggleDrawer();
    }
  };

  const drawerItems: { label: string; icon: string; route: AppRoutes }[] = [
    { label: 'Home', icon: 'home', route: '/home' },
    { label: 'Personal Tasks', icon: 'account', route: '/tasks/personalTasks' },
    { label: 'Project Tasks', icon: 'clipboard-list', route: '/tasks/projectsTasks' },
    { label: 'Projects', icon: 'view-grid', route: '/projects/projects' },
    { label: 'Invitations', icon: 'email-plus', route: '/invite' },
    { label: 'Profile', icon: 'account-circle', route: '/profile' },
  ];

  useEffect(() => {
    if (currentPath === '/tasks/create' || currentPath === '/projects/create') {
      setIsBackButtonShown(true);
    } else {
      setIsBackButtonShown(false);
    }
  }, [currentPath]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Stack
        screenOptions={{
          header: () => (
            <CustomHeader
              onMenuPress={toggleDrawer}
              onAddPress={addTask}
              onBackPress={goBack}
              isBackButtonShown={isBackButtonShown}
            />
          ),
        }}
      />

      {isDrawerOpen && (
        <Pressable
          style={styles.overlay}
          onPress={toggleDrawer}
        />
      )}

      <Animated.View
        style={[
          styles.drawer,
          { transform: [{ translateX }] },
          styles.drawerShadow
        ]}
      >
        <SafeAreaView style={styles.drawerContent} edges={['top', 'bottom']}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Menu</Text>
          </View>
          {drawerItems.map((item) => (
            <DrawerItem
              key={item.route}
              label={item.label}
              icon={item.icon}
              route={item.route}
              onPress={() => navigateTo(item.route)}
              isActive={activeRoute === item.route}
              currentPath={currentPath}
            />
          ))}
          <View style={styles.drawerFooter}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  headerContainer: {
    paddingTop: STATUSBAR_HEIGHT + 16,
    paddingHorizontal: 16,
    backgroundColor: '#121212',
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
  },
  buttonPressed: {
    opacity: 0.7,
    backgroundColor: '#2A2A2A',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 100,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#1A1A1A',
    zIndex: 150,
  },
  drawerShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  drawerContent: {
    flex: 1,
  },
  drawerHeader: {
    padding: 20,
    paddingTop: STATUSBAR_HEIGHT + 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  drawerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingLeft: 20,
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  drawerItemActive: {
    backgroundColor: '#2A2A2A',
  },
  drawerItemPressed: {
    opacity: 0.7,
  },
  drawerLabel: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#B0B0B0',
  },
  drawerLabelActive: {
    color: '#FFFFFF',
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    alignItems: 'center',
  },
  versionText: {
    color: '#666666',
    fontSize: 12,
  },
});