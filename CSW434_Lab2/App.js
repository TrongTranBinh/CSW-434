import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import BatteryScreen from './screens/BatteryScreen';
import BrightnessScreen from './screens/BrightnessScreen';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Battery"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarIconStyle: { display: 'none' },
          tabBarLabelStyle: {
            fontSize: 15,
            fontWeight: '500',
            marginBottom: 12,
          },
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0,
            elevation: 0,
            height: 65,
          },
        }}
      >
        <Tab.Screen
          name="Brightness"
          component={BrightnessScreen}
          options={{ tabBarLabel: 'Brightness' }}
        />
        <Tab.Screen
          name="Battery"
          component={BatteryScreen}
          options={{ tabBarLabel: 'Battery' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
