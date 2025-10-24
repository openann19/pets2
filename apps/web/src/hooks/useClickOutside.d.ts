/**
 * useClickOutside Hook
 *
 * Universal hook for implementing click-outside-to-close pattern
 */
import { RefObject } from 'react';
export declare function useClickOutside<T extends HTMLElement = HTMLElement>(ref: RefObject<T>, handler: (event: MouseEvent | TouchEvent) => void, enabled?: boolean): void;
//# sourceMappingURL=useClickOutside.d.ts.map