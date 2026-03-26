import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

interface WelcomeScreenProps {
  navigation: WelcomeScreenNavigationProp;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="displayMedium" style={styles.title}>
          BillSplitter
        </Text>
        <Text variant="titleMedium" style={styles.tagline}>
          Split bills, share fairly
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('SignUp')}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Sign Up
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Login')}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Log In
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'space-between',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  tagline: {
    color: '#757575',
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 32,
  },
  button: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default WelcomeScreen;
