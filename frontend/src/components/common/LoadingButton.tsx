import React from 'react';
import { Button, ActivityIndicator } from 'react-native-paper';
import { ButtonProps } from 'react-native-paper';

interface LoadingButtonProps extends Omit<ButtonProps, 'loading'> {
  loading?: boolean;
  children: React.ReactNode;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({ loading = false, children, disabled, ...props }) => {
  return (
    <Button
      {...props}
      disabled={disabled || loading}
      loading={loading}
    >
      {children}
    </Button>
  );
};

export default LoadingButton;
