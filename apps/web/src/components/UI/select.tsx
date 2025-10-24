import React from 'react';
import { cn } from '@/lib/utils';
/**
 * Select - Custom select component with Radix-like API
 * Supports both onChange and onValueChange for compatibility
 */
const Select = React.forwardRef(({ className, children, onValueChange, ...props }, ref) => {
    const handleChange = (e) => {
        if (onValueChange) {
            onValueChange(e.target.value);
        }
    };
    return (<select className={cn('flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', className)} ref={ref} onChange={handleChange} {...props}>
        {children}
      </select>);
});
Select.displayName = 'Select';
const SelectContent = React.forwardRef(({ className, ...props }, ref) => (<div ref={ref} className={cn('relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md', className)} {...props}/>));
SelectContent.displayName = 'SelectContent';
const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (<option className={cn('relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50', className)} ref={ref} {...props}>
    {children}
  </option>));
SelectItem.displayName = 'SelectItem';
const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (<div ref={ref} className={cn('flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', className)} {...props}>
      {children}
    </div>));
SelectTrigger.displayName = 'SelectTrigger';
const SelectValue = React.forwardRef(({ className, children, placeholder, ...props }, ref) => (<span ref={ref} className={cn('block truncate', className)} {...props}>
      {children || placeholder}
    </span>));
SelectValue.displayName = 'SelectValue';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
//# sourceMappingURL=select.jsx.map
//# sourceMappingURL=select.jsx.map