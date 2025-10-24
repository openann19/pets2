/**
 * Creates a React 19 compatible component from a ForwardRef component
 * In React 19, ForwardRef components can be used directly as JSX elements
 * This function simply returns the component with proper typing
 */
export function createComponent(Component) {
    // React 19 handles ForwardRef components natively
    // No wrapping needed - just return as-is
    return Component;
}
//# sourceMappingURL=react-types.js.map