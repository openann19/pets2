"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useKeyboardShortcut = useKeyboardShortcut;
const react_1 = require("react");
const environment_1 = require("../utils/environment");
function useKeyboardShortcut(keyCombo, handler) {
    const handlerRef = (0, react_1.useRef)(handler);
    (0, react_1.useEffect)(() => {
        handlerRef.current = handler;
    }, [handler]);
    (0, react_1.useEffect)(() => {
        const handleKeyDown = (event) => {
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
        const documentObject = (0, environment_1.getDocumentObject)();
        if (documentObject == null) {
            return undefined;
        }
        (0, environment_1.addEventListenerSafely)(documentObject, 'keydown', handleKeyDown);
        return () => {
            (0, environment_1.removeEventListenerSafely)(documentObject, 'keydown', handleKeyDown);
        };
    }, [keyCombo, handler]);
    return formatKeyCombo(keyCombo);
}
function formatKeyCombo(combo) {
    const modifiers = [];
    if (combo.ctrl === true)
        modifiers.push('Ctrl');
    if (combo.shift === true)
        modifiers.push('Shift');
    if (combo.alt === true)
        modifiers.push('Alt');
    if (combo.meta === true)
        modifiers.push('Meta');
    return [...modifiers, combo.key].join('+');
}
function formatPressedKeys(event) {
    const modifiers = [];
    if (event.ctrlKey)
        modifiers.push('Ctrl');
    if (event.shiftKey)
        modifiers.push('Shift');
    if (event.altKey)
        modifiers.push('Alt');
    if (event.metaKey)
        modifiers.push('Meta');
    return [...modifiers, event.key].join('+');
}
const isKeyboardEvent = (event) => {
    return 'key' in event;
};
//# sourceMappingURL=useKeyboardShortcut.js.map