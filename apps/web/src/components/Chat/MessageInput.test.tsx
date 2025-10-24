import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// Mocks for internal dependencies used by MessageInput
jest.mock('@/components/UI/textarea', () => {
  const React = require('react');
  interface TextareaProps {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    className?: string;
  }
  const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>((props, ref) => (
    <textarea data-testid="message-textarea" ref={ref} {...props} />
  ));
  Textarea.displayName = 'TextareaMock';
  return { Textarea };
});

jest.mock('@/services/fileUpload', () => ({
  fileUploadService: {
    uploadImage: jest.fn(),
    uploadVoiceMessage: jest.fn(),
  },
}));

jest.mock('@/services/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('./GifPicker', () => ({
  GifPicker: ({ isOpen, onClose, onSelectGif }: { isOpen: boolean; onClose: () => void; onSelectGif: (url: string) => void }) => (
    isOpen ? (
      <div data-testid="gif-picker" onClick={() => { onSelectGif('https://gif.example/x.gif'); onClose(); }} />
    ) : null
  ),
}));

jest.mock('./StickerPicker', () => ({
  StickerPicker: ({ isOpen, onClose, onSelectSticker }: { isOpen: boolean; onClose: () => void; onSelectSticker: (url: string) => void }) => (
    isOpen ? (
      <div data-testid="sticker-picker" onClick={() => { onSelectSticker('https://st.example/s.png'); onClose(); }} />
    ) : null
  ),
}));

jest.mock('./VoiceRecorder', () => ({
  VoiceRecorder: ({ onSend, onCancel }: { onSend: (blob: Blob, duration: number) => void; onCancel: () => void }) => (
    <div data-testid="voice-recorder">
      <button onClick={() => onSend(new Blob(['abc'], { type: 'audio/mp3' }), 123)}>Send Voice</button>
      <button onClick={() => onCancel()}>Cancel</button>
    </div>
  ),
}));

// Under test
import MessageInput from './MessageInput';
import { fileUploadService } from '@/services/fileUpload';

const mockGeolocation = {
  getCurrentPosition: jest.fn(),
};

// Use fake timers for typing indicator debounce
beforeAll(() => {
  (global.navigator as { geolocation: typeof mockGeolocation }).geolocation = mockGeolocation;
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

describe('MessageInput', () => {
  test('sends trimmed text message on Enter and resets input', () => {
    const onSendMessage = jest.fn();
    const onTyping = jest.fn();

    render(<MessageInput onSendMessage={onSendMessage} onTyping={onTyping} />);

    const textarea = screen.getByTestId('message-textarea');

    fireEvent.change(textarea, { target: { value: '  hello world  ' } });
    // should signal typing immediately
    expect(onTyping).toHaveBeenCalledWith(true);

    // Press Enter without Shift to submit
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: false });

    expect(onSendMessage).toHaveBeenCalledWith('hello world');

    // typing indicator auto-stops after debounce
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(onTyping).toHaveBeenCalledWith(false);
  });

  test('does not send when message is empty or only spaces', () => {
    const onSendMessage = jest.fn();
    render(<MessageInput onSendMessage={onSendMessage} />);

    const textarea = screen.getByTestId('message-textarea');
    fireEvent.change(textarea, { target: { value: '   ' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: false });

    expect(onSendMessage).not.toHaveBeenCalled();
  });

  test('uploads image and sends image message', async () => {
    const onSendMessage = jest.fn();
    (fileUploadService.uploadImage as jest.Mock).mockResolvedValueOnce({ url: 'https://cdn.example/pic.png' });

    render(<MessageInput onSendMessage={onSendMessage} />);

    // Click the Share Image button (has title)
    const shareBtn = screen.getByRole('button', { name: /Share Image/i });
    fireEvent.click(shareBtn);

    const fileInput = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement | null;
    // Fallback query if role-based lookup fails for hidden input
    const inputEl = (fileInput ?? (document.querySelector('input[type="file"]') as HTMLInputElement));

    const file = new File([new Uint8Array([1, 2, 3])], 'pic.png', { type: 'image/png' });
    // fireEvent.change requires the files property on target
    Object.defineProperty(inputEl, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(inputEl);

    await waitFor(() => {
      expect(onSendMessage).toHaveBeenCalledWith('https://cdn.example/pic.png', 'image');
    });
  });

  test('shares location when clicking Share Location', async () => {
    const onSendMessage = jest.fn();
    render(<MessageInput onSendMessage={onSendMessage} />);

    interface GeolocationPosition {
      coords: {
        latitude: number;
        longitude: number;
      };
    }
    (mockGeolocation.getCurrentPosition as jest.Mock).mockImplementation((success: (position: GeolocationPosition) => void) => {
      success({ coords: { latitude: 12.345678, longitude: 98.765432 } });
    });

    const locBtn = screen.getByRole('button', { name: /Share Location/i });
    fireEvent.click(locBtn);

    await waitFor(() => {
      expect(onSendMessage).toHaveBeenCalledWith(
        expect.stringContaining('Location: 12.345678, 98.765432'),
        'location'
      );
    });
  });

  test('respects disabled prop and does not send', () => {
    const onSendMessage = jest.fn();
    render(<MessageInput onSendMessage={onSendMessage} disabled />);

    const textarea = screen.getByTestId('message-textarea');
    fireEvent.change(textarea, { target: { value: 'hi' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: false });

    expect(onSendMessage).not.toHaveBeenCalled();
  });
});
