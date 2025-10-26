/**
 * Elite Components Barrel Export
 *
 * Centralized export for all elite components.
 * Maintains backward compatibility with EliteComponents.tsx
 */

// === CONTAINERS ===
export { EliteContainer, EliteScrollContainer } from "./containers";

// === HEADERS ===
export { EliteHeader, ElitePageHeader } from "./headers";

// === CARDS ===
export { EliteCard } from "./cards";

// === BUTTONS ===
export { EliteButton } from "./buttons";

// === ANIMATIONS ===
export {
  FadeInUp,
  ScaleIn,
  StaggeredContainer,
  GestureWrapper,
} from "./animations";

// === UTILITIES ===
export { EliteLoading, EliteEmptyState } from "./utils";

// === CONSTANTS ===
export { PREMIUM_GRADIENTS, PREMIUM_SHADOWS } from "./constants";

// Default export for backward compatibility
export { EliteContainer as default };
