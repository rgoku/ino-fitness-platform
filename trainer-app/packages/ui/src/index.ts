/**
 * Shared UI Component Types
 * Base component interfaces used across platforms
 */

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
}

export interface CardProps {
  title: string;
  subtitle?: string;
  children?: unknown;
  variant?: 'elevated' | 'filled' | 'outlined';
  onPress?: () => void;
  testID?: string;
}

export interface TextInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  type?: 'text' | 'email' | 'password' | 'number';
  error?: string;
  disabled?: boolean;
  testID?: string;
}

export interface BadgeProps {
  label: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
}

export interface AlertProps {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  onDismiss: () => void;
  buttons?: Array<{
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

export interface ModalProps {
  visible: boolean;
  title: string;
  children?: unknown;
  onClose: () => void;
  buttons?: Array<{
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

export interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

// Export helper types
export type ComponentVariant = 'primary' | 'secondary' | 'danger';
export type ComponentSize = 'small' | 'medium' | 'large';
export type AlertType = 'info' | 'success' | 'warning' | 'error';
