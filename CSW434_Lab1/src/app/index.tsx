
import { useState } from 'react';

import {
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { router } from 'expo-router';

export default function HomeScreen() {
  const [username, setUsername] = useState('');

  const handleStartChat = async () => {
    const name = username.trim();

    if (!name) {
      Alert.alert(
        'Notification',
        'Please enter your name',
      );

      return;
    }

    try {
      await AsyncStorage.setItem(
        'username',
        name,
      );

      router.push({
        pathname: '/group',
        params: {
          username: name,
        },
      });
    } catch (error) {
      Alert.alert(
        'Error',
        'Cannot save your name',
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <View style={styles.content}>
        <Text style={styles.title}>
          Your Name
        </Text>

        <Text style={styles.description}>
          Please enter your name to start a new chat
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Your name
          </Text>

          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your name"
            placeholderTextColor="#999999"
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartChat}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>
            Start Chat
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 100,
  },

  title: {
    fontSize: 20,
    fontWeight: '500',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 20,
  },

  description: {
    fontSize: 14,
    color: '#858585',
    textAlign: 'center',
    marginBottom: 70,
  },

  inputContainer: {
    marginBottom: 25,
  },

  inputLabel: {
    fontSize: 14,
    color: '#287C70',
    marginBottom: 5,
  },

  input: {
    height: 35,
    fontSize: 16,
    color: '#111111',
    borderBottomWidth: 1,
    borderBottomColor: '#D9D9D9',
    paddingVertical: 4,
  },

  startButton: {
    height: 48,
    backgroundColor: '#287C70',
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },

  startButtonText: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '500',
    letterSpacing: 3,
  },
});
