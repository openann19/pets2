// Tiny async wrappers for Next 15 server APIs.
// Use these in server code to make the "await" requirement explicit and consistent.
// Example:
//   import { cookies, headers, draftMode } from '@/lib/next-async';
//   const c = await cookies();
//   const h = await headers();
//   const d = await draftMode();
//
// Tip: run `pnpm next15:scan` to find any direct non-awaited usages in the repo.

import {
  cookies as _cookies,
  headers as _headers,
  draftMode as _draftMode,
} from 'next/headers';

type CookiesT = Awaited<ReturnType<typeof _cookies>>;
type HeadersT = Awaited<ReturnType<typeof _headers>>;
type DraftModeT = Awaited<ReturnType<typeof _draftMode>>;

export async function cookies(): Promise<CookiesT> {
  // Next 15 returns a Promise; we forward it (explicit async for clarity).
  return _cookies();
}

export async function headers(): Promise<HeadersT> {
  return _headers();
}

export async function draftMode(): Promise<DraftModeT> {
  return _draftMode();
}

// Optional: convenience helpers to read a cookie/header in one go.
export async function getCookie(name: string): Promise<string | undefined> {
  const c = await cookies();
  return c.get(name)?.value;
}

export async function getHeader(name: string): Promise<string | null> {
  const h = await headers();
  return h.get(name);
}

