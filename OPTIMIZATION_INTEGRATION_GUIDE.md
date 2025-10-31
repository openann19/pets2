# 🚀 Optimization Integration Guide

This guide shows how to integrate the implemented optimizations into existing code.

> **📖 Quick Reference**: See [`OPTIMIZATION_QUICK_REFERENCE.md`](./OPTIMIZATION_QUICK_REFERENCE.md) for a one-page cheat sheet of all optimization utilities.

---

## 1. FlashList Migration (Already Done)

✅ Migrated: MessageList, MyPetsScreen, CommunityScreen, MatchesScreen

**For other FlatLists**, follow this pattern:
```typescript
import { FlashList } from '@shopify/flash-list';

// Replace FlatList with FlashList
<FlashList
  data={items}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  estimatedItemSize={150} // Required for FlashList
  drawDistance={250} // Render items within 250px
  estimatedListSize={{ height: 800, width: 400 }}
  // ... other props same as FlatList
/>
```

---

## 2. Optimistic UI Integration

### Chat Messages

```typescript
import { useOptimisticChat } from '@/hooks/optimization/useOptimisticChat';

function ChatScreen({ matchId }) {
  const { messages, setMessages } = useChatData(matchId);
  const { sendMessage, retryMessage } = useOptimisticChat({
    messages,
    setMessages,
    userId: user._id,
    matchId,
    sendMessageFn: async (content) => {
      return await matchesAPI.sendMessage(matchId, content);
    },
  });

  // Use sendMessage instead of direct API call
  const handleSend = async () => {
    await sendMessage(inputText);
  };
}
```

### Swipe Actions

```typescript
import { useOptimisticSwipe } from '@/hooks/optimization/useOptimisticSwipe';

function SwipeScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { handleLike, handlePass, handleSuperLike } = useOptimisticSwipe({
    userPetId: user.activePetId,
    pets,
    setPets,
    moveToNext: () => setCurrentIndex(prev => prev + 1),
    onSuccess: (action, pet, match) => {
      if (match) {
        // Show match modal
      }
    },
    onError: (action, pet, error) => {
      // Show error toast
    },
  });

  // Use optimistic handlers
  <SwipeCard onSwipeRight={() => handleLike(pet)} />
}
```

---

## 3. Progressive Images

```typescript
import { ProgressiveImage } from '@/components/optimization/ProgressiveImage';

// Replace FastImage or Image
<ProgressiveImage
  source={{ uri: imageUrl }}
  placeholder={{ uri: lowQualityUrl }} // Optional blur-up
  estimatedHeight={200}
  adaptive={true} // Adjust quality based on network
  style={styles.image}
/>
```

---

## 4. Request Batching

```typescript
import { useRequestBatching } from '@/hooks/optimization/useRequestBatching';

function MyComponent() {
  const { batchRequest } = useRequestBatching({
    maxWaitTime: 50, // ms
    maxBatchSize: 10,
    dedupeWindow: 1000, // ms
  });

  // Batched requests are automatically deduplicated
  const user1 = await batchRequest('user-1', () => fetchUser('1'));
  const user2 = await batchRequest('user-2', () => fetchUser('2'));
  // Duplicate request within 1s returns same promise
}
```

---

## 5. Prefetching

### Route Prefetching

```typescript
import { usePrefetching } from '@/hooks/optimization/usePrefetching';

function HomeScreen() {
  const { prefetchRoute } = usePrefetching();

  useEffect(() => {
    // Prefetch likely next screen
    prefetchRoute('Swipe', () => import('../screens/SwipeScreen'));
    prefetchRoute('Matches', () => import('../screens/MatchesScreen'));
  }, [prefetchRoute]);
}
```

### Image Prefetching

```typescript
import { usePrefetching } from '@/hooks/optimization/usePrefetching';

function SwipeScreen({ pets }) {
  const { prefetchSwipeImages } = usePrefetching();

  useEffect(() => {
    // Prefetch next 5 pet images
    prefetchSwipeImages(
      pets.map(p => ({ images: p.photos })),
      currentIndex
    );
  }, [pets, currentIndex, prefetchSwipeImages]);
}
```

