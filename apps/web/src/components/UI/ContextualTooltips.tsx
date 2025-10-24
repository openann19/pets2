'use client';
import { motion, AnimatePresence } from 'framer-motion';
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
const TooltipContext = createContext(null);
export const useTooltips = () => {
    const context = useContext(TooltipContext);
    if (!context) {
        throw new Error('useTooltips must be used within TooltipProvider');
    }
    return context;
};
export const TooltipProvider = ({ children }) => {
    const [tooltips, setTooltips] = useState(new Map());
    const showTooltip = useCallback((id, options) => {
        setTooltips(prev => {
            const newMap = new Map(prev);
            newMap.set(id, { id, ...options });
            return newMap;
        });
    }, []);
    const hideTooltip = useCallback((id) => {
        setTooltips(prev => {
            const newMap = new Map(prev);
            newMap.delete(id);
            return newMap;
        });
    }, []);
    const updateTooltip = useCallback((id, updates) => {
        setTooltips(prev => {
            const newMap = new Map(prev);
            const existing = newMap.get(id);
            if (existing) {
                newMap.set(id, { ...existing, ...updates });
            }
            return newMap;
        });
    }, []);
    const isTooltipVisible = useCallback((id) => {
        return tooltips.has(id);
    }, [tooltips]);
    const getTooltipState = useCallback((id) => {
        return tooltips.get(id);
    }, [tooltips]);
    return (<TooltipContext.Provider value={{
            tooltips,
            showTooltip,
            hideTooltip,
            updateTooltip,
            isTooltipVisible,
            getTooltipState,
        }}>
      {children}
      <TooltipRenderer />
    </TooltipContext.Provider>);
};
// ====== TOOLTIP RENDERER ======
const TooltipRenderer = () => {
    const { tooltips } = useTooltips();
    const [positions, setPositions] = useState(new Map());
    useEffect(() => {
        const updatePositions = () => {
            const newPositions = new Map();
            tooltips.forEach((tooltip, id) => {
                const element = document.querySelector(`[data-tooltip-id="${id}"]`);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    const position = calculatePosition(rect, tooltip.position, tooltip.maxWidth || 300);
                    newPositions.set(id, position);
                }
            });
            setPositions(newPositions);
        };
        updatePositions();
        window.addEventListener('scroll', updatePositions);
        window.addEventListener('resize', updatePositions);
        return () => {
            window.removeEventListener('scroll', updatePositions);
            window.removeEventListener('resize', updatePositions);
        };
    }, [tooltips]);
    const calculatePosition = (rect, preferredPosition, maxWidth) => {
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight,
        };
        const tooltipSize = {
            width: maxWidth,
            height: 60, // Estimated height
        };
        const spacing = 8;
        let position = preferredPosition;
        let x = 0;
        let y = 0;
        // Calculate preferred position
        switch (preferredPosition) {
            case 'top':
                x = rect.left + rect.width / 2 - tooltipSize.width / 2;
                y = rect.top - tooltipSize.height - spacing;
                break;
            case 'bottom':
                x = rect.left + rect.width / 2 - tooltipSize.width / 2;
                y = rect.bottom + spacing;
                break;
            case 'left':
                x = rect.left - tooltipSize.width - spacing;
                y = rect.top + rect.height / 2 - tooltipSize.height / 2;
                break;
            case 'right':
                x = rect.right + spacing;
                y = rect.top + rect.height / 2 - tooltipSize.height / 2;
                break;
            default:
                // Auto positioning
                const positions = ['top', 'bottom', 'right', 'left'];
                for (const pos of positions) {
                    const testPos = calculatePosition(rect, pos, maxWidth);
                    if (testPos.x >= 0 &&
                        testPos.x + tooltipSize.width <= viewport.width &&
                        testPos.y >= 0 &&
                        testPos.y + tooltipSize.height <= viewport.height) {
                        return testPos;
                    }
                }
                // Fallback to bottom
                return calculatePosition(rect, 'bottom', maxWidth);
        }
        // Adjust if out of bounds
        if (x < 0)
            x = spacing;
        if (x + tooltipSize.width > viewport.width)
            x = viewport.width - tooltipSize.width - spacing;
        if (y < 0)
            y = spacing;
        if (y + tooltipSize.height > viewport.height)
            y = viewport.height - tooltipSize.height - spacing;
        return { x, y, position };
    };
    return (<div className="fixed inset-0 pointer-events-none z-[9999]">
      <AnimatePresence>
        {Array.from(tooltips.entries()).map(([id, tooltip]) => {
            const position = positions.get(id);
            if (!position)
                return null;
            return (<motion.div key={id} initial={{ opacity: 0, scale: 0.8, y: position.position === 'top' ? 10 : -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: position.position === 'top' ? 10 : -10 }} transition={{ duration: 0.2, ease: 'easeOut' }} className="pointer-events-auto" style={{
                    position: 'absolute',
                    left: position.x,
                    top: position.y,
                    maxWidth: tooltip.maxWidth || 300,
                }}>
              <div className={`
                bg-gray-900 text-white text-sm rounded-lg px-3 py-2 shadow-lg
                ${tooltip.className || ''}
              `}>
                {tooltip.showArrow && (<div className={`
                    absolute w-2 h-2 bg-gray-900 transform rotate-45
                    ${position.position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' : ''}
                    ${position.position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' : ''}
                    ${position.position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' : ''}
                    ${position.position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' : ''}
                  `}/>)}
                {tooltip.content}
              </div>
            </motion.div>);
        })}
      </AnimatePresence>
    </div>);
};
export const Tooltip = ({ content, children, position = 'auto', trigger = 'hover', delay = 500, maxWidth = 300, showArrow = true, className, disabled = false, id, }) => {
    const { showTooltip, hideTooltip } = useTooltips();
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef();
    const tooltipId = useRef(id || `tooltip-${Math.random().toString(36).substr(2, 9)}`);
    const handleShow = useCallback(() => {
        if (disabled)
            return;
        if (delay > 0) {
            timeoutRef.current = setTimeout(() => {
                setIsVisible(true);
                showTooltip(tooltipId.current, {
                    content,
                    position,
                    trigger,
                    delay,
                    maxWidth,
                    showArrow,
                    className,
                    disabled,
                });
            }, delay);
        }
        else {
            setIsVisible(true);
            showTooltip(tooltipId.current, {
                content,
                position,
                trigger,
                delay,
                maxWidth,
                showArrow,
                className,
                disabled,
            });
        }
    }, [content, position, trigger, delay, maxWidth, showArrow, className, disabled, showTooltip]);
    const handleHide = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
        hideTooltip(tooltipId.current);
    }, [hideTooltip]);
    const handleClick = useCallback(() => {
        if (trigger === 'click') {
            if (isVisible) {
                handleHide();
            }
            else {
                handleShow();
            }
        }
    }, [trigger, isVisible, handleShow, handleHide]);
    const handleFocus = useCallback(() => {
        if (trigger === 'focus') {
            handleShow();
        }
    }, [trigger, handleShow]);
    const handleBlur = useCallback(() => {
        if (trigger === 'focus') {
            handleHide();
        }
    }, [trigger, handleHide]);
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            hideTooltip(tooltipId.current);
        };
    }, [hideTooltip]);
    return (<div data-tooltip-id={tooltipId.current} onMouseEnter={trigger === 'hover' ? handleShow : undefined} onMouseLeave={trigger === 'hover' ? handleHide : undefined} onClick={handleClick} onFocus={handleFocus} onBlur={handleBlur} className="inline-block">
      {children}
    </div>);
};
export const HelpTooltip = ({ children, helpText, className }) => {
    return (<Tooltip content={<div className="text-sm">
          <div className="font-medium mb-1">Help</div>
          <div>{helpText}</div>
        </div>} position="top" maxWidth={250} className={className}>
      {children}
    </Tooltip>);
};
export const InfoTooltip = ({ children, info, className }) => {
    return (<Tooltip content={<div className="text-sm">
          <div className="font-medium mb-1">ℹ️ Info</div>
          <div>{info}</div>
        </div>} position="top" maxWidth={250} className={className}>
      {children}
    </Tooltip>);
};
export const WarningTooltip = ({ children, warning, className }) => {
    return (<Tooltip content={<div className="text-sm">
          <div className="font-medium mb-1 text-yellow-400">⚠️ Warning</div>
          <div>{warning}</div>
        </div>} position="top" maxWidth={250} className={`bg-yellow-900 border border-yellow-600 ${className || ''}`}>
      {children}
    </Tooltip>);
};
export const ErrorTooltip = ({ children, error, className }) => {
    return (<Tooltip content={<div className="text-sm">
          <div className="font-medium mb-1 text-red-400">❌ Error</div>
          <div>{error}</div>
        </div>} position="top" maxWidth={250} className={`bg-red-900 border border-red-600 ${className || ''}`}>
      {children}
    </Tooltip>);
};
export const SuccessTooltip = ({ children, success, className }) => {
    return (<Tooltip content={<div className="text-sm">
          <div className="font-medium mb-1 text-green-400">✅ Success</div>
          <div>{success}</div>
        </div>} position="top" maxWidth={250} className={`bg-green-900 border border-green-600 ${className || ''}`}>
      {children}
    </Tooltip>);
};
// ====== CONTEXTUAL TOOLTIP HOOKS ======
export const useContextualTooltips = () => {
    const { showTooltip, hideTooltip, updateTooltip } = useTooltips();
    const showHelp = useCallback((id, helpText, options) => {
        showTooltip(id, {
            content: (<div className="text-sm">
          <div className="font-medium mb-1">Help</div>
          <div>{helpText}</div>
        </div>),
            position: options?.position || 'top',
            trigger: 'hover',
            maxWidth: options?.maxWidth || 250,
            showArrow: true,
        });
    }, [showTooltip]);
    const showInfo = useCallback((id, info, options) => {
        showTooltip(id, {
            content: (<div className="text-sm">
          <div className="font-medium mb-1">ℹ️ Info</div>
          <div>{info}</div>
        </div>),
            position: options?.position || 'top',
            trigger: 'hover',
            maxWidth: options?.maxWidth || 250,
            showArrow: true,
        });
    }, [showTooltip]);
    const hideTooltipById = useCallback((id) => {
        hideTooltip(id);
    }, [hideTooltip]);
    return {
        showHelp,
        showInfo,
        hideTooltip: hideTooltipById,
    };
};
// ====== EXPORT ALL COMPONENTS ======
export { TooltipProvider as default, useTooltips, Tooltip, HelpTooltip, InfoTooltip, WarningTooltip, ErrorTooltip, SuccessTooltip, useContextualTooltips, };
//# sourceMappingURL=ContextualTooltips.jsx.map