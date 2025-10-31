# 🚀 Optimization Quick Reference

**One-page cheat sheet for all optimization utilities**

---

## 📦 Import Shortcuts

```typescript
// All optimization hooks
import {
  useOptimisticUpdate,
  useOptimisticSwipe,
  useOptimisticChat,
  usePrefetching,
  usePredictivePrefetching,
  useNavigationPrefetch,
  useRequestBatching,
  useQueryDeduplication,
  useAdaptiveQuality,
  useAdaptiveImageQuality,
  usePerformanceMonitor,
  useAsyncPerformance,
  useDeferredValueOptimized,
  useTransitionOptimized,
  useOptimizedListUpdates,
} from '@/hooks/optimization';

// All optimization components
import {
  OptimizedImage,
  ProgressiveImage,
  SkeletonScreen,
  ListSkeletonScreen,
  CardSkeletonScreen,
  ChatSkeletonScreen,
} from '@/components/optimization';
```

---

## 🎯 Common Use Cases

### 1. Replace Image Component
```typescript
// ❌ OLD
import { Image } from 'react-native';
<Image source={{ uri: url }} />

// ✅ NEW
import { OptimizedImage } from '@/components/optimization';
<OptimizedImage source={{ uri: url }} adaptive={true} />
```

### 2. Add Optimistic Swipe
```typescript
import { useOptimisticSwipe } from '@/hooks/optimization';

const { handleLike, handlePass, handleSuperLike } = useOptimisticSwipe({
  userPetId,
  pets,
  setPets,
  moveToNext: () => setCurrentIndex(i => i + 1),
  onSuccess: (action, pet, match) => {
    if (match) navigation.navigate('Match', { matchId: match.id });
  },
  onError: (action, pet, error) => {
    Alert.alert('Error', `Failed to ${action}: ${error.message}`);
  },
});
```

### 3. Prefetch Images
```typescript
import { usePrefetching } from '@/hooks/optimization';

const { prefetchSwipeImages, prefetchImages, prefetchRoute } = usePrefetching({
  wifiOnly: false, // Prefetch on any connection
  maxImages: 10,
  enableImagePrefetch: true,
  enableRoutePrefetch: true,
});

useEffect(() => {
  // Prefetch next 5 pets' images
  prefetchSwipeImages(
    pets.slice(currentIndex, currentIndex + 5).map(p => ({ 
      images: p.photos || [] 
    })),
    currentIndex
  );
}, [pets, currentIndex]);
```

### 4. Add Skeleton Loading
```typescript
import { 
  SkeletonScreen, 
  ListSkeletonScreen, 
  CardSkeletonScreen,
  ChatSkeletonScreen 
} from '@/components/optimization';

if (isLoading) return <ListSkeletonScreen />;

// Custom skeleton
<SkeletonScreen 
  itemCount={5} 
  itemHeight={120} 
  spacing={16}
  shimmer={true}
/>
```

### 5. Request Batching
```typescript
import { useRequestBatching, useQueryDeduplication } from '@/hooks/optimization';

const { batchRequest } = useRequestBatching({
  batchWindow: 50, // ms
  maxBatchSize: 10,
});

// Batches multiple requests together
const [user1, user2, user3] = await Promise.all([
  batchRequest('user-1', () => fetchUser('1')),
  batchRequest('user-2', () => fetchUser('2')),
  batchRequest('user-3', () => fetchUser('3')),
]);
```

---

## 📊 Performance Monitoring

```typescript
import { usePerformanceMonitor, useAsyncPerformance } from '@/hooks/optimization';

const metrics = usePerformanceMonitor({
  name: 'SwipeScreen',
  logMetrics: true,
  thresholds: { 
    minFrameRate: 55,
    maxInteractionDelay: 100,
  },
});

// Monitor async operations
const { measureAsync, startMeasure, endMeasure } = useAsyncPerformance('fetchUserData');
const data = await measureAsync('fetch', () => fetchUserData());
```

---

## 🎨 Adaptive Quality

