import { useEffect, useState, useCallback } from 'react';
import { readJSON, writeJSON } from '../services/storage';

export type Settings = {
  notifications: { matches: boolean; messages: boolean; nearby: boolean };
  privacy: { showAge: boolean; showDistance: boolean; showOnline: boolean };
  premiumHints: boolean;
};

const DEFAULTS: Settings = {
  notifications: { matches: true, messages: true, nearby: true },
  privacy: { showAge: true, showDistance: true, showOnline: true },
  premiumHints: true,
};

const KEY = 'pm_settings_v1';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      setSettings(await readJSON(KEY, DEFAULTS));
      setReady(true);
    })();
  }, []);

  const update = useCallback(async (path: (s: Settings) => void) => {
    setSettings((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as Settings;
      path(copy);
      void writeJSON(KEY, copy);
      return copy;
    });
  }, []);

  return { settings, ready, update };
}
