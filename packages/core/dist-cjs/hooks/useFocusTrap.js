"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFocusTrap = useFocusTrap;
const react_1 = require("react");
const environment_1 = require("../utils/environment");
function useFocusTrap() {
    const containerRef = (0, react_1.useRef)(null);
    const firstFocusableElement = (0, react_1.useRef)(null);
    const lastFocusableElement = (0, react_1.useRef)(null);
    const handleTabKey = (0, react_1.useCallback)((e) => {
        if (containerRef.current == null)
            return;
        const focusableElements = containerRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length === 0)
            return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        firstFocusableElement.current = firstElement;
        lastFocusableElement.current = lastElement;
        const activeDocument = (0, environment_1.getDocumentObject)();
        if (activeDocument == null) {
            return;
        }
        if (e.key === 'Tab' && !e.shiftKey && activeDocument.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
        if (e.key === 'Tab' && e.shiftKey && activeDocument.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        }
    }, []);
    const handleKeyDown = (0, react_1.useCallback)((event) => {
        if (event.key === 'Tab') {
            handleTabKey(event);
        }
    }, [handleTabKey]);
    (0, react_1.useEffect)(() => {
        const container = containerRef.current;
        if (container == null)
            return;
        container.addEventListener('keydown', handleKeyDown);
        // Focus first element when trap is activated
        const focusableElements = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length > 0) {
            const initialElement = focusableElements[0];
            if (initialElement != null) {
                initialElement.focus();
            }
        }
        return () => {
            container.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);
    return containerRef;
}
//# sourceMappingURL=useFocusTrap.js.map