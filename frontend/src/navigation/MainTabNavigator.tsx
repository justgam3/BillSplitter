import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { MainTabParamList } from './types';
import BuddiesScreen from '../screens/main/BuddiesScreen';
import ComingSoonScreen from '../screens/main/ComingSoonScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

interface MainTabNavigatorProps {
  onLogout: () => void;
}

export default function MainTabNavigator({ onLogout }: MainTabNavigatorProps) {
  return (
    <Tab.Navigator
      initialRouteName="Buddies"
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#FFFFFF' },
        tabBarActiveTintColor: '#212121',
        tabBarInactiveTintColor: '#BDBDBD',
      }}
    >
      <Tab.Screen
        name="Buddies"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-multiple" size={size} color={color} />
          ),
        }}
      >
        {() => <BuddiesScreen onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen
        name="Groups"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" size={size} color={color} />
          ),
        }}
      >
        {() => <ComingSoonScreen title="Groups" />}
      </Tab.Screen>
      <Tab.Screen
        name="Activities"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="format-list-bulleted" size={size} color={color} />
          ),
        }}
      >
        {() => <ComingSoonScreen title="Activities" />}
      </Tab.Screen>
      <Tab.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle" size={size} color={color} />
          ),
        }}
      >
        {() => <ComingSoonScreen title="Profile" />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