```typescript
import { useAdaptiveQuality, useAdaptiveImageQuality } from '@/hooks/optimization';

// General adaptive quality
const { quality, settings, networkQuality, deviceQuality } = useAdaptiveQuality({
  adaptToNetwork: true,
  adaptToDevice: true,
  minQuality: 'low',
  maxQuality: 'high',
});

// Use settings: enableAnimations, imageQuality, enableEffects, enablePrefetching, maxConcurrentRequests

// Image-specific adaptive quality
const { quality, getImageUrl, getImagePriority, networkQuality } = useAdaptiveImageQuality();

// Get optimized image URL based on quality
const optimizedUrl = getImageUrl(baseUrl, {
  low: `${baseUrl}?q=60`,
  medium: `${baseUrl}?q=80`,
  high: `${baseUrl}?q=100`,
});
```

---

## 💾 Memory Management

```typescript
import { ObjectPool, WeakCache } from '@/utils/memory/objectPool';

// Object pooling for frequently allocated objects
const pool = new ObjectPool({
  factory: () => ({ x: 0, y: 0 }),
  reset: (obj) => { obj.x = 0; obj.y = 0; },
  maxSize: 100,
  initialSize: 10,
});

const obj = pool.acquire();
// ... use obj
pool.release(obj);

// Weak cache for temporary data
const cache = new WeakCache();
cache.set(user, userData);
const data = cache.get(user);
```

---

## 🗂️ Context Splitting

```typescript
import { splitContext } from '@/utils/context/contextSplitting';

const { contexts, createProvider } = splitContext([
  { name: 'user', updateFrequency: 'rare', defaultValue: null },
  { name: 'notifications', updateFrequency: 'frequent', defaultValue: [] },
]);
```

---

## 🔄 Multi-Tier Cache

```typescript
import { 
  MultiTierCache, 
  staleWhileRevalidate,
  CacheInvalidation 
} from '@/utils/caching/multiTierCache';

const cache = new MultiTierCache(queryClient);

// Stale-while-revalidate pattern (returns stale immediately, refreshes in background)
const data = await staleWhileRevalidate('user-1', fetchUser, cache, {
  key: 'user-1',
  ttl: 5 * 60 * 1000, // 5 minutes
  persistent: true, // Store in L2 (MMKV)
});

// Manual cache operations
cache.set(userData, { key: 'user-1', ttl: 60000, persistent: true });
const cached = await cache.get('user-1');
cache.invalidate('user-1');

// Cache stats
const stats = cache.getStats(); // { l1Size, l2Size, l3Size }
```

---

## 🚀 React 18 Concurrent Features

```typescript
import { 
  useDeferredValueOptimized,
  useTransitionOptimized,
  useOptimizedListUpdates 
} from '@/hooks/optimization';

// Defer non-urgent updates
const deferredQuery = useDeferredValueOptimized(searchQuery);

// Mark transitions as non-urgent
const [isPending, startTransition] = useTransitionOptimized();
startTransition(() => {
  setFilter(newFilter); // Won't block UI
});

// Optimize list updates
const optimizedList = useOptimizedListUpdates(items, {
  batchSize: 50,
  throttleMs: 16,
});
```
---

## 📚 Additional Hooks

### Optimistic Chat
```typescript
import { useOptimisticChat } from '@/hooks/optimization';

const { sendMessage, retryMessage } = useOptimisticChat({
  messages,
  setMessages,
  userId,
  matchId,
  sendMessageFn: (content) => api.sendMessage(matchId, content),
});

await sendMessage('Hello!'); // Optimistically shows immediately
```

### Predictive Prefetching
```typescript
import { usePredictivePrefetching } from '@/hooks/optimization';

const { prefetchImages, recordNavigation } = usePredictivePrefetching();

// Record navigation to learn patterns
recordNavigation('Swipe');
// Automatically prefetches likely next routes/images
```

### Navigation Prefetch
```typescript
import { useNavigationPrefetch } from '@/hooks/optimization';

useNavigationPrefetch({
  route: 'Chat',
  screen: () => import('./screens/ChatScreen'),
});
```

---

**Last Updated**: 2025-01-27
