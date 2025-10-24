export default function PremiumModal({ isOpen, onClose, title, children, size, variant, showCloseButton, closeOnOverlayClick, closeOnEscape, className, }: {
    isOpen: any;
    onClose: any;
    title: any;
    children: any;
    size?: string | undefined;
    variant?: string | undefined;
    showCloseButton?: boolean | undefined;
    closeOnOverlayClick?: boolean | undefined;
    closeOnEscape?: boolean | undefined;
    className?: string | undefined;
}): JSX.Element;
export declare function usePremiumModal(): {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    toggleModal: () => void;
};
//# sourceMappingURL=PremiumModal.d.ts.map