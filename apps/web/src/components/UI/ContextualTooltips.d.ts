export declare const useTooltips: () => never;
export declare const TooltipProvider: ({ children }: {
    children: any;
}) => JSX.Element;
export declare const Tooltip: ({ content, children, position, trigger, delay, maxWidth, showArrow, className, disabled, id, }: {
    content: any;
    children: any;
    position?: string | undefined;
    trigger?: string | undefined;
    delay?: number | undefined;
    maxWidth?: number | undefined;
    showArrow?: boolean | undefined;
    className: any;
    disabled?: boolean | undefined;
    id: any;
}) => JSX.Element;
export declare const HelpTooltip: ({ children, helpText, className }: {
    children: any;
    helpText: any;
    className: any;
}) => JSX.Element;
export declare const InfoTooltip: ({ children, info, className }: {
    children: any;
    info: any;
    className: any;
}) => JSX.Element;
export declare const WarningTooltip: ({ children, warning, className }: {
    children: any;
    warning: any;
    className: any;
}) => JSX.Element;
export declare const ErrorTooltip: ({ children, error, className }: {
    children: any;
    error: any;
    className: any;
}) => JSX.Element;
export declare const SuccessTooltip: ({ children, success, className }: {
    children: any;
    success: any;
    className: any;
}) => JSX.Element;
export declare const useContextualTooltips: () => {
    showHelp: (id: any, helpText: any, options: any) => void;
    showInfo: (id: any, info: any, options: any) => void;
    hideTooltip: (id: any) => void;
};
export { TooltipProvider as default, useTooltips, Tooltip, HelpTooltip, InfoTooltip, WarningTooltip, ErrorTooltip, SuccessTooltip, useContextualTooltips, };
//# sourceMappingURL=ContextualTooltips.d.ts.map