---

## 6. Multi-Tier Caching

```typescript
import { MultiTierCache, staleWhileRevalidate } from '@/utils/caching/multiTierCache';
import { useQueryClient } from '@tanstack/react-query';

function MyComponent() {
  const queryClient = useQueryClient();
  const cache = new MultiTierCache(queryClient);

  // Use stale-while-revalidate
  const data = await staleWhileRevalidate(
    'user-profile',
    async () => await fetchUserProfile(),
    cache,
    { key: 'user-profile', ttl: 5 * 60 * 1000, persistent: true }
  );

  // Or direct cache usage
  const cached = await cache.get('key');
  cache.set(value, { key: 'key', ttl: 60000, persistent: false });
}
```

---

## 7. Skeleton Screens

```typescript
import { SkeletonScreen, ListSkeletonScreen } from '@/components/optimization/SkeletonScreen';

function MyScreen({ isLoading, data }) {
  if (isLoading) {
    return <ListSkeletonScreen />; // Or CardSkeletonScreen, ChatSkeletonScreen
  }

  return <YourContent data={data} />;
}
```

---

## 8. React 18 Concurrent Features

```typescript
import { useDeferredValueOptimized, useTransitionOptimized } from '@/hooks/optimization/useReact18Concurrent';

function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Defer non-critical search results
  const deferredResults = useDeferredValueOptimized(searchResults);
  
  // Mark heavy operations as transitions
  const { isPending, startTransition } = useTransitionOptimized();
  
  const handleSearch = (query: string) => {
    startTransition(() => {
      // Heavy search operation
      performSearch(query);
    });
  };

  return (
    <>
      {isPending && <LoadingIndicator />}
      <ResultsList results={deferredResults} />
    </>
  );
}
```

---

## 9. Memory Management

```typescript
import { ObjectPool, WeakCache, ArrayPool } from '@/utils/memory/objectPool';

// Object pooling for high-frequency operations
const animationPool = new ObjectPool({
  factory: () => ({ x: 0, y: 0, rotation: 0 }),
  reset: (obj) => {
    obj.x = 0;
    obj.y = 0;
    obj.rotation = 0;
  },
});

function AnimationComponent() {
  const obj = animationPool.acquire();
  // Use object
  // ...
  animationPool.release(obj); // Return to pool
}

// Weak cache for temporary data
const tempCache = new WeakCache();
tempCache.set(componentRef, temporaryData);
const data = tempCache.get(componentRef); // Auto GC when ref is gone

// Array pooling
const tempArray = ArrayPool.acquire(100);
// Use array
ArrayPool.release(tempArray);
```

---

## 10. Bundle Analyzer CI

Add to your CI pipeline:

```yaml
# .github/workflows/ci.yml
- name: Bundle Size Check
  run: |
    pnpm build
    pnpm bundle:analyze:ci
```

Or in package.json scripts:
```json
{
  "scripts": {
    "ci": "pnpm lint && pnpm typecheck && pnpm test && pnpm bundle:analyze:ci"
  }
}
```

---

## Best Practices

1. **Start Small**: Integrate one optimization at a time
2. **Measure**: Use React DevTools Profiler to measure impact
3. **Test**: Verify optimistic updates work correctly
4. **Monitor**: Watch bundle sizes with CI analyzer
5. **Network Aware**: Use network quality checks for prefetching

---

## Performance Checklist

- [ ] All major lists use FlashList
- [ ] Chat messages use optimistic updates
- [ ] Swipe actions use optimistic updates
- [ ] Images use ProgressiveImage component
- [ ] Routes are prefetched on likely navigation
- [ ] Swipe stack images are prefetched
- [ ] Skeleton screens used for loading states
- [ ] Multi-tier cache used for API data
- [ ] Bundle size checked in CI
- [ ] Memory pooling used for animations

---

**Last Updated**: 2025-01-27
