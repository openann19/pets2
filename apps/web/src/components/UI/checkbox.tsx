export const Checkbox = ({ checked, onChange, onCheckedChange, className = '', ...props }) => {
    const handleChange = (e) => {
        const next = e.target.checked;
        if (typeof onChange === 'function') {
            if (onChange.length === 1) {
                // Call with boolean value for single-parameter handlers
                onChange(next);
            }
            else {
                // Call with full event for React.ChangeEventHandler
                onChange(e);
            }
        }
        onCheckedChange?.(next);
    };
    return (<input type="checkbox" checked={checked} onChange={handleChange} className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${className}`} {...props}/>);
};
//# sourceMappingURL=checkbox.jsx.map
//# sourceMappingURL=checkbox.jsx.map