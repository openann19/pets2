import { request } from "./api";
import type { Pet } from "@pawfectmatch/core";

export async function likePet(petId: string) {
  await request<{ success: boolean }>("/api/pets/like", { 
    method: "POST", 
    body: { petId } 
  });
  return { petId };
}

export async function passPet(petId: string) {
  await request<{ success: boolean }>("/api/pets/pass", { 
    method: "POST", 
    body: { petId } 
  });
  return { petId };
}

export async function superLikePet(petId: string) {
  await request<{ success: boolean }>("/api/pets/super-like", { 
    method: "POST", 
    body: { petId } 
  });
  return { petId };
}

export async function rewindLast(): Promise<Pet | null> {
  try {
    const data = await request<{ restoredPet?: Pet }>("/api/swipe/rewind", { 
      method: "POST" 
    });
    return data?.restoredPet ?? null;
  } catch {
    return null;
  }
}

