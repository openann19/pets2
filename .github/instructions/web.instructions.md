---
applyTo:
  - 'apps/web/**'
---

# Web App Instructions (Next.js 14)

## Overview

The web application is built with Next.js 14.2.33, React 18.2.0, TypeScript, and Tailwind CSS. It emphasizes premium UX with studio-quality animations using Framer Motion.

## Next.js Specific Standards

### App Router vs Pages Router
This project uses the **Pages Router** (not App Router).
- Pages in `src/pages/`
- API routes in `src/pages/api/`
- Dynamic routes: `[id].tsx`
- Catch-all routes: `[...slug].tsx`

### File Structure
```
apps/web/
├── src/
│   ├── pages/              # Page components (Pages Router)
│   │   ├── _app.tsx       # App wrapper
│   │   ├── _document.tsx  # Document customization
│   │   ├── index.tsx      # Home page (/)
│   │   └── api/           # API routes
│   ├── components/        # React components
│   │   ├── Animation/    # Animation components
│   │   ├── Chat/         # Chat feature
│   │   ├── Layout/       # Layout components
│   │   ├── Swipe/        # Swipe feature
│   │   └── UI/           # UI components
│   ├── hooks/            # Custom React hooks
│   ├── contexts/         # React contexts
│   ├── services/         # API clients
│   ├── utils/            # Utility functions
│   ├── styles/           # Global styles
│   └── types/            # TypeScript types
├── public/               # Static assets
└── cypress/              # E2E tests
```

### Routing & Navigation
```typescript
// Use Next.js Link component
import Link from 'next/link';

<Link href="/profile">
  <a>Profile</a>
</Link>

// Programmatic navigation
import { useRouter } from 'next/router';

const router = useRouter();
router.push('/dashboard');

// Access route params
const { id } = router.query;
```

### Data Fetching
- **Client-side**: Use React Query for all API calls
- **SSR**: Use `getServerSideProps` sparingly (prefer client-side)
- **SSG**: Use `getStaticProps` for static content
- **ISR**: Use `revalidate` for incremental static regeneration

```typescript
// Prefer React Query for data fetching
import { useQuery } from '@tanstack/react-query';

export const UserProfile = ({ userId }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => apiClient.users.getProfile(userId),
  });
  
  if (isLoading) return <Skeleton />;
  return <div>{data.name}</div>;
};
```

### Images
```typescript
// Always use Next.js Image component
import Image from 'next/image';

<Image
  src="/images/pet.jpg"
  alt="Pet profile"
  width={400}
  height={400}
  priority // For above-the-fold images
  placeholder="blur"
/>
```

### Head & Meta Tags
```typescript
import Head from 'next/head';

<Head>
  <title>Page Title | PawfectMatch</title>
  <meta name="description" content="Page description" />
  <meta property="og:title" content="Page Title" />
</Head>
```

## Styling with Tailwind CSS

### Utility-First Approach
```tsx
// Prefer Tailwind utilities
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-bold text-gray-900">Title</h2>
</div>

// For complex styles, extract to components
// Avoid inline styles - use Tailwind
```

### Custom Styles
When Tailwind utilities are insufficient, use CSS Modules:
```typescript
import styles from './Component.module.css';

<div className={styles.container}>
  {/* content */}
</div>
```

### Theme Configuration
Tailwind config in `tailwind.config.js`:
- Custom colors
- Custom spacing
- Custom fonts
- Custom breakpoints

## Framer Motion Animations

### Animation Principles
- Use spring physics: `{ type: "spring", stiffness: 300, damping: 30 }`
- Implement shared layout animations
- Stagger list animations with 0.07s delay
- Use `AnimatePresence` for exit animations
- 3D perspective effects with `rotateY`

### Shared Layout Animations
```tsx
import { motion } from 'framer-motion';

<motion.div layoutId="card-123">
  {/* This element morphs seamlessly */}
</motion.div>
```

### Page Transitions
```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

<AnimatePresence mode="wait">
  <motion.div
    key={router.pathname}
    initial="initial"
    animate="enter"
    exit="exit"
    variants={pageVariants}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

### List Stagger
```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

<motion.ul variants={containerVariants} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.li key={item.id} variants={itemVariants}>
      {item.content}
    </motion.li>
  ))}
</motion.ul>
```

## React Query Setup

### Query Client Configuration
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

### Query Patterns
```typescript
// List query
export const useMatches = () => {
  return useQuery({
    queryKey: ['matches'],
    queryFn: () => apiClient.matches.getAll(),
  });
};

// Detail query with params
export const useMatch = (matchId: string) => {
  return useQuery({
    queryKey: ['match', matchId],
    queryFn: () => apiClient.matches.getById(matchId),
    enabled: !!matchId, // Only run if matchId exists
  });
};

