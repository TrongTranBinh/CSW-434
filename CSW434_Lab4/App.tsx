import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
} from '@react-native-firebase/auth';
import {
  getInitialNotification,
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
} from '@react-native-firebase/messaging';

import NotesScreen from './src/screens/NotesScreen';
import EditNoteScreen from './src/screens/EditNoteScreen';
import type { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();
const auth = getAuth();

export default function App() {
  const [uid, setUid] = useState<string | null>(null);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string>('');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      if (user) {
        setUid(user.uid);
        setInitializing(false);
      } else {
        setUid(null);
        signInAnonymously(auth).catch(err => {
          setAuthError(String((err as Error)?.message ?? err));
          setInitializing(false);
        });
      }
    });

    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    const messagingInstance = getMessaging();

    const unsubscribeForeground = onMessage(messagingInstance, async remoteMessage => {
      const title = remoteMessage.notification?.title ?? 'New Note Added';
      const body = remoteMessage.notification?.body ?? 'A new note was added.';
      Alert.alert(title, body);
    });

    const unsubscribeBackgroundTap = onNotificationOpenedApp(messagingInstance, () => {
      if (navigationRef.isReady() && uid) {
        navigationRef.navigate('Notes', { uid });
      }
    });

    getInitialNotification(messagingInstance).then(remoteMessage => {
      if (remoteMessage && navigationRef.isReady() && uid) {
        navigationRef.navigate('Notes', { uid });
      }
    });

    return () => {
      unsubscribeForeground();
      unsubscribeBackgroundTap();
    };
  }, [uid]);

  if (initializing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!uid) {
    return (
      <View style={styles.center}>
        <Text>Authentication failed. Enable Anonymous sign-in in Firebase.</Text>
        <Text style={styles.errorText}>{authError}</Text>
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Notes"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen
          name="Notes"
          component={NotesScreen}
          initialParams={{ uid }}
        />
        <Stack.Screen name="EditNote" component={EditNoteScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#b91c1c',
    marginTop: 8,
    textAlign: 'center',
  },
});