/**
 * 🎯 ACTION PICKER - Selects top N actions for header
 * Filters by visibility, sorts by priority, splits into primary/overflow
 */

import type { HeaderAction, HeaderContext } from './actions';

export function pickHeaderActions(
  all: HeaderAction[],
  ctx: HeaderContext,
  maxVisible = 4
): { primary: HeaderAction[]; overflow: HeaderAction[] } {
  'worklet';
  const visible = all.filter((a) => (a.visible ? a.visible(ctx) : true));
  const sorted = visible.sort((a, b) => b.priority - a.priority);
  return {
    primary: sorted.slice(0, maxVisible),
    overflow: sorted.slice(maxVisible),
  };
}