// Mutation with optimistic updates
export const useCreateMatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiClient.matches.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
};
```

## Forms with React Hook Form + Zod

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  age: z.number().min(18, 'Must be 18 or older'),
});

type FormData = z.infer<typeof schema>;

export const RegistrationForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = (data: FormData) => {
    // Handle form submission
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button type="submit">Register</button>
    </form>
  );
};
```

## Socket.io for Real-Time Features

```typescript
import { useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';

export const ChatRoom = ({ roomId }: Props) => {
  const socket = useSocket();
  
  useEffect(() => {
    socket.emit('join-room', roomId);
    
    socket.on('message', (message) => {
      // Handle incoming message
    });
    
    return () => {
      socket.off('message');
      socket.emit('leave-room', roomId);
    };
  }, [socket, roomId]);
  
  return <div>Chat Room</div>;
};
```

## Performance Optimization

### Code Splitting
```typescript
import dynamic from 'next/dynamic';

// Lazy load heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false, // Disable SSR if not needed
});
```

### Memoization
```typescript
import { memo, useMemo, useCallback } from 'react';

// Memoize expensive components
export const ExpensiveList = memo(({ items }: Props) => {
  return <ul>{items.map(renderItem)}</ul>;
});

// Memoize expensive calculations
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.score - b.score);
}, [data]);

// Memoize callbacks passed to children
const handleClick = useCallback(() => {
  // Handle click
}, [dependencies]);
```

### Image Optimization
- Use Next.js `<Image>` component
- Serve images from CDN (Cloudinary)
- Use appropriate formats (WebP, AVIF)
- Implement lazy loading
- Set explicit width/height

## Accessibility

### Semantic HTML
```tsx
<main>
  <header>
    <nav aria-label="Main navigation">
      {/* Navigation items */}
    </nav>
  </header>
  
  <article>
    <h1>Article Title</h1>
    {/* Content */}
  </article>
</main>
```

### ARIA Attributes
```tsx
<button
  aria-label="Close dialog"
  aria-expanded={isOpen}
  aria-controls="dialog-content"
  onClick={handleClose}
>
  <CloseIcon aria-hidden="true" />
</button>

<div
  id="dialog-content"
  role="dialog"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  {/* Dialog content */}
</div>
```

### Keyboard Navigation
- Tab order should be logical
- Implement keyboard shortcuts where appropriate
- Focus management after route changes
- Escape key to close modals
- Enter/Space for button activation

### Color Contrast
- WCAG AA: 4.5:1 for normal text
- WCAG AA: 3:1 for large text
- Use contrast checker tools
- Test with browser extensions

## Testing

### Component Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

test('button click triggers action', () => {
  const handleClick = jest.fn();
  renderWithProviders(<Button onClick={handleClick}>Click me</Button>);
  
  fireEvent.click(screen.getByText('Click me'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### E2E Tests with Playwright
```typescript
// cypress/e2e/login.cy.ts
describe('Login Flow', () => {
  it('should login successfully', () => {
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('user@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="submit-button"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

## Environment Variables

Create `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
```

Access in code:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

Note: `NEXT_PUBLIC_` prefix makes variables available in browser.

## Common Patterns

### Protected Routes
```typescript
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);
  
  if (isLoading) return <LoadingSpinner />;
  if (!user) return null;
  
  return <>{children}</>;
};
```

### Error Boundaries
```typescript
import { Component, ErrorInfo, ReactNode } from 'react';

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
    // Log to error monitoring service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    
    return this.props.children;
  }
}
```

## Build & Development

### Development
```bash
pnpm --filter web dev      # Start dev server (localhost:3000)
```

### Build
```bash
pnpm --filter web build    # Production build
pnpm --filter web start    # Start production server
```

### Testing
```bash
pnpm --filter web test              # Run tests
pnpm --filter web test:coverage     # With coverage
pnpm --filter web test:e2e          # E2E tests
```

### Linting
```bash
pnpm --filter web lint              # Check
pnpm --filter web lint:fix          # Fix
```

## Quality Gates

Before merging:
1. TypeScript: No compilation errors
2. ESLint: Zero warnings
3. Tests: All passing, 80%+ coverage
4. Lighthouse: Score 90+
5. Bundle size: Within budget (<2MB)

## Performance Targets

- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Time to Interactive: <3.5s
- Cumulative Layout Shift: <0.1
- First Input Delay: <100ms

## Resources

- Next.js docs: https://nextjs.org/docs
- Framer Motion: https://www.framer.com/motion
- React Query: https://tanstack.com/query
- Tailwind CSS: https://tailwindcss.com
