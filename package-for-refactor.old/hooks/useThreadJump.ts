import { useMemo } from "react";
import type { FlatList } from "react-native";

export function useThreadJump<T extends { _id: string }>(
  listRef: React.RefObject<FlatList<T>>,
  items: T[],
  onHighlight?: (id: string) => void,
) {
  const indexMap = useMemo(() => {
    const m = new Map<string, number>();
    items.forEach((it, i) => m.set(it._id, i));
    return m;
  }, [items]);

  async function jumpTo(id: string) {
    const idx = indexMap.get(id);
    if (idx == null) return;
    try {
      listRef.current?.scrollToIndex({
        index: idx,
        animated: true,
        viewPosition: 0.5,
      });
    } catch {
      // fallback: approximate
      listRef.current?.scrollToOffset({ offset: Math.max(0, idx - 3) * 72, animated: true });
    }
    // give the list a tick to settle, then highlight
    setTimeout(() => onHighlight?.(id), 160);
  }

  return { jumpTo };
}

