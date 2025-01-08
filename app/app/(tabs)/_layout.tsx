import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Platform, StatusBar as RNStatusBar, TouchableOpacity, Button } from 'react-native';
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

const DrawerItem = ({ label, icon, route, onPress, isActive, currentPath }: DrawerItemProps) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.drawerItem,
      isActive && styles.drawerItemActive
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

const CustomHeader = ({ onMenuPress, onAddPress, onBackPress, isBackButtonShown }: { onMenuPress: () => void, onAddPress: () => void, onBackPress: () => void, isBackButtonShown: boolean }) => (
  <View style={styles.headerContainer}>
    {isBackButtonShown ? (
      // <Button title="Back" onPress={onBackPress} />
      <Pressable
        onPress={onBackPress}
        style={styles.menuButton}
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
        style={styles.menuButton}
      >
        <MaterialCommunityIcons
          name="menu"
          size={30}
          color="#FFFFFF"
        />
      </Pressable>
    )}
    <Pressable
      onPress={onAddPress}
      style={styles.menuButtonAdd}
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
  const router = useRouter();
  const currentPath = usePathname();
  const translateX = useState(new Animated.Value(-DRAWER_WIDTH))[0];
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) {
      router.replace('../');
    }
  }, [isSignedIn]);

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

  const navigateTo = (route: string) => {
    if (currentPath !== route) {
      setActiveRoute(route);
      router.push(route as any);
      toggleDrawer();
    }
  };

  const drawerItems = [
    { label: 'Home', icon: 'home-circle', route: '/home' },
    { label: 'Personal', icon: 'bag-personal', route: '/tasks/personalTasks' },
    { label: 'Project', icon: 'card-bulleted', route: '/tasks/projectsTasks' },
    { label: 'Projects', icon: 'card-bulleted', route: '/projects/projects' },
    { label: 'Profile', icon: 'card-bulleted', route: '/profile' },
  ];

  useEffect(() => {
    if (currentPath === '/tasks/create' || currentPath === '/projects/create') {
      setIsBackButtonShown(true);
    } else {
      setIsBackButtonShown(false);
    }
  }, [currentPath]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Stack
        screenOptions={{
          header: () => <CustomHeader onMenuPress={toggleDrawer} onAddPress={addTask} onBackPress={goBack} isBackButtonShown={isBackButtonShown} />,
          // headerShown: isHeaderShown,
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
          { transform: [{ translateX }] }
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
  headerContainer: {
    paddingTop: STATUSBAR_HEIGHT + 16, // Add padding for status bar plus some space
    paddingHorizontal: 16,
    backgroundColor: '#121212',
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  menuButton: {
    padding: 8,
    marginLeft: -8,
  },
  menuButtonAdd: {
    padding: 8,
    marginLeft: -32,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 100,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#121212',
    zIndex: 150,
  },
  drawerContent: {
    flex: 1,
  },
  drawerHeader: {
    padding: 20,
    paddingTop: STATUSBAR_HEIGHT + 16, // Match header padding
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E1E',
  },
  drawerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingLeft: 20,
  },
  drawerItemActive: {
    backgroundColor: '#1E1E1E',
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
});