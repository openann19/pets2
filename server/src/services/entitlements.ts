import { getCache, setCache } from "../config/redis";

const KEY = (userId: string) => `entitle:${userId}`;

export type Entitlement = { 
  active: boolean; 
  plan?: "free" | "pro" | "elite"; 
  renewsAt?: string | null; 
};

export async function setEntitlement(userId: string, e: Entitlement, ttlSec = 3600): Promise<void> {
  const success = await setCache(KEY(userId), JSON.stringify(e), ttlSec);
  if (!success) {
    console.warn(`Failed to cache entitlement for user ${userId}`);
  }
}

export async function getEntitlement(userId: string): Promise<Entitlement | null> {
  const raw = await getCache(KEY(userId));
  return raw ? JSON.parse(raw) : null;
}

