#!/bin/bash

# Fix Missing Imports Script
# Systematically fixes all empty import statements

echo "🔧 Fixing missing imports..."

# Fix framer-motion imports
echo "Fixing framer-motion imports..."
find apps/web/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e "s/import {  } from 'framer-motion';/import { motion, AnimatePresence } from 'framer-motion';/g" \
  {} +

# Fix @heroicons/react imports
echo "Fixing @heroicons/react imports..."
find apps/web/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e "s/import {  } from '@heroicons\/react\/24\/outline';/import { HeartIcon, SparklesIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon, ChartBarIcon, StarIcon, ArrowTrendingUpIcon, HomeIcon, UserGroupIcon, MapPinIcon, VideoCameraIcon, VideoCameraSlashIcon, MicrophoneIcon, PhoneXMarkIcon, ArrowsPointingOutIcon } from '@heroicons\/react\/24\/outline';/g" \
  -e "s/import {  } from '@heroicons\/react\/24\/solid';/import { HeartIcon, StarIcon, CheckCircleIcon } from '@heroicons\/react\/24\/solid';/g" \
  {} +

# Fix React Query imports
echo "Fixing React Query imports..."
find apps/web/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e "s/import {  } from '@tanstack\/react-query';/import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack\/react-query';/g" \
  {} +

# Fix socket.io-client imports
echo "Fixing socket.io-client imports..."
find apps/web/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e "s/import {  } from 'socket.io-client';/import type { Socket } from 'socket.io-client';/g" \
  {} +

# Fix custom hook imports
echo "Fixing custom hook imports..."
find apps/web/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e "s/import {  } from '..\/..\/hooks\/useSocket';/import { useSocket } from '..\/..\/hooks\/useSocket';/g" \
  -e "s/import {  } from '..\/hooks\/useSocket';/import { useSocket } from '..\/hooks\/useSocket';/g" \
  -e "s/import {  } from '..\/..\/hooks\/premium-hooks';/import { usePremiumFeatures } from '..\/..\/hooks\/premium-hooks';/g" \
  {} +

# Fix logger imports
echo "Fixing logger imports..."
find apps/web/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e "s/import {  } from '..\/..\/services\/logger';/import { logger } from '..\/..\/services\/logger';/g" \
  -e "s/import {  } from '..\/services\/logger';/import { logger } from '..\/services\/logger';/g" \
  {} +

# Fix auth store imports
echo "Fixing auth store imports..."
find apps/web/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e "s/import {  } from '..\/..\/stores\/auth-store';/import { useAuthStore } from '..\/..\/stores\/auth-store';/g" \
  -e "s/import {  } from '..\/stores\/auth-store';/import { useAuthStore } from '..\/stores\/auth-store';/g" \
  {} +

# Fix animation constants imports
echo "Fixing animation constants imports..."
find apps/web/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e "s/import {  } from '..\/..\/constants\/animations';/import { SPRING_CONFIG, PREMIUM_VARIANTS } from '..\/..\/constants\/animations';/g" \
  {} +

echo "✅ Import fixes complete!"
