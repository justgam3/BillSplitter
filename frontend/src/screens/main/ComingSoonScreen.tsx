import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ComingSoonScreenProps {
  title: string;
}

const ComingSoonScreen: React.FC<ComingSoonScreenProps> = ({ title }) => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="clock-outline" size={64} color="#BDBDBD" />
      <Text variant="headlineSmall" style={styles.heading}>
        Coming Soon
      </Text>
      <Text variant="bodyMedium" style={styles.sub}>
        {title} is on its way. Stay tuned!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    gap: 12,
  },
  heading: {
    color: '#212121',
    fontWeight: 'bold',
  },
  sub: {
    color: '#757575',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default ComingSoonScreen;
