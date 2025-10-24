import { act, fireEvent, render, screen } from '@testing-library/react';
import { ToastProvider, useToast } from '../../ui/toast';

function Demo() {
    const { success, error, warning, info, showToast } = useToast();
    return (
        <div>
            <button onClick={() => success('Saved', 'All good')}>success</button>
            <button onClick={() => error('Failed', 'Oops!')}>error</button>
            <button onClick={() => warning('Heads up')}>warning</button>
            <button onClick={() => info('FYI')}>info</button>
            <button onClick={() => showToast({ type: 'success', title: 'Custom', duration: 50 })}>
                custom
            </button>
        </div>
    );
}

function App() {
    return (
        <ToastProvider>
            <Demo />
        </ToastProvider>
    );
}

// Use legacy fake timers to avoid jsdom performance hijack issues
jest.useFakeTimers({ legacyFakeTimers: true });

describe('ToastProvider', () => {
    it('renders and shows success toast', () => {
        render(<App />);
        fireEvent.click(screen.getByText('success'));
        expect(screen.queryByText('Saved') !== null).toBe(true);
        expect(screen.queryByText('All good') !== null).toBe(true);
    });

    it('shows error toast with longer duration then auto dismisses', () => {
        render(<App />);
        fireEvent.click(screen.getByText('error'));
        expect(screen.queryByText('Failed') !== null).toBe(true);
        act(() => {
            jest.advanceTimersByTime(7000);
        });
        expect(screen.queryByText('Failed') === null).toBe(true);
    });

    it('manual dismiss works', () => {
        render(<App />);
        fireEvent.click(screen.getByText('warning'));
        const close = screen.getByLabelText('Close toast');
        fireEvent.click(close);
        expect(screen.queryByText('Heads up') === null).toBe(true);
    });

    it('auto-dismiss based on duration works', () => {
        render(<App />);
        fireEvent.click(screen.getByText('custom'));
        expect(screen.queryByText('Custom') !== null).toBe(true);
        act(() => {
            jest.advanceTimersByTime(60);
        });
        expect(screen.queryByText('Custom') === null).toBe(true);
    });
});
