import { cn } from '@/lib/utils';
import React, { useEffect, useRef, useState } from 'react';
const CustomTextarea = React.forwardRef(({ className, label, variant = 'outline', size = 'medium', autoGrow = false, maxHeight, showWordCount = false, animateOnFocus = false, value = '', onChange, ...props }, ref) => {
    const textareaRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    useEffect(() => {
        // Count words
        if (showWordCount && value) {
            const words = value.trim().split(/\s+/).filter(Boolean).length;
            setWordCount(words);
        }
        // Handle auto-grow
        if (autoGrow && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            let newHeight = textareaRef.current.scrollHeight;
            if (maxHeight && newHeight > maxHeight) {
                newHeight = maxHeight;
                textareaRef.current.style.overflowY = 'auto';
            }
            else {
                textareaRef.current.style.overflowY = 'hidden';
            }
            textareaRef.current.style.height = `${newHeight}px`;
        }
    }, [value, showWordCount, autoGrow, maxHeight]);
    // Merge refs
    const handleRef = (textarea) => {
        textareaRef.current = textarea;
        if (typeof ref === 'function') {
            ref(textarea);
        }
        else if (ref) {
            ref.current = textarea;
        }
    };
    // Style based on variant and size
    const variantStyles = {
        outline: 'border border-gray-300 rounded-md',
        filled: 'bg-gray-100 border-none rounded-md',
        ghost: 'border-none bg-transparent'
    };
    const sizeStyles = {
        small: 'text-sm p-1',
        medium: 'text-base p-2',
        large: 'text-lg p-3'
    };
    return (<div className="w-full">
                {label && (<label className={cn("block text-sm font-medium text-gray-700 mb-1", animateOnFocus && isFocused && "text-blue-600 transition-colors")}>
                        {label}
                    </label>)}
                <textarea className={cn(variantStyles[variant], sizeStyles[size], "w-full focus:outline-none focus:ring-2 focus:ring-blue-500", animateOnFocus && isFocused && "border-blue-500", className)} ref={handleRef} value={value} onChange={(e) => {
            if (onChange) {
                onChange(e);
            }
        }} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} style={{
            maxHeight: maxHeight ? `${maxHeight}px` : undefined,
            ...props.style
        }} {...props}/>
                {showWordCount && (<div className="mt-1 text-xs text-gray-500 text-right">
                        {wordCount} {wordCount === 1 ? 'word' : 'words'}
                    </div>)}
            </div>);
});
CustomTextarea.displayName = 'CustomTextarea';
export { CustomTextarea };
//# sourceMappingURL=CustomTextarea.jsx.map
//# sourceMappingURL=CustomTextarea.jsx.map