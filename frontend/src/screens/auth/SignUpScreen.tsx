import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Snackbar } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { authService } from '../../services/api/authService';
import { validatePassword } from '../../utils/passwordValidator';
import PasswordInput from '../../components/common/PasswordInput';
import PasswordStrengthIndicator from '../../components/common/PasswordStrengthIndicator';
import LoadingButton from '../../components/common/LoadingButton';

type SignUpScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

interface SignUpScreenProps {
  navigation: SignUpScreenNavigationProp;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');

  const passwordValidation = validatePassword(password);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    setEmailError('');
    setError('');

    // Validate email
    if (!email) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    // Validate password
    if (!password) {
      setError('Password is required');
      return;
    }

    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      return;
    }

    setLoading(true);

    try {
      await authService.register({ email, password });
      // Navigate to email verification screen
      navigation.navigate('EmailVerification', { email });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email && password && passwordValidation.isValid && validateEmail(email);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text variant="headlineMedium" style={styles.title}>
            Create Account
          </Text>

          <TextInput
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError('');
            }}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={!!emailError}
            style={styles.input}
          />
          {emailError ? (
            <Text variant="bodySmall" style={styles.errorText}>
              {emailError}
            </Text>
          ) : null}

          <PasswordInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            style={styles.input}
          />

          {password ? (
            <PasswordStrengthIndicator
              strength={passwordValidation.strength}
              message={passwordValidation.message}
            />
          ) : (
            <Text variant="bodySmall" style={styles.helperText}>
              Must include uppercase, lowercase, number, and special character
            </Text>
          )}

          <LoadingButton
            mode="contained"
            onPress={handleSignUp}
            loading={loading}
            disabled={!isFormValid}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Create Account
          </LoadingButton>

          <View style={styles.footer}>
            <Text variant="bodyMedium">Already have an account? </Text>
            <Text
              variant="bodyMedium"
              style={styles.link}
              onPress={() => navigation.navigate('Login')}
            >
              Log in
            </Text>
          </View>
        </View>
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={3000}
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
    marginBottom: 8,
  },
  helperText: {
    color: '#757575',
    marginTop: 4,
    marginBottom: 16,
  },
  errorText: {
    color: '#D32F2F',
    marginTop: 4,
    marginBottom: 8,
  },
  button: {
    marginTop: 24,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
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

export default SignUpScreen;
