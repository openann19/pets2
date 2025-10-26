import { api } from "./api";

export interface CompatibilityResult {
  value: number;
  compatible: boolean;
  breakdown: {
    energy: number;
    size: number;
    age: number;
    activity: number;
    temperament: number;
  };
}

export async function getCompatibility(petAId: string, petBId: string): Promise<CompatibilityResult> {
  const { data } = await api.post<{ data: CompatibilityResult }>("/ai/compatibility", { petAId, petBId });
  return data;
}

