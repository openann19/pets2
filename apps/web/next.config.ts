import type { NextConfig } from 'next';
import path from 'path';

const isDemo = process.env['NEXT_PUBLIC_DEMO_MODE'] === '1';

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  swcMinify: true,
  
  // Transpile TypeScript source from workspace packages
  transpilePackages: [
    '@pawfectmatch/core',
    '@pawfectmatch/ui',
    '@pawfectmatch/design-tokens',
    '@core-errors',
  ],

  eslint: {
    ignoreDuringBuilds: isDemo,
  },
  
  typescript: {
    ignoreBuildErrors: isDemo,
  },

  // Performance optimizations
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      '@heroicons/react',
      'lottie-web',
      '@core-errors',
    ],
  },

  // Compress static assets
  compress: true,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  webpack: (config, { isServer }) => {
    // Alias support for @ imports
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
    };
    
    // Deterministic chunk IDs for better caching
    config.optimization.moduleIds = 'deterministic';
    config.optimization.chunkIds = 'deterministic';
    
    // Split chunks for better caching
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: false,
        // Vendor chunk for node_modules
        vendor: {
          name: 'vendor',
          chunks: 'all',
          test: /node_modules/,
          priority: 20,
        },
        // Shared chunk for common code
        common: {
          name: 'common',
          minChunks: 2,
          priority: 10,
          reuseExistingChunk: true,
        },
        // Framer Motion chunk
        framerMotion: {
          name: 'framer-motion',
          test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
          priority: 30,
        },
      },
    };

    return config;
  },
};

export default config;
