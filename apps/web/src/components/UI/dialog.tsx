import { cn } from '@/lib/utils';
import React from 'react';
/**
 * Dialog - Main dialog container component
 * Provides fixed positioning and centering for modal dialogs
 */
const Dialog = React.forwardRef(({ className, ...props }, ref) => (<div ref={ref} className={cn('fixed inset-0 z-50 flex items-center justify-center', className)} {...props}/>));
Dialog.displayName = 'Dialog';
const DialogContent = React.forwardRef(({ className, ...props }, ref) => (<div ref={ref} className={cn('fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg', className)} {...props}/>));
DialogContent.displayName = 'DialogContent';
const DialogHeader = React.forwardRef(({ className, ...props }, ref) => (<div ref={ref} className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props}/>));
DialogHeader.displayName = 'DialogHeader';
const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (<h2 ref={ref} className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props}/>));
DialogTitle.displayName = 'DialogTitle';
const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (<p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props}/>));
DialogDescription.displayName = 'DialogDescription';
const DialogFooter = React.forwardRef(({ className, ...props }, ref) => (<div ref={ref} className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props}/>));
DialogFooter.displayName = 'DialogFooter';
// React 19-compatible function component wrappers
export function DialogComponent(props) {
    return <Dialog {...props}/>;
}
export function DialogContentComponent(props) {
    return <DialogContent {...props}/>;
}
export function DialogHeaderComponent(props) {
    return <DialogHeader {...props}/>;
}
export function DialogFooterComponent(props) {
    return <DialogFooter {...props}/>;
}
export function DialogTitleComponent(props) {
    return <DialogTitle {...props}/>;
}
export function DialogDescriptionComponent(props) {
    return <DialogDescription {...props}/>;
}
//# sourceMappingURL=dialog.jsx.map
//# sourceMappingURL=dialog.jsx.map