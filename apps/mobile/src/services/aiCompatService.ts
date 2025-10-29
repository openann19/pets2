import { request } from './api';

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

export async function getCompatibility(
  petAId: string,
  petBId: string,
): Promise<CompatibilityResult> {
  const result = await request<{ data: CompatibilityResult }>('/ai/compatibility', {
    method: 'POST',
    body: { petAId, petBId },
  });
  return result.data;
}
