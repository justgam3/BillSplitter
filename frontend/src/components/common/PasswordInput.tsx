import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import { TextInputProps } from 'react-native-paper';

interface PasswordInputProps extends Omit<TextInputProps, 'secureTextEntry' | 'right'> {
  value: string;
  onChangeText: (text: string) => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ value, onChangeText, ...props }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <TextInput
      {...props}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={!isPasswordVisible}
      right={
        <TextInput.Icon
          icon={isPasswordVisible ? 'eye-off' : 'eye'}
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        />
      }
      autoCapitalize="none"
      autoComplete="password"
    />
  );
};

export default PasswordInput;
