import { cn } from '@/lib/utils';
import React from 'react';
const LabelBase = React.forwardRef(({ className, ...props }, ref) => (<label ref={ref} className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)} {...props}/>));
LabelBase.displayName = 'Label';
export function Label(props) {
    return <LabelBase {...props}/>;
}
//# sourceMappingURL=label.jsx.map
//# sourceMappingURL=label.jsx.map