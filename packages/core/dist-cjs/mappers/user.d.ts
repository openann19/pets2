import type { User } from '../types';
export interface LegacyWebUser {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    isPremium?: boolean;
    preferences?: Record<string, unknown>;
}
export declare function toCoreUser(legacy: LegacyWebUser): User;
//# sourceMappingURL=user.d.ts.map