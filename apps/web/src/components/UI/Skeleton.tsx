import ContentLoader from 'react-content-loader';
import { motion } from 'framer-motion';
// Base skeleton with shimmer effect
export const SkeletonBase = (props) => (<ContentLoader speed={2} backgroundColor="#d1d5db" foregroundColor="#eceff1" className="dark:bg-neutral-700 dark:foreground-neutral-600" {...props}>
    {props.children}
  </ContentLoader>);
// Pet Card Skeleton
export const SkeletonCard = (props) => (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="rounded-xl overflow-hidden">
    <ContentLoader speed={2} width="100%" height={360} backgroundColor="#d1d5db" foregroundColor="#eceff1" className="dark:bg-neutral-700 dark:foreground-neutral-600" {...props}>
      <rect x="0" y="0" rx="16" ry="16" width="100%" height="240"/>
      <rect x="0" y="260" rx="4" ry="4" width="60%" height="16"/>
      <rect x="0" y="290" rx="4" ry="4" width="40%" height="16"/>
      <rect x="0" y="320" rx="4" ry="4" width="80%" height="12"/>
    </ContentLoader>
  </motion.div>);
// Chat Message Skeleton
export const SkeletonMessage = (props) => (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex gap-3 p-4">
    <ContentLoader speed={2} width="100%" height={60} backgroundColor="#d1d5db" foregroundColor="#eceff1" className="dark:bg-neutral-700 dark:foreground-neutral-600" {...props}>
      <circle cx="20" cy="20" r="16"/>
      <rect x="50" y="8" rx="4" ry="4" width="60%" height="12"/>
      <rect x="50" y="28" rx="4" ry="4" width="80%" height="12"/>
      <rect x="50" y="48" rx="4" ry="4" width="40%" height="8"/>
    </ContentLoader>
  </motion.div>);
// Avatar Skeleton
export const SkeletonAvatar = ({ size = 40, ...props }) => (<ContentLoader speed={2} width={size} height={size} backgroundColor="#d1d5db" foregroundColor="#eceff1" className="dark:bg-neutral-700 dark:foreground-neutral-600 rounded-full" {...props}>
    <circle cx={size / 2} cy={size / 2} r={size / 2}/>
  </ContentLoader>);
// Text Skeleton
export const SkeletonText = ({ lines = 3, width = '100%', height = 16, ...props }) => (<div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (<ContentLoader key={i} speed={2} width={width} height={height} backgroundColor="#d1d5db" foregroundColor="#eceff1" className="dark:bg-neutral-700 dark:foreground-neutral-600" {...props}>
        <rect x="0" y="0" rx="4" ry="4" width={i === lines - 1 ? '60%' : '100%'} height={height}/>
      </ContentLoader>))}
  </div>);
// Button Skeleton
export const SkeletonButton = ({ width = 120, height = 44, ...props }) => (<ContentLoader speed={2} width={width} height={height} backgroundColor="#d1d5db" foregroundColor="#eceff1" className="dark:bg-neutral-700 dark:foreground-neutral-600 rounded-lg" {...props}>
    <rect x="0" y="0" rx="8" ry="8" width={width} height={height}/>
  </ContentLoader>);
// List Skeleton
export const SkeletonList = ({ items = 5, itemHeight = 60, ...props }) => (<div className="space-y-4">
    {Array.from({ length: items }).map((_, i) => (<ContentLoader key={i} speed={2} width="100%" height={itemHeight} backgroundColor="#d1d5db" foregroundColor="#eceff1" className="dark:bg-neutral-700 dark:foreground-neutral-600" {...props}>
        <circle cx="20" cy="20" r="16"/>
        <rect x="50" y="8" rx="4" ry="4" width="60%" height="12"/>
        <rect x="50" y="28" rx="4" ry="4" width="40%" height="12"/>
        <rect x="85%" y="8" rx="4" ry="4" width="12%" height="12"/>
      </ContentLoader>))}
  </div>);
// Profile Skeleton
export const SkeletonProfile = (props) => (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
    <ContentLoader speed={2} width="100%" height={200} backgroundColor="#d1d5db" foregroundColor="#eceff1" className="dark:bg-neutral-700 dark:foreground-neutral-600" {...props}>
      <circle cx="100" cy="60" r="40"/>
      <rect x="0" y="120" rx="4" ry="4" width="60%" height="20"/>
      <rect x="0" y="150" rx="4" ry="4" width="40%" height="16"/>
      <rect x="0" y="180" rx="4" ry="4" width="80%" height="12"/>
    </ContentLoader>
  </motion.div>);
// Grid Skeleton
export const SkeletonGrid = ({ columns = 2, rows = 3, gap = 4, ...props }) => (<div className="grid gap-4" style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap * 0.25}rem`
    }}>
    {Array.from({ length: columns * rows }).map((_, i) => (<SkeletonCard key={i} {...props}/>))}
  </div>);
// Custom shimmer effect
export const Shimmer = ({ className = '', ...props }) => (<div className={`animate-pulse bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 dark:from-neutral-700 dark:via-neutral-600 dark:to-neutral-700 bg-[length:200%_100%] animate-shimmer ${className}`} {...props}/>);
// Loading states for different components
export const LoadingStates = {
    card: SkeletonCard,
    message: SkeletonMessage,
    avatar: SkeletonAvatar,
    text: SkeletonText,
    button: SkeletonButton,
    list: SkeletonList,
    profile: SkeletonProfile,
    grid: SkeletonGrid,
    shimmer: Shimmer,
};
//# sourceMappingURL=Skeleton.jsx.map
//# sourceMappingURL=Skeleton.jsx.map