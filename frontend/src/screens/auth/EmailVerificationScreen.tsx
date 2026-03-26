import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Snackbar, Chip } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/types';
import { authService } from '../../services/api/authService';
import CodeInput from '../../components/common/CodeInput';
import LoadingButton from '../../components/common/LoadingButton';

type EmailVerificationScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'EmailVerification'
>;
type EmailVerificationScreenRouteProp = RouteProp<AuthStackParamList, 'EmailVerification'>;

interface EmailVerificationScreenProps {
  navigation: EmailVerificationScreenNavigationProp;
  route: EmailVerificationScreenRouteProp;
}

const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({ navigation, route }) => {
  const { email } = route.params;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async (verificationCode: string) => {
    setLoading(true);
    setError('');

    try {
      await authService.verifyEmail({ email, verificationCode });
      setSuccess('Email verified successfully!');
      // Navigation will happen in App.tsx after token is saved
      setTimeout(() => {
        // The app will automatically navigate to Main screen due to auth state change
      }, 1000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Verification failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    setError('');

    try {
      await authService.resendVerification({ email });
      setSuccess('Verification code resent successfully');
      setResendCooldown(30); // 30 second cooldown
      setTimeLeft(15 * 60); // Reset timer to 15 minutes
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError('Please wait before requesting another code');
      } else {
        const errorMessage = err.response?.data?.message || 'Failed to resend code. Please try again.';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Verify Your Email
        </Text>

        <Text variant="bodyLarge" style={styles.subtitle}>
          We sent a code to {email}
        </Text>

        <CodeInput
          length={6}
          onComplete={handleVerify}
          onChangeCode={setCode}
        />

        {timeLeft > 0 ? (
          <Chip icon="clock-outline" style={styles.chip}>
            Code expires in {formatTime(timeLeft)}
          </Chip>
        ) : (
          <Text variant="bodyMedium" style={styles.expiredText}>
            Code expired. Please request a new one.
          </Text>
        )}

        <LoadingButton
          mode="outlined"
          onPress={handleResend}
          loading={loading}
          disabled={resendCooldown > 0}
          style={styles.resendButton}
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
        </LoadingButton>

        <Text
          variant="bodyMedium"
          style={styles.changeEmail}
          onPress={() => navigation.goBack()}
        >
          Change email
        </Text>
      </View>

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

      <Snackbar
        visible={!!success}
        onDismiss={() => setSuccess('')}
        duration={2000}
      >
        {success}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#757575',
    textAlign: 'center',
    marginBottom: 32,
  },
  chip: {
    alignSelf: 'center',
    marginTop: 16,
  },
  expiredText: {
    color: '#D32F2F',
    textAlign: 'center',
    marginTop: 16,
  },
  resendButton: {
    marginTop: 24,
    borderRadius: 8,
  },
  changeEmail: {
    color: '#212121',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
  },
});

export default EmailVerificationScreen;
