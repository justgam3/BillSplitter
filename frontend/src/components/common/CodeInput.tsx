import React, { useRef, useState } from 'react';
import { View, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { TextInput } from 'react-native-paper';

interface CodeInputProps {
  length?: number;
  onComplete: (code: string) => void;
  onChangeCode?: (code: string) => void;
}

const CodeInput: React.FC<CodeInputProps> = ({ length = 6, onComplete, onChangeCode }) => {
  const [code, setCode] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(RNTextInput | null)[]>([]);

  const handleChangeText = (text: string, index: number) => {
    // Only allow digits
    const digit = text.replace(/[^0-9]/g, '');

    if (digit.length > 1) {
      // Pasted multiple digits
      const digits = digit.slice(0, length).split('');
      const newCode = [...code];
      digits.forEach((d, i) => {
        if (index + i < length) {
          newCode[index + i] = d;
        }
      });
      setCode(newCode);

      const fullCode = newCode.join('');
      onChangeCode?.(fullCode);

      // Focus next empty box or last box
      const nextIndex = Math.min(index + digits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();

      if (fullCode.length === length) {
        onComplete(fullCode);
      }
    } else {
      // Single digit
      const newCode = [...code];
      newCode[index] = digit;
      setCode(newCode);

      const fullCode = newCode.join('');
      onChangeCode?.(fullCode);

      // Auto-focus next box
      if (digit && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-submit when complete
      if (fullCode.length === length && fullCode.replace(/\s/g, '').length === length) {
        onComplete(fullCode);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array(length)
        .fill(0)
        .map((_, index) => (
          <TextInput
            key={index}
            ref={(ref: any) => (inputRefs.current[index] = ref)}
            value={code[index]}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            style={styles.input}
            mode="outlined"
            textAlign="center"
          />
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  input: {
    width: 48,
    height: 56,
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default CodeInput;
