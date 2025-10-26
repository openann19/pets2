import { useEffect, useMemo, useState } from "react";
import { request } from "../services/api";

export type PremiumStatus = {
  active: boolean;
  plan?: "free" | "pro" | "elite";
  renewsAt?: string | null;
  trialEndsAt?: string | null;
};

export function usePremiumStatus(pollMs = 0) {
  const [status, setStatus] = useState<PremiumStatus>({ active: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchStatus() {
    try {
      setLoading(true);
      const data = await request<{ subscription?: PremiumStatus }>("/api/premium/status", { method: "GET" });
      setStatus({ 
        active: !!data?.subscription?.active, 
        plan: data?.subscription?.plan ?? "free",
        renewsAt: data?.subscription?.renewsAt,
        trialEndsAt: data?.subscription?.trialEndsAt,
      });
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load premium status");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStatus();
    if (pollMs > 0) {
      const id = setInterval(fetchStatus, pollMs);
      return () => clearInterval(id);
    }
  }, [pollMs]);

  const can = useMemo(() => {
    // central feature map – tweak as needed
    const isPro = status.plan === "pro" || status.plan === "elite";
    const isElite = status.plan === "elite";
    return {
      superLike: isPro,
      rewind: isPro,
      boost: isElite,
      arTrails: isPro,
      advancedFilters: isPro,
      unlimitedLikes: isElite,
    };
  }, [status]);

  return { status, can, loading, error, refresh: fetchStatus };
}

