import { useEffect, useRef } from 'react';
import {
  addEventListenerSafely,
  getDocumentObject,
  removeEventListenerSafely,
} from '../utils/environment';

interface KeyCombo {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
}

export function useKeyboardShortcut(
  keyCombo: KeyCombo,
  handler: () => void
) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const handleKeyDown = (event: Event) => {
      if (!isKeyboardEvent(event)) {
        return;
      }

      const pressedCombo = formatPressedKeys(event);
      const formattedCombo = formatKeyCombo(keyCombo);
      if (pressedCombo === formattedCombo) {
        event.preventDefault();
        handlerRef.current();
      }
    };

    const documentObject = getDocumentObject();
    if (documentObject == null) {
      return undefined;
    }

    addEventListenerSafely(documentObject, 'keydown', handleKeyDown);
    return () => {
      removeEventListenerSafely(documentObject, 'keydown', handleKeyDown);
    };
  }, [keyCombo, handler]);

  return formatKeyCombo(keyCombo);
}

function formatKeyCombo(combo: KeyCombo): string {
  const modifiers = [];
  if (combo.ctrl === true) modifiers.push('Ctrl');
  if (combo.shift === true) modifiers.push('Shift');
  if (combo.alt === true) modifiers.push('Alt');
  if (combo.meta === true) modifiers.push('Meta');

  return [...modifiers, combo.key].join('+');
}

function formatPressedKeys(event: KeyboardEvent): string {
  const modifiers = [];
  if (event.ctrlKey) modifiers.push('Ctrl');
  if (event.shiftKey) modifiers.push('Shift');
  if (event.altKey) modifiers.push('Alt');
  if (event.metaKey) modifiers.push('Meta');

  return [...modifiers, event.key].join('+');
}

const isKeyboardEvent = (event: Event): event is KeyboardEvent => {
  return 'key' in event;
};
