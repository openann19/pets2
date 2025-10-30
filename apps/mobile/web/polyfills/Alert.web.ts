import { Platform } from 'react-native-web';

type AlertButton = {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'destructive' | 'cancel';
};

type AlertOptions = {
  cancelable?: boolean;
  onDismiss?: () => void;
};

const Alert = {
  alert(
    title: string,
    message?: string,
    buttons: AlertButton[] = [{ text: 'OK' }],
    options?: AlertOptions,
  ): void {
    const defaultButton = buttons[0];
    // eslint-disable-next-line no-alert
    if (window.confirm([title, message].filter(Boolean).join('\n\n'))) {
      defaultButton?.onPress?.();
    } else if (options?.onDismiss) {
      options.onDismiss();
    }
  },
};

export default Alert;
export { Alert };

