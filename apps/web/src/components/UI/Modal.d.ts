export declare function Modal({ isOpen, onClose, title, description, children, size, showCloseButton, closeOnOverlayClick, closeOnEscape, className, overlayClassName, }: {
    isOpen: any;
    onClose: any;
    title: any;
    description: any;
    children: any;
    size?: string | undefined;
    showCloseButton?: boolean | undefined;
    closeOnOverlayClick?: boolean | undefined;
    closeOnEscape?: boolean | undefined;
    className?: string | undefined;
    overlayClassName?: string | undefined;
}): JSX.Element;
export declare function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, variant, isLoading, }: {
    isOpen: any;
    onClose: any;
    onConfirm: any;
    title: any;
    message: any;
    confirmText?: string | undefined;
    cancelText?: string | undefined;
    variant?: string | undefined;
    isLoading?: boolean | undefined;
}): JSX.Element;
export declare function AlertModal({ isOpen, onClose, title, message, variant, buttonText, }: {
    isOpen: any;
    onClose: any;
    title: any;
    message: any;
    variant?: string | undefined;
    buttonText?: string | undefined;
}): JSX.Element;
//# sourceMappingURL=Modal.d.ts.map