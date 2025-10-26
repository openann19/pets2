const API_URL = process.env.EXPO_PUBLIC_API_URL || process.env.API_URL || "";

export async function generateBio(traits: string, interests: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/ai/bio`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ traits, interests }),
  });
  if (!res.ok) throw new Error("bio failed");
  return (await res.json()).bio as string;
}

export async function analyzePhoto(imageUrl: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/ai/analyze-photo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl }),
  });
  if (!res.ok) throw new Error("analyze failed");
  return (await res.json()).analysis as string;
}

export async function compatibility(petProfile: any, userPrefs: any): Promise<string> {
  const res = await fetch(`${API_URL}/api/ai/compatibility`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ petProfile, userPrefs }),
  });
  if (!res.ok) throw new Error("compat failed");
  return (await res.json()).result as string;
}

