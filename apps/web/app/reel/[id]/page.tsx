/**
 * PawReels Watch Page
 * Web page for viewing reels with deep link support
 */

import { Metadata } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Reel {
  id: string;
  mp4_url: string;
  poster_url?: string;
  owner_id: string;
  created_at: string;
  kpi_shares: number;
  kpi_installs: number;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { ref?: string };
}): Promise<Metadata> {
  const reel = await fetch(`${API_URL}/reels/${params.id}`, {
    cache: 'no-store',
  }).then((r) => (r.ok ? r.json() : null));

  if (!reel) {
    return {
      title: 'PawReels • Reel Not Found',
    };
  }

  return {
    title: `PawReels • Watch Reel`,
    description: 'Watch this awesome pet reel on PawfectMatch',
    openGraph: {
      title: 'PawReels • Watch Reel',
      description: 'Watch this awesome pet reel on PawfectMatch',
      videos: reel.mp4_url ? [{ url: reel.mp4_url }] : undefined,
      images: reel.poster_url ? [{ url: reel.poster_url }] : undefined,
      type: 'video.other',
    },
    twitter: {
      card: 'player',
      title: 'PawReels • Watch Reel',
      description: 'Watch this awesome pet reel on PawfectMatch',
      site: '@pawfectmatch',
    },
  };
}

export default async function ReelPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { ref?: string };
}) {
  const reel = await fetch(`${API_URL}/reels/${params.id}`, {
    cache: 'no-store',
  }).then((r) => r.json());

  const ref = searchParams.ref || '';
  const deeplink = `paw.app://reel/${params.id}${ref ? `?ref=${ref}` : ''}`;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-md aspect-[9/16] bg-black relative">
        {reel.mp4_url ? (
          <video
            src={reel.mp4_url}
            controls
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain"
            poster={reel.poster_url}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-6xl mb-4">🎬</div>
              <div className="text-xl">Rendering...</div>
              <div className="text-sm text-gray-400 mt-2">{reel.status}</div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 px-6 w-full max-w-md">
        {/* Deep Link Button */}
        <a
          href={deeplink}
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-center mb-4 transition-colors"
        >
          Open in PawfectMatch App
        </a>

        {/* Share Stats */}
        <div className="flex justify-around text-white text-center">
          <div>
            <div className="text-2xl font-bold">{reel.kpi_shares || 0}</div>
            <div className="text-sm text-gray-400">Shares</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{reel.kpi_installs || 0}</div>
            <div className="text-sm text-gray-400">Installs</div>
          </div>
        </div>

        {/* Copy Link */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied!');
          }}
          className="mt-4 w-full border border-gray-600 text-white py-2 px-6 rounded-lg text-center hover:bg-gray-800 transition-colors"
        >
          Copy Link
        </button>

        {/* Install Attribution */}
        {ref && (
          <div className="mt-4 text-center text-gray-400 text-sm">
            Install attributed to: {ref}
          </div>
        )}
      </div>
    </main>
  );
}

