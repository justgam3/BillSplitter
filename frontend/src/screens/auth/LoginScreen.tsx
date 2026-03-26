import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Snackbar } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { authService } from '../../services/api/authService';
import PasswordInput from '../../components/common/PasswordInput';
import LoadingButton from '../../components/common/LoadingButton';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailNotVerified, setEmailNotVerified] = useState(false);

  const handleLogin = async () => {
    setError('');
    setEmailNotVerified(false);

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      await authService.login({ email, password });
      // Navigation will happen in App.tsx after token is saved
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else if (err.response?.status === 403) {
        setError('Email not verified. Please verify your email first.');
        setEmailNotVerified(true);
      } else {
        const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = () => {
    navigation.navigate('EmailVerification', { email });
  };

  const isFormValid = email && password;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text variant="headlineMedium" style={styles.title}>
            Welcome Back
          </Text>

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={styles.input}
          />

          <PasswordInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            style={styles.input}
          />

          <LoadingButton
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={!isFormValid}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Log In
          </LoadingButton>

          {emailNotVerified && (
            <LoadingButton
              mode="text"
              onPress={handleResendVerification}
              style={styles.resendButton}
            >
              Resend Verification Code
            </LoadingButton>
          )}

          <View style={styles.footer}>
            <Text variant="bodyMedium">Don't have an account? </Text>
            <Text
              variant="bodyMedium"
              style={styles.link}
              onPress={() => navigation.navigate('SignUp')}
            >
              Sign up
            </Text>
          </View>
        </View>
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={4000}
        action={{
          label: 'Dismiss',
          onPress: () => setError(''),
        }}
      >
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 32,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  resendButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  link: {
    color: '#212121',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
