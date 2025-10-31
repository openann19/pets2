const ASSET_BASE = 'https://images.unsplash.com';

const assetMap: Record<string, string> = {
  'pets/buddy.jpg': `${ASSET_BASE}/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80`,
  'pets/mittens.jpg': `${ASSET_BASE}/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80`,
  'pets/piper.jpg': `${ASSET_BASE}/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=800&q=80`,
  'pets/mochi.jpg': `${ASSET_BASE}/photo-1525253086316-d0c936c814f8?auto=format&fit=crop&w=800&q=80`,
  'avatars/userA.jpg': `${ASSET_BASE}/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80`,
  'avatars/userB.jpg': `${ASSET_BASE}/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80`,
  'avatars/userC.jpg': `${ASSET_BASE}/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=400&q=80`,
};

const fallbackAsset = `${ASSET_BASE}/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80`;

export const getAsset = (key: string): string => {
  const mapped = assetMap[key];
  if (mapped !== undefined) {
    return mapped;
  }
  return fallbackAsset;
};

export const availableAssets = Object.freeze({ ...assetMap });
