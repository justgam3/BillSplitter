import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ProgressBar } from 'react-native-paper';
import { PasswordStrength, getPasswordStrengthColor, getPasswordStrengthProgress } from '../../utils/passwordValidator';

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
  message?: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ strength, message }) => {
  const color = getPasswordStrengthColor(strength);
  const progress = getPasswordStrengthProgress(strength);

  return (
    <View style={styles.container}>
      <ProgressBar progress={progress} color={color} style={styles.progressBar} />
      <Text style={[styles.strengthText, { color }]}>
        {strength.charAt(0).toUpperCase() + strength.slice(1)} strength
      </Text>
      {message && (
        <Text variant="bodySmall" style={styles.message}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  strengthText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  message: {
    marginTop: 4,
    color: '#757575',
  },
});

export default PasswordStrengthIndicator;
