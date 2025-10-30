import { EditHistory } from '../EditHistory';

describe('EditHistory', () => {
  describe('push and getCurrent', () => {
    it('should store and retrieve current state', () => {
      const history = new EditHistory();

      history.push('uri1', ['brightness']);

      const current = history.getCurrent();
      expect(current?.uri).toBe('uri1');
      expect(current?.operations).toEqual(['brightness']);
    });

    it('should track timestamp', () => {
      const history = new EditHistory();
      const before = Date.now();

      history.push('uri1');

      const current = history.getCurrent();
      expect(current?.timestamp).toBeGreaterThanOrEqual(before);
      expect(current?.timestamp).toBeLessThanOrEqual(Date.now());
    });

    it('should maintain max history limit', () => {
      const history = new EditHistory(3); // Max 3 states

      history.push('uri1');
      history.push('uri2');
      history.push('uri3');
      history.push('uri4');

      expect(history.length).toBe(3);
      expect(history.getCurrentUri()).toBe('uri4');
    });
  });

  describe('undo', () => {
    it('should return previous state', () => {
      const history = new EditHistory();

      history.push('uri1');
      history.push('uri2');
      history.push('uri3');

      const prev = history.undo();

      expect(prev?.uri).toBe('uri2');
      expect(history.getCurrentUri()).toBe('uri2');
    });

    it('should not undo when at beginning', () => {
      const history = new EditHistory();

      history.push('uri1');

      expect(history.undo()).toBeNull();
      expect(history.getCurrentUri()).toBe('uri1');
    });

    it('should track undo count', () => {
      const history = new EditHistory();

      history.push('uri1');
      history.push('uri2');
      history.push('uri3');

      expect(history.undoCount).toBe(2);
      expect(history.canUndo()).toBe(true);

      history.undo();

      expect(history.undoCount).toBe(1);
      expect(history.canUndo()).toBe(true);

      history.undo();

      expect(history.undoCount).toBe(0);
      expect(history.canUndo()).toBe(false);
    });
  });

  describe('redo', () => {
    it('should return next state', () => {
      const history = new EditHistory();

      history.push('uri1');
      history.push('uri2');
      history.push('uri3');

      history.undo();
      history.undo();

      const next = history.redo();

      expect(next?.uri).toBe('uri2');
      expect(history.getCurrentUri()).toBe('uri2');
    });

    it('should not redo when at end', () => {
      const history = new EditHistory();

      history.push('uri1');
      history.push('uri2');

      expect(history.redo()).toBeNull();
      expect(history.getCurrentUri()).toBe('uri2');
    });

    it('should track redo count', () => {
      const history = new EditHistory();

      history.push('uri1');
      history.push('uri2');
      history.push('uri3');

      expect(history.redoCount).toBe(0);

      history.undo();

      expect(history.redoCount).toBe(1);
      expect(history.canRedo()).toBe(true);

      history.redo();

      expect(history.redoCount).toBe(0);
      expect(history.canRedo()).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all history', () => {
      const history = new EditHistory();

      history.push('uri1');
      history.push('uri2');
      history.push('uri3');

      history.clear();

      expect(history.length).toBe(0);
      expect(history.getCurrent()).toBeNull();
      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(false);
    });
  });

  describe('getCurrentUri', () => {
    it('should return current URI', () => {
      const history = new EditHistory();

      expect(history.getCurrentUri()).toBeNull();

      history.push('uri1');
      expect(history.getCurrentUri()).toBe('uri1');

      history.push('uri2');
      expect(history.getCurrentUri()).toBe('uri2');
    });

    it('should return null when history is empty', () => {
      const history = new EditHistory();

      expect(history.getCurrentUri()).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle multiple operations', () => {
      const history = new EditHistory();

      history.push('uri1', ['brightness', 'contrast']);
      history.push('uri2', ['crop', 'rotate']);

      const operations = history.getCurrent()?.operations;
      expect(operations).toEqual(['crop', 'rotate']);
    });

    it('should lose redo history on new push', () => {
      const history = new EditHistory();

      history.push('uri1');
      history.push('uri2');
      history.push('uri3');

      history.undo();
      expect(history.canRedo()).toBe(true);

      history.push('uri4', ['new-op']);

      expect(history.canRedo()).toBe(false);
      expect(history.getCurrentUri()).toBe('uri4');
    });

    it('should handle empty operations array', () => {
      const history = new EditHistory();

      history.push('uri1', []);

      expect(history.getCurrent()?.operations).toEqual([]);
    });
  });
});
