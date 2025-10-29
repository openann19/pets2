/**
 * Edit History & Undo System
 * Maintains a stack of image URIs for undo/redo operations
 */

export interface EditState {
  uri: string;
  timestamp: number;
  operations: string[]; // List of operations applied
}

export class EditHistory {
  private history: EditState[] = [];
  private currentIndex = -1;
  private maxHistory = 10; // Keep last 10 states

  constructor(maxHistory = 10) {
    this.maxHistory = maxHistory;
  }

  /**
   * Add a new state to history
   * Removes any states after current index (redo is lost)
   */
  push(uri: string, operations: string[] = []): void {
    // Remove states after current index
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Add new state
    this.history.push({
      uri,
      timestamp: Date.now(),
      operations,
    });

    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.currentIndex = this.history.length - 1;
    }
  }

  /**
   * Go to previous state
   */
  undo(): EditState | null {
    if (this.canUndo()) {
      this.currentIndex--;
      return this.history[this.currentIndex] ?? null;
    }
    return null;
  }

  /**
   * Go to next state
   */
  redo(): EditState | null {
    if (this.canRedo()) {
      this.currentIndex++;
      return this.history[this.currentIndex] ?? null;
    }
    return null;
  }

  /**
   * Check if undo is possible
   */
  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Check if redo is possible
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get current state
   */
  getCurrent(): EditState | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex] ?? null;
    }
    return null;
  }

  /**
   * Get current URI
   */
  getCurrentUri(): string | null {
    const current = this.getCurrent();
    return current?.uri ?? null;
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Get history size
   */
  get length(): number {
    return this.history.length;
  }

  /**
   * Get undo count
   */
  get undoCount(): number {
    return this.currentIndex;
  }

  /**
   * Get redo count
   */
  get redoCount(): number {
    return this.history.length - this.currentIndex - 1;
  }
}
