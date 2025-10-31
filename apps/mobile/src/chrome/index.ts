/**
 * 🎯 CHROME INDEX - Centralized exports for SmartHeader system
 */

export { SmartHeader } from './SmartHeader';
export { default as AppChrome } from './AppChrome';
export { ActionButton } from './ActionButton';
export { OverflowButton } from './OverflowButton';
export { OverflowSheet } from './OverflowSheet';
export { TitleArea } from './TitleArea';
export { HeaderIcon } from './HeaderIcon';
export { pickHeaderActions } from './pickHeaderActions';
export { headerBus, setHeader } from './HeaderBus';
export { useHeader } from './useHeader';
export { useHeaderWithCounts } from '@/hooks/useHeaderWithCounts';
export { ACTIONS } from './actions';
export type { HeaderAction, HeaderContext } from './actions';
export type { HeaderPayload } from './HeaderBus';

