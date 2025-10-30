type AlertButton = {
  text?: string;
  onPress?: () => void;
};

type AlertOptions = {
  cancelable?: boolean;
  onDismiss?: () => void;
};

const Alert = {
  alert(title: string, message?: string, buttons: AlertButton[] = [], options?: AlertOptions) {
    const defaultButton = buttons[0];
    const combined = [title, message].filter(Boolean).join('\n\n');
    // eslint-disable-next-line no-alert
    const confirmed = window.confirm(combined || title);
    if (confirmed) {
      defaultButton?.onPress?.();
    } else {
      options?.onDismiss?.();
    }
  },
};

export default Alert;

