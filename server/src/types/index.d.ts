/**
 * Type definition index file
 * Exports all types from various type modules using namespaces to avoid conflicts
 */

// Import all types
import * as CoreTypes from './index';
import * as AdminTypes from './admin';
import * as ApiTypes from './api';
import * as ServiceTypes from './services';

// Export namespaces
export { CoreTypes, AdminTypes, ApiTypes, ServiceTypes };

// Export some common types directly
export {
  User,
  Pet,
  Match,
  AuthenticatedRequest,
  IUser,
  IPet,
  IMatch,
} from './index';